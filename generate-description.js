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

    const prompt = `你是日本 Costco 商品專家。用繁體中文查詢 Costco 日本商品「${searchQuery}」的信息。

【格式要求】
照抄以下格式，不要改變。每個部分都必須填寫。

商品名稱：[繁體中文翻譯，例如：KOWA 麵包小偷地板坐墊]
日文名稱：[日文原文，例如：KOWA パンどろぼう フロアクッション]
商品編號：${idnumber || "待確認"}

【商品基本信息】
* 品牌/製造商：[必填，例如：KOWA/柴田啟子]
* 內容量/規格：[必填，例如：100 × 57 × 7 cm或500克]
* 類型/分類：[必填，例如：地板坐墊、調味堅果]
* 材質/成分：[必填，例如：麻棉混紡或含杏仁、腰果]
* 用途/功能：[必填，說明使用方式或適用場景]

【詳細描述】
[寫3-4句話介紹這個商品的特色、由來、或使用體驗]

【重要說明】
• [核心特點或賣點1，例如：日本人氣角色周邊]
• [核心特點或賣點2，例如：大尺寸舒適坐墊]
• [核心特點或賣點3，例如：適合全家享用]
• [核心特點或賣點4，例如：Costco限定商品]

【必須注意】
1. 商品名稱必須是繁體中文，不能是日文！
2. 每個【】標題都要包含，不能跳過！
3. 基本信息後面的 * 號必須保留！
4. 重要說明的 • 號必須保留！`;

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
