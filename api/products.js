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

  // 🔥 只保留有 tpric 的資料（關鍵修正）
  const validResults = data.results.filter(page => {
    return page.properties.tpric?.rollup?.array?.length > 0;
  });

  const products = validResults.map(page => {

    const props = page.properties;

    let price = 0;
    const rollup = props.tpric?.rollup?.array;

    if (rollup && rollup.length > 0) {
      const val = rollup[0];

      if (val.type === "number") {
        price = val.number ?? 0;
      } else if (val.type === "rich_text") {
        const text = val.rich_text?.[0]?.plain_text;
        price = Number(text) || 0;
      } else if (val.type === "title") {
        const text = val.title?.[0]?.plain_text;
        price = Number(text) || 0;
      } else if (val.type === "string") {
        price = Number(val.string) || 0;
      }
    }

    return {
      id: page.id,
      name: props.tname?.title?.[0]?.plain_text || "",
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