export default async function handler(req, res) {

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.DATABASE_ID;

  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();

  if (!data.results) {
    return res.status(500).json({
      error: "Notion API failed",
      notionResponse: data
    });
  }

  const products = data.results.map(page => {

    const props = page.properties;

    // 🔥 直接從 Rollup（tpric）抓數字（已修正）
    let price = 0;

    if (props.tpric?.rollup?.array?.length > 0) {
      const val = props.tpric.rollup.array[0];

      if (val.type === "number") {
        price = val.number;
      } else if (val.type === "string") {
        price = Number(val.string) || 0;
      }
    }

    return {
      id: page.id,

      name: props.tname?.title?.[0]?.plain_text || "",

      // 🔥 修正後的價格
      price: price,

      image: props.image?.url || "",

      category: props.category?.select?.name || "",

      description: props.description?.rich_text?.[0]?.plain_text || "",

      isNew: props.isNew?.checkbox || false,

      images: props.images?.rich_text?.[0]?.plain_text
        ? props.images.rich_text[0].plain_text
            .split(",")
            .map(url => url.trim())
            .filter(url => url !== "")
        : []
    };
  });

  res.status(200).json(products);
}