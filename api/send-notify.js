// POST → 寄送訂單通知信
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orderId, customerId, total, items } = req.body;
    const { GMAIL_USER, GMAIL_PASS } = process.env;

    if (!GMAIL_USER || !GMAIL_PASS) return res.status(500).json({ error: "未設定 Gmail 環境變數" });

    // 組合商品明細
    const itemsText = Array.isArray(items)
      ? items.map(i => `  ${i.name}${i.variant ? `（${i.variant}）` : ""} × ${i.qty}  NT$${Math.floor(i.price * i.qty).toLocaleString()}`).join("\n")
      : (items || "");

    const subject = `🛒 新訂單通知 ${orderId}`;
    const body = `W-82 大阪代購 新訂單

訂單編號：${orderId}
客戶編號：${customerId || "—"}
訂單金額：NT$ ${Math.floor(total || 0).toLocaleString()}

商品明細：
${itemsText}

請至後台查看並處理訂單。
https://shop-project-azure.vercel.app/admin.html
`;

    // 用 nodemailer 寄信
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"W-82 訂單系統" <${GMAIL_USER}>`,
      to:   GMAIL_USER,
      subject,
      text: body,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("寄信失敗:", err.message);
    res.status(500).json({ error: err.message });
  }
}
