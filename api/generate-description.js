export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ANTHROPIC_API_KEY } = process.env;
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "API Key 未設定" });
    }

    const { productName } = req.body;
    if (!productName) {
      return res.status(400).json({ error: "請提供商品名稱" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":            "application/json",
        "x-api-key":               ANTHROPIC_API_KEY,
        "anthropic-version":       "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `你是一個日本好市多代購的商品編輯，請根據以下資訊產出商品資料。

商品：${productName}

請按照以下格式輸出，不要加其他說明、不要加 markdown 符號：

商品名稱：[繁體中文商品名稱，簡潔清楚]

商品內容跟特點
• [特點一]
• [特點二]
• [特點三]
• [特點四]
• [特點五]

重量：[重量，例如 1.5kg]
產地：[產地]
內容量：[內容量或數量]
保存方式：[常溫／冷藏／冷凍]`,
        }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "生成失敗" });
    }

    const text = data.content?.[0]?.text || "";
    res.status(200).json({ text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
