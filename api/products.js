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

    // ⭐ 修正：抓完整文字（支援多段 rich_text）
    const getText = (prop) => {
      if (!prop) return "";

      // title
      if (prop.title) {
        return prop.title.map(t => t.plain_text).join("");
      }

      // rich_text（重點）
      if (prop.rich_text) {
        return prop.rich_text.map(t => t.plain_text).join("\n");
      }

      return "";
    };

    const getNumber = (prop) => {
      if (!prop) return 0;

      if (prop.type === "number") return prop.number || 0;

      if (prop.type === "formula") {
        if (prop.formula.type === "number") {
          return prop.formula.number || 0;
        }
      }

      return 0;
    };

    const getCheckbox = (prop) => prop?.checkbox || false;

    // ⭐ 單圖（支援 URL / rich_text）
    const getImage = (prop) => {
      if (!prop) return "";

      if (prop.type === "url") return prop.url || "";

      return (
        prop?.title?.map(t => t.plain_text).join("") ||
        prop?.rich_text?.map(t => t.plain_text).join("") ||
        ""
      );
    };

    // ⭐ 多圖（逗號分隔）
    const getImages = (prop) => {
      const text = getText(prop);
      if (!text) return [];
      return text.split(",").map(s => s.trim()).filter(Boolean);
    };

    const products = data.results.map((page) => {
      const props = page.properties;

      const isSale = getCheckbox(props.Sale);
      const price = getNumber(props.tprice);
      const sprice = getNumber(props.sprice);

      return {
        id: page.id,
        name: getText(props.tname),

        // ⭐ description（現在會完整顯示）
        description: getText(props.description),

        // ⭐ 價格邏輯
        price: isSale ? sprice || price : price,
        originalPrice: price,
        isSale,

        // ⭐ 新商品
        isNew: getCheckbox(props.isNew),

        image: getImage(props.image),
        images: getImages(props.images),

        createdTime: page.created_time,
      };
    });

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}