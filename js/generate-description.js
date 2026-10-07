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

    const prompt = `你是日本 Costco 商品專家。搜尋 Costco 日本商品「${searchQuery}」。

【必須用繁體中文回覆】【照抄以下格式】

商品名稱：[用繁體中文翻譯，例如：KOWA 麵包小偷地板坐墊]
日文名稱：[原日文名稱，例如：KOWA パンどろぼう フロアクッション]
商品編號：${idnumber || "待查詢"}

【商品基本信息】
* 品牌/製造商：[品牌名稱]
* 內容量/規格：[例如：126g × 3袋，共378g]
* 類型/商品類別：[類型]
* 用途/功能：[說明用途]
* [其他重要規格，例如尺寸/厚度/材質]

【詳細描述】
[2-3行的商品詳細說明，包括材料、特色、適用人群等]

【重要說明】
[3-4條商品的核心特點或賣點]
• [特點1]
• [特點2]
• [特點3]
• [特點4]

【重要提醒】商品名稱一定要是繁體中文翻譯，不能是日文！`;

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
            content: "您是一個精通日本 Costco 商品的專業助手。請根據商品編號和日文名稱查詢 Costco 日本的真實商品信息，並用繁體中文提供準確、詳細的商品描述。必須提供中文翻譯的商品名稱，不能使用日文。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
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
