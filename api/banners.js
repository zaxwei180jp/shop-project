export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { NOTION_TOKEN, BANNER_DATABASE_ID } = process.env;

    const response = await fetch(
      `https://api.notion.com/v1/databases/${BANNER_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(req.query.all !== "1" ? {
            filter: {
              property: "isActive",
              checkbox: { equals: true },
            },
          } : {}),
          sorts: [{ property: "order", direction: "ascending" }],
        }),
      }
    );

    const data = await response.json();

    const getText = (prop) => {
      if (!prop) return "";
      if (prop.title)     return prop.title.map(t => t.plain_text).join("");
      if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join("");
      return "";
    };

    const banners = data.results.map(page => ({
      pageId:   page.id,
      title:    getText(page.properties.title),
      image:    getText(page.properties.image),
      order:    page.properties.order?.number ?? 99,
      isActive: page.properties.isActive?.checkbox ?? false,
    }));

    res.status(200).json(banners);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
