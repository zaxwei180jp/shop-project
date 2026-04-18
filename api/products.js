export default async function handler(req, res) {
  try {
    const { NOTION_TOKEN, DATABASE_ID } = process.env;

    if (!NOTION_TOKEN || !DATABASE_ID) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

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

    if (!data?.results) {
      return res.status(500).json({
        error: "Notion API failed",
        notionResponse: data,
      });
    }

    const products = data.results.map(formatProduct);

    return res.status(200).json(products);

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/* ---------- Helper Functions ---------- */

function formatProduct(page) {
  const props = page.properties;

  return {
    id: page.id,
    name: getText(props.tname),
    price: getNumber(props.tprice),
    image: props.image?.url || "",
    category: props.category?.select?.name || "",
    description: getRichText(props.description),
    isNew: props.isNew?.checkbox || false,
    images: parseImages(props.images),
  };
}

function getText(field) {
  return field?.title?.[0]?.plain_text || "";
}

function getRichText(field) {
  return field?.rich_text?.[0]?.plain_text || "";
}

function getNumber(field) {
  return field?.number || 0;
}

function parseImages(field) {
  const raw = field?.rich_text?.[0]?.plain_text;
  if (!raw) return [];

  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}