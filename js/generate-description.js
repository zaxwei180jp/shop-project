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

    const prompt = `你是日本 Costco 商品專家兼銷售文案寫手。用繁體中文詳細查詢並介紹 Costco 日本商品「${searchQuery}」。

【格式要求】
完整填寫以下格式，不要跳過任何部分。每個【】部分都必須有豐富內容。

商品名稱：[用繁體中文翻譯，例如：Johnson's Body 嬌生身體香氛乳液]
日文名稱：[日文原文完整版本]
商品編號：${idnumber || "待查詢"}

【商品基本信息】
* 品牌/製造商：[品牌名稱 + 日文原文]
* 系列名稱：[例如：Vibrant Radiance系列]
* 內容量/規格：[總容量和組成，例如：500mL x 2瓶 + 200mL x 1瓶，共1,200mL]
* 商品類型：[例如：香氛身體乳/保濕乳液]
* 香味/香氣：[詳細說明，例如：茉莉花 + 白百合]
* 關鍵成分或特性：[例如：保濕成分、溫和配方]

【詳細描述】
[詳細介紹（5-7句話）：
1. 這是什麼牌子的什麼產品
2. Vibrant Radiance 系列的特色和定位
3. 香味的特色和組合原因
4. 適合什麼人群使用
5. 為什麼 Costco 會販售這個產品（大容量優惠）
6. 使用體驗或市場評價]

【主要特色】
[用具體詞彙說明 2-3 個核心特色]

【香味說明】
* Jasmine 茉莉花：[簡述特色]
* White Lily 白百合：[簡述特色]
[說明這個香味組合的意義]

【使用方式和適用場景】
[說明適合日常使用的場景，例如：淋浴後保濕、全身護理等]

【為什麼選擇這款】
[2-3個購買理由，例如：大容量划算、高級香氛品牌、Costco限定等]

【必須注意】
1. 商品名稱【一定要】是繁體中文翻譯，不能是日文！
2. 所有【】標題都要保留，內容要詳細豐富！
3. 提供具體信息而不是模糊說法（例如：「500mL x 2」而不是「大容量」）
4. 從消費者角度寫得有吸引力！`;

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
