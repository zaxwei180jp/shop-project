export default async function handler(req, res) {
  try {
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const DATABASE_ID = process.env.DATABASE_ID;

    // =========================
    // Query Notion Database
    // =========================

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

    // =========================
    // Error Handling
    // =========================

    if (!response.ok) {
      console.error("Notion API Error:", data);

      return res.status(response.status).json({
        error: data.message || "Notion API Error",
        detail: data,
      });
    }

    if (!data.results || !Array.isArray(data.results)) {
      return res.status(500).json({
        error: "Invalid Notion response",
        detail: data,
      });
    }

    // =========================
    // Helper Functions
    // =========================

    // rich_text / title
    function getText(prop) {
      if (!prop) return "";

      // title
      if (prop.title && Array.isArray(prop.title)) {
        return prop.title.map((t) => t.plain_text).join("");
      }

      // rich_text
      if (prop.rich_text && Array.isArray(prop.rich_text)) {
        return prop.rich_text.map((t) => t.plain_text).join("");
      }

      return "";
    }

    // number / formula number
    function getNumber(prop) {
      if (!prop) return 0;

      // normal number
      if (typeof prop.number === "number") {
        return prop.number;
      }

      // formula number
      if (
        prop.formula &&
        prop.formula.type === "number" &&
        typeof prop.formula.number === "number"
      ) {
        return prop.formula.number;
      }

      return 0;
    }

    // checkbox
    function getCheckbox(prop) {
      if (!prop) return false;

      return prop.checkbox === true;
    }

    // date
    function getDate(prop) {
      if (!prop || !prop.date) return null;

      return prop.date.start;
    }

    // 單圖
    function getImage(prop) {
      const text = getText(prop);

      return text || "";
    }

    // 多圖
    function getImages(prop) {
      const text = getText(prop);

      if (!text) return [];

      return text
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    }

    // =========================
    // Mapping Data
    // =========================

    const products = data.results.map((page) => {
      const props = page.properties;

      return {
        id: page.id,

        // 商品名稱
        name: getText(props["tname"]),

        // 商品描述
        description: getText(props["description"]),

        // 原價
        price: getNumber(props["tprice"]),

        // 特價
        salePrice: getNumber(props["sprice"]),

        // 是否特價
        isSale: getCheckbox(props["isSale"]),

        // 是否新品
        isNew: getCheckbox(props["isNew"]),

        // 是否熱賣
        isHot: getCheckbox(props["isHot"]),

        // 主圖
        image: getImage(props["indexPic"]),

        // 多圖
        images: getImages(props["goodsPic"]),

        // 更新日期
        update: getDate(props["update"]),

        // 建立時間
        createdTime: page.created_time,
      };
    });

    // =========================
    // Sort by update desc
    // =========================

    products.sort((a, b) => {
      const da = new Date(a.update || a.createdTime);
      const db = new Date(b.update || b.createdTime);

      return db - da;
    });

    // =========================
    // Response
    // =========================

    return res.status(200).json(products);

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}
