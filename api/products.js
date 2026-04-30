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

    const getCheckbox = (prop) => prop?.checkbox || false;

    const getImage = (prop) => {
      if (!prop) return "";
      if (prop.type === "url") return prop.url || "";
      return (
        prop?.title?.[0]?.plain_text ||
        prop?.rich_text?.[0]?.plain_text ||
        ""
      );
    };

    const getImages = (prop) => {
      const text = getText(prop);
      if (!text) return [];
      return text.split(",").map(s => s.trim()).filter(Boolean);
    };

    const products = data.results.map(page => {
      const props = page.properties;

      const isSale = getCheckbox(props.Sale);
      const price = getNumber(props.tprice);
      const sprice = getNumber(props.sprice);

      return {
        id: page.id,
        name: getText(props.tname),
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