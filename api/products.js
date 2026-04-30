export default async function handler(req, res) {
  try {
    const { NOTION_TOKEN, DATABASE_ID } = process.env;

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

    const getText = (prop) =>
      prop?.title?.[0]?.plain_text ||
      prop?.rich_text?.[0]?.plain_text ||
      "";

    const getNumber = (prop) => {
      if (!prop) return 0;
      if (prop.type === "number") return prop.number || 0;

      if (prop.type === "formula") {
        if (prop.formula.type === "number") return prop.formula.number || 0;
      }

      return 0;
    };

    // ⭐ 單一圖片（URL文字）
    const getImage = (prop) => getText(prop);

    // ⭐ 多圖（逗號分隔）
    const getImages = (prop) => {
      const text = getText(prop);
      if (!text) return [];
      return text.split(",").map((s) => s.trim()).filter(Boolean);
    };

    const products = data.results.map((page) => {
      const props = page.properties;

      const image = getImage(props.image);   // ⭐ 主圖只吃這個
      const images = getImages(props.images);

      return {
        id: page.id,
        name: getText(props.tname),
        price: getNumber(props.tprice),
        description: getText(props.description),

        // ✅ 主圖 ONLY image（你要求的）
        image: image || "",

        // ✅ 縮圖（沒有就 fallback 主圖）
        images: images.length
          ? images
          : image
          ? [image]
          : [],

        createdTime: page.created_time,
      };
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}