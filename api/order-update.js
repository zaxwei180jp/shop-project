export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { NOTION_TOKEN } = process.env;
    const { pageId, status } = req.body;

    if (!pageId || !status) {
      return res.status(400).json({ error: "缺少 pageId 或 status" });
    }

    const VALID_STATUS = ["待處理", "處理中", "已出貨", "已完成", "已取消"];
    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: "無效的狀態值" });
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          status: { select: { name: status } },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.message || "更新失敗" });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
