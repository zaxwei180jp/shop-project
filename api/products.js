import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

/* ---------------- helpers ---------------- */

function getText(field) {
  if (!field) return "";

  // rich_text
  if (field.type === "rich_text") {
    return field.rich_text.map((t) => t.plain_text).join("");
  }

  // title
  if (field.type === "title") {
    return field.title.map((t) => t.plain_text).join("");
  }

  return "";
}

function getCheckbox(field) {
  return field?.checkbox || false;
}

function getNumber(field) {
  if (!field) return 0;

  // number
  if (field.type === "number") {
    return field.number || 0;
  }

  // formula
  if (field.type === "formula") {
    return field.formula?.number || 0;
  }

  return 0;
}

function getImages(field) {
  const text = getText(field);

  if (!text) return [];

  return text
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/* ---------------- api ---------------- */

export default async function handler(req, res) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const products = response.results.map((page) => {
      const props = page.properties;

      return {
        id: page.id,

        // 商品名稱
        name: getText(props.tname),

        // 商品描述
        description: getText(props.description),

        // 價格
        price: getNumber(props.tprice),

        // 原價
        originalPrice: getNumber(props.tprice),

        // 是否特價
        isSale: getCheckbox(props.isSale),

        // 是否新品 / 熱賣
        isNew: getCheckbox(props.isNew),

        // 首圖
        image: getText(props.indexPic),

        // 商品圖陣列
        images: getImages(props.goodsPic),

        // 建立時間
        createdTime: page.created_time,

        // 更新時間
        update: props.update?.date?.start || null,
      };
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Notion API Error:", error);

    res.status(500).json({
      error: "Failed to fetch products",
      details: error.message,
    });
  }
}
