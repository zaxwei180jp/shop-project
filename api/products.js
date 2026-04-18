export default async function handler(req, res) {
  try {
    const NOTION_API_KEY = process.env.NOTION_API_KEY;
    const DATABASE_ID = process.env.DATABASE_ID;

    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    // 👉 防爆處理（重點）
    const products = (data.results || []).map(item => {
      const props = item.properties || {};

      return {
        id: item.id,
        name: props.name?.title?.[0]?.plain_text || "未命名商品",
        price: props.price?.number || 0,
        image: props.image?.url || "https://picsum.photos/300",
        category: props.category?.select?.name || "",
        description: props.description?.rich_text?.[0]?.plain_text || ""
      };
    });

    res.status(200).json(products);

  } catch (error) {
    console.error("API ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}