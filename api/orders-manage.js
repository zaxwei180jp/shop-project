// GET  ?type=list               → 所有訂單列表
// GET  ?type=query&orderId=xxx  → 查詢單筆訂單
// POST                          → 建立新訂單
// PATCH                         → 更新訂單狀態

export default async function handler(req, res) {
  try {
    const { NOTION_TOKEN, ORDERS_DATABASE_ID } = process.env;

    const getText = (prop) => {
      if (!prop) return "";
      if (prop.title)     return prop.title.map(t => t.plain_text).join("");
      if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join("\n");
      return "";
    };

    // ── GET list：所有訂單 ────────────────────────────
    if (req.method === "GET" && req.query.type === "list") {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${ORDERS_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sorts: [{ timestamp: "created_time", direction: "descending" }],
            page_size: 100,
          }),
        }
      );
      const data = await response.json();
      const orders = data.results.map(page => {
        const props = page.properties;
        return {
          pageId:    page.id,
          orderId:   getText(props.orderId),
          name:      getText(props.name),
          phone:     props.phone?.phone_number || "",
          email:     props.email?.email || "",
          address:   getText(props.address),
          note:      getText(props.note),
          items:     getText(props.items),
          total:     props.total?.number || 0,
          status:    props.status?.select?.name || "待處理",
          createdAt: page.created_time,
        };
      });
      return res.status(200).json(orders);
    }

    // ── GET query：查詢單筆訂單 ───────────────────────
    if (req.method === "GET" && req.query.type === "query") {
      const { orderId } = req.query;
      if (!orderId) return res.status(400).json({ error: "請提供訂單編號" });
      const response = await fetch(
        `https://api.notion.com/v1/databases/${ORDERS_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter: { property: "orderId", title: { equals: orderId.trim().toUpperCase() } },
          }),
        }
      );
      const data = await response.json();
      if (!data.results?.length) return res.status(404).json({ error: "找不到此訂單編號" });
      const page  = data.results[0];
      const props = page.properties;
      return res.status(200).json({
        orderId:   getText(props.orderId),
        name:      getText(props.name),
        address:   getText(props.address),
        items:     getText(props.items),
        total:     props.total?.number || 0,
        status:    props.status?.select?.name || "待處理",
        createdAt: page.created_time,
      });
    }

    // ── POST：建立訂單 ────────────────────────────────
    if (req.method === "POST") {
      const { orderId, name, phone, email, address, note, items, total } = req.body;
      const itemsText = items.map(i => `${i.name} × ${i.qty}（${i.price}）`).join("\n");
      const response = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent: { database_id: ORDERS_DATABASE_ID },
          properties: {
            orderId:  { title:      [{ text: { content: orderId } }] },
            name:     { rich_text:  [{ text: { content: name } }] },
            phone:    { phone_number: phone },
            email:    { email },
            address:  { rich_text:  [{ text: { content: address } }] },
            note:     { rich_text:  [{ text: { content: note || "" } }] },
            items:    { rich_text:  [{ text: { content: itemsText } }] },
            total:    { number: total },
            status:   { select: { name: "待處理" } },
          },
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        return res.status(500).json({ error: err.message || "Notion 寫入失敗" });
      }
      return res.status(200).json({ success: true, orderId });
    }

    // ── PATCH：更新訂單狀態 ───────────────────────────
    if (req.method === "PATCH") {
      const { pageId, status } = req.body;
      if (!pageId || !status) return res.status(400).json({ error: "缺少 pageId 或 status" });
      const VALID = ["待處理","處理中","已出貨","已完成","已取消"];
      if (!VALID.includes(status)) return res.status(400).json({ error: "無效狀態值" });
      const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties: { status: { select: { name: status } } } }),
      });
      if (!response.ok) {
        const err = await response.json();
        return res.status(500).json({ error: err.message || "更新失敗" });
      }
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
