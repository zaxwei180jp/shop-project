export default async function handler(req, res) {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const DATABASE_ID = process.env.DATABASE_ID;

    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    const products = (data.results || []).map((page) => {
      const props = page.properties || {};

      // ⭐ name
      let name = "";
      if (props.name?.title?.length > 0) {
        name = props.name.title[0].plain_text;
      }

      // ⭐ price
      let price = props.price?.number || 0;

      // ⭐ image（最容易炸）
      let image = "";
      if (props.image?.url) {
        image = props.image.url;
      } else if (props.image?.files?.[0]?.file?.url) {
        image = props.image.files[0].file.url;
      } else if (props.image?.rich_text?.[0]?.plain_text) {
        image = props.image.rich_text[0].plain_text;
      }

      // ⭐ description
      let description = "";
      if (props.description?.rich_text?.length > 0) {
        description = props.description.rich_text[0].plain_text;
      }

      // ⭐ category
      let category = props.category?.select?.name || "";

      // ⭐ 多圖（超安全）
      let images = [];
      if (props.images?.rich_text?.length > 0) {
        images = props.images.rich_text[0].plain_text.split(",");
      }

      return {
        id: page.id,
        name,
        price,
        image,
        category,
        description,
        images,
      };
    });

    res.status(200).json(products);

  } catch (err) {
    console.error("🔥 API ERROR:", err);
    res.status(500).json({
      error: "API crashed",
      message: err.message,
    });
  }
}