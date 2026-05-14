export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { NOTION_TOKEN, ORDERS_DATABASE_ID } = process.env;

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

    const getText = (prop) => {
      if (!prop) return "";
      if (prop.title)     return prop.title.map(t => t.plain_text).join("");
      if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join("\n");
      return "";
    };

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

    res.status(200).json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
