import { verifyPage } from "../lib/notion-verify.js";

// 取得「最前面」的排序值：所有商品 sort 的最小正數 - 1（sort 越小越前面）
async function frontSortValue(NOTION_TOKEN, DATABASE_ID) {
  const headers = {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
  let min = Infinity;
  let cursor;
  do {
    const body = { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
    const r = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST", headers, body: JSON.stringify(body),
    });
    const d = await r.json();
    for (const page of d.results || []) {
      const v = page.properties?.sort?.number;
      if (v && v < min) min = v;
    }
    cursor = d.has_more ? d.next_cursor : undefined;
  } while (cursor);
  if (min === Infinity) return 1;
  const next = min - 1;
  return next === 0 ? -1 : next; // 0 會被前台當成「未排序」排到最後，所以跳過
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { NOTION_TOKEN, DATABASE_ID } = process.env;
    const {
      tname, jname, jprice, jsprice, idnumber,
      mainCategory, category,
      description,
      image, images,
      weight,
      isView, isHot, isSale, isNew, saleEnd,
    } = req.body;

    if (!tname) {
      return res.status(400).json({ error: "商品名稱為必填" });
    }

    // 新品 / 特價 / 熱賣 → 排到最前面
    const sortVal = (isNew || isHot || isSale)
      ? await frontSortValue(NOTION_TOKEN, DATABASE_ID)
      : null;

    const properties = {
      tname: {
        title: [{ text: { content: tname } }],
      },
      jname: { rich_text: [{ text: { content: jname || "" } }] },
      jprice: {
        number: Number(jprice) || 0,
      },
      jsprice: {
        number: Number(jsprice) || 0,
      },
      description: {
        rich_text: [{ text: { content: description || "" } }],
      },
      image: {
        rich_text: [{ text: { content: image || "" } }],
      },
      images: {
        rich_text: [{ text: { content: images || "" } }],
      },
      mainCategory: {
        select: mainCategory ? { name: mainCategory } : null,
      },
      category: {
        select: category ? { name: category } : null,
      },
      weight: {
        number: Number(weight) || 0,
      },
      idnumber: { rich_text: [{ text: { content: idnumber ? String(idnumber) : '' } }] },
      isView:  { checkbox: !!isView },
      isHot:   { checkbox: !!isHot  },
      isSale:  { checkbox: !!isSale },
      isNew:   { checkbox: !!isNew  },
      ...(saleEnd ? { saleEnd: { date: { start: saleEnd } } } : {}),
      ...(sortVal !== null ? { sort: { number: sortVal } } : {}),
      update: {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.message || "Notion 寫入失敗" });
    }

    // 回讀 Notion 確認新商品已存在且內容正確，才回報成功
    const v = await verifyPage(NOTION_TOKEN, data.id, properties);
    if (!v.ok) {
      return res.status(500).json({ error: "Notion 尚未確認新增，請到商品管理確認後再試", mismatches: v.mismatches });
    }

    res.status(200).json({ success: true, id: data.id, verified: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
