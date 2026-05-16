export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { NOTION_TOKEN, BANNER_DATABASE_ID } = process.env;
    const { title, image, order } = req.body;

    if (!image) return res.status(400).json({ error: "圖片網址為必填" });

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: BANNER_DATABASE_ID },
        properties: {
          title:    { title:     [{ text: { content: title || "Banner" } }] },
          image:    { rich_text: [{ text: { content: image } }] },
          order:    { number: Number(order) || 99 },
          isActive: { checkbox: true },
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.message || "新增失敗" });

    res.status(200).json({ success: true, pageId: data.id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
