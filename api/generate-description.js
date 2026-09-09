export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { OPENAI_API_KEY } = process.env;
    if (!OPENAI_API_KEY) return res.status(500).json({ error: "OpenAI API Key 未設定" });

    const { productName, jname, idnumber } = req.body;

    // 組合搜尋關鍵字
    const searchQuery = [jname, idnumber].filter(Boolean).join(" ") || productName;
    if (!searchQuery) return res.status(400).json({ error: "請提供商品資訊" });

    const prompt = `你是日本 Costco 商品專家。搜尋商品「${searchQuery}」。

必須用繁體中文回覆。每行只有一個信息。格式如下（照抄格式）：

商品名稱：米老鼠葡萄乾混合包
日文名稱：ミッキーマウスレーズンミックス
商品編號：12345

商品內容跟特點
• 大容量500克，共50粒
• 含有葡萄乾、蔓越莓、黑醋栗
• 天然果乾，無添加糖
• 適合全家享用
• 方便攜帶

只輸出這個格式，不要加入編號在名稱裡。`;

    // 調用 OpenAI ChatGPT API（gpt-3.5-turbo）
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "您是一個精通日本 Costco 商品的助手。請提供準確的商品信息。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.error?.message || "生成失敗";
      return res.status(response.status).json({ error: errorMsg });
    }

    // 從 OpenAI 響應中提取文本
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    
    if (!text) {
      return res.status(500).json({ error: "未能生成商品描述" });
    }

    res.status(200).json({ text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
