export default async function handler(req, res) {
  try {
    const { NOTION_TOKEN, DATABASE_ID } = process.env;

    const notionRes = await fetch(
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

    const data = await notionRes.json();

    const products = data.results.map((page) => {
      const props = page.properties;

      return {
        id: page.id,

        // 名稱
        name: props.tname?.title?.[0]?.plain_text || "無名稱",

        // 價格
        price: props.tprice?.number || 0,

        // 原價（特價用）
        originalPrice: props.originalPrice?.number || 0,

        // 分類
        category: props.category?.select?.name || "",

        // ⭐ 新商品
        isNew: props.isNew?.checkbox || false,

        // ⭐ 特價
        isSale: props.isSale?.checkbox || false,

        // ⭐🔥 熱賣（你缺這個）
        hot: props.hot?.checkbox || false,

        // 圖片
        image: page.cover?.external?.url || page.cover?.file?.url || "",

        // 多圖
        images: props.images?.files?.map(f =>
          f.external?.url || f.file?.url
        ) || [],

        // 描述
        description: props.description?.rich_text?.[0]?.plain_text || "",

        createdTime: page.created_time,
        update: props.update?.date?.start || page.created_time,
      };
    });

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}