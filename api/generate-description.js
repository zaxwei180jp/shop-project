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

【必須用繁體中文回覆】【每行一個信息】

步驟：
1. 查詢日文商品名稱
2. 將日文商品名稱翻譯成繁體中文
3. 輸出如下格式（照抄格式不要加編號）：

商品名稱：[繁體中文翻譯名稱，例如：萬聖節果凍糖混合包]
日文名稱：[日文原名，例如：ハロウィーンこんにゃくゼリーミックス]
商品編號：[編號，例如：12345]

商品內容跟特點
• [特點1]
• [特點2]
• [特點3]
• [特點4]
• [特點5]

【重要】商品名稱欄只能寫中文，不能寫日文！`;

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
