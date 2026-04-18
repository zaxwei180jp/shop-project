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

    // ⭐ 直接把 Notion 回傳印出來
    console.log("NOTION RESPONSE:", JSON.stringify(data, null, 2));

    // ❗ 如果沒有 results，直接回錯誤
    if (!data.results) {
      return res.status(500).json({
        error: "Notion API failed",
        notionResponse: data
      });
    }

    const products = data.results.map((page) => {
      const props = page.properties || {};

      return {
        id: page.id,
        name: props.name?.title?.[0]?.plain_text || "",
        price: props.price?.number || 0,
        image: "",
        category: "",
        description: "",
        images: []
      };
    });

    res.status(200).json(products);

  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}