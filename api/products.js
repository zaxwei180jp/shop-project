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

      if (prop.type === "rollup") {
        if (prop.rollup.type === "number") return prop.rollup.number || 0;

        if (prop.rollup.type === "array") {
          return prop.rollup.array.reduce((sum, item) => {
            if (item.type === "number") return sum + (item.number || 0);
            return sum;
          }, 0);
        }
      }

      return 0;
    };

    const getFiles = (prop) => {
      if (!prop?.files) return [];
      return prop.files.map((f) => f.file?.url || f.external?.url).filter(Boolean);
    };

    const products = data.results.map((page) => {
      const props = page.properties;

      const images = getFiles(props.images);
      const cover = getFiles(props.image)[0] || images[0] || "";

      return {
        id: page.id,
        name: getText(props.tname),
        price: getNumber(props.tprice),
        category: props.category?.select?.name || "",
        description: getText(props.description),
        image: cover,
        images: images.length ? images : cover ? [cover] : [],
        createdTime: page.created_time,
      };
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}