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

    // ===== 工具區 =====

    // ⭐ 文字（title / rich_text / rollup）
    const getText = (prop) => {
      if (!prop) return "";

      if (prop.type === "title") {
        return prop.title.map(t => t.plain_text).join("");
      }

      if (prop.type === "rich_text") {
        return prop.rich_text.map(t => t.plain_text).join("\n");
      }

      // ⭐ rollup（文字）
      if (prop.type === "rollup") {
        if (prop.rollup.type === "array") {
          return prop.rollup.array
            .map(item => {
              if (item.type === "title") {
                return item.title.map(t => t.plain_text).join("");
              }
              if (item.type === "rich_text") {
                return item.rich_text.map(t => t.plain_text).join("");
              }
              return "";
            })
            .join(", ");
        }
      }

      return "";
    };

    // ⭐ 數字（number / formula / rollup）
    const getNumber = (prop) => {
      if (!prop) return 0;

      if (prop.type === "number") return prop.number || 0;

      if (prop.type === "formula") {
        if (prop.formula.type === "number") {
          return prop.formula.number || 0;
        }
      }

      // ⭐ rollup（數字）
      if (prop.type === "rollup") {
        if (prop.rollup.type === "number") {
          return prop.rollup.number || 0;
        }

        if (prop.rollup.type === "array") {
          const first = prop.rollup.array[0];
          if (first?.type === "number") return first.number || 0;
        }
      }

      return 0;
    };

    // ⭐ checkbox
    const getCheckbox = (prop) => prop?.checkbox || false;

    // ⭐ 日期
    const getDate = (prop) => {
      if (!prop || prop.type !== "date") return null;
      return prop.date?.start || null;
    };

    // ⭐ 圖片（files / url / rollup）
    const getImage = (prop) => {
      if (!prop) return "";

      // files（Notion 上傳圖片）
      if (prop.type === "files") {
        const file = prop.files[0];
        if (!file) return "";

        if (file.type === "external") return file.external.url;
        if (file.type === "file") return file.file.url;
      }

      // url
      if (prop.type === "url") return prop.url || "";

      // ⭐ rollup（圖片）
      if (prop.type === "rollup") {
        if (prop.rollup.type === "array") {
          const first = prop.rollup.array[0];

          if (!first) return "";

          if (first.type === "files") {
            const file = first.files?.[0];
            if (!file) return "";

            if (file.type === "external") return file.external.url;
            if (file.type === "file") return file.file.url;
          }

          if (first.type === "url") return first.url || "";
        }
      }

      return "";
    };

    // ⭐ 多圖（用逗號分隔）
    const getImages = (prop) => {
      const text = getText(prop);
      if (!text) return [];
      return text.split(",").map(s => s.trim()).filter(Boolean);
    };

    // ===== 資料整理 =====

    const products = data.results.map((page) => {
      const props = page.properties;

      const isSale = getCheckbox(props.Sale);
      const price = getNumber(props.tprice);
      const sprice = getNumber(props.sprice);

      return {
        id: page.id,

        name: getText(props.tname),
        description: getText(props.description),

        price: isSale ? (sprice || price) : price,
        originalPrice: price,
        isSale,

        isNew: getCheckbox(props.isNew),

        image: getImage(props.image),
        images: getImages(props.images),

        createdTime: page.created_time,
        update: getDate(props.update),
      };
    });

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}