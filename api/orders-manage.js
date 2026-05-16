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
          orderId:    getText(props.orderId),
          customerId: getText(props.customerId),
          items:      getText(props.items),
          total:      props.total?.number || 0,
          status:     props.status?.select?.name || "待處理",
          createdAt:  page.created_time,
        };
      });
      return res.status(200).json(orders);
    }

    // ── GET query：用訂單編號或客戶編號查詢 ──────────
    if (req.method === "GET" && req.query.type === "query") {
      const { orderId, customerId } = req.query;

      if (!orderId && !customerId)
        return res.status(400).json({ error: "請提供訂單編號或客戶編號" });

      // 組合 filter
      const filter = orderId
        ? { property: "orderId",    title:     { equals: orderId.trim().toUpperCase() } }
        : { property: "customerId", rich_text: { equals: customerId.trim() } };

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
            filter,
            sorts: [{ timestamp: "created_time", direction: "descending" }],
          }),
        }
      );
      const data = await response.json();
      if (!data.results?.length)
        return res.status(404).json({ error: orderId ? "找不到此訂單編號" : "找不到此客戶編號的訂單" });

      // 客戶編號查詢可能有多筆，回傳陣列
      const orders = data.results.map(page => {
        const props = page.properties;
        return {
          orderId:    getText(props.orderId),
          customerId: getText(props.customerId),
          items:      getText(props.items),
          total:      props.total?.number || 0,
          status:     props.status?.select?.name || "待處理",
          createdAt:  page.created_time,
        };
      });

      // 訂單編號查詢回傳單筆，客戶編號查詢回傳陣列
      return res.status(200).json(orderId ? orders[0] : orders);
    }

    // ── POST：建立訂單 ────────────────────────────────
    if (req.method === "POST") {
      const { orderId, customerId, items, total } = req.body;
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
            orderId:    { title:     [{ text: { content: orderId } }] },
            customerId: { rich_text: [{ text: { content: customerId || "" } }] },
            items:      { rich_text: [{ text: { content: itemsText } }] },
            total:      { number: total },
            status:     { select: { name: "待處理" } },
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

    // ── DELETE：刪除訂單（archive）────────────────────
    if (req.method === "DELETE") {
      const { pageId } = req.body;
      if (!pageId) return res.status(400).json({ error: "缺少 pageId" });
      const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: true }),
      });
      if (!response.ok) {
        const err = await response.json();
        return res.status(500).json({ error: err.message || "刪除失敗" });
      }
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
