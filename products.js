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

    // 🔥 Debug：完整印出 tpric（關鍵）
    console.log("====== DEBUG START ======");
    console.log("完整 tpric:", JSON.stringify(props.tpric, null, 2));
    console.log("====== DEBUG END ======");

    // 🔥 最保險抓法（逐層拆）
    let price = 0;

    const rollup = props.tpric?.rollup;

    if (rollup && rollup.array && rollup.array.length > 0) {
      const val = rollup.array[0];

      // 👉 情況1：number
      if (val.type === "number") {
        price = val.number ?? 0;
      }

      // 👉 情況2：rich_text
      else if (val.type === "rich_text") {
        const text = val.rich_text?.[0]?.plain_text;
        price = Number(text) || 0;
      }

      // 👉 情況3：title
      else if (val.type === "title") {
        const text = val.title?.[0]?.plain_text;
        price = Number(text) || 0;
      }

      // 👉 情況4：string
      else if (val.type === "string") {
        price = Number(val.string) || 0;
      }

      // 👉 情況5：其他（直接印出來）
      else {
        console.log("未知型別:", val);
      }
    } else {
      console.log("⚠️ tpric 是空的（rollup 沒資料）");
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