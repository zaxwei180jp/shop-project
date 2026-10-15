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

import { verifyPage } from "../lib/notion-verify.js";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { NOTION_TOKEN, DATABASE_ID } = process.env;
    const { pageId, ...fields } = req.body;

    if (!pageId) return res.status(400).json({ error: "缺少 pageId" });

    // 狀態從「關」變成「開」（新品/特價/熱賣）→ 排到最前面
    const statusKeys = ["isNew", "isHot", "isSale"];
    if (statusKeys.some(k => fields[k] !== undefined)) {
      const pr = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
        },
      });
      const pd = await pr.json();
      const prev = Object.fromEntries(statusKeys.map(k => [k, !!pd.properties?.[k]?.checkbox]));
      const turnedOn = statusKeys.some(k => fields[k] !== undefined && !!fields[k] && !prev[k]);
      if (turnedOn) fields.sort = await frontSortValue(NOTION_TOKEN, DATABASE_ID);
    }

    const properties = {};

    if (fields.tname !== undefined)
      properties.tname = { title: [{ text: { content: fields.tname } }] };
    if (fields.jprice !== undefined)
      properties.jprice = { number: Number(fields.jprice) || 0 };
    if (fields.jsprice !== undefined)
      properties.jsprice = { number: Number(fields.jsprice) || 0 };
    if (fields["jprice (online)"] !== undefined)
      properties["jprice (online)"] = { number: Number(fields["jprice (online)"]) || 0 };
    if (fields["jsprice (online)"] !== undefined)
      properties["jsprice (online)"] = { number: Number(fields["jsprice (online)"]) || 0 };
    if (fields.weight !== undefined)
      properties.weight = { number: Number(fields.weight) || 0 };
    if (fields.mainCategory !== undefined)
      properties.mainCategory = { select: fields.mainCategory ? { name: fields.mainCategory } : null };
    if (fields.category !== undefined)
      properties.category = { select: fields.category ? { name: fields.category } : null };
    if (fields.description !== undefined)
      properties.description = { rich_text: [{ text: { content: fields.description } }] };
    if (fields.image !== undefined)
      properties.image = { rich_text: fields.image ? [{ text: { content: fields.image } }] : [] };
    if (fields.images !== undefined)
      properties.images = { rich_text: fields.images ? [{ text: { content: fields.images } }] : [] };
    if (fields.sort     !== undefined) properties.sort     = { number: Number(fields.sort) };
    if (fields.idnumber !== undefined) properties.idnumber = { rich_text: [{ text: { content: fields.idnumber ? String(fields.idnumber) : '' } }] };
    if (fields.isView  !== undefined) properties.isView  = { checkbox: !!fields.isView  };
    if (fields.isHot   !== undefined) properties.isHot   = { checkbox: !!fields.isHot   };
    if (fields.isSale  !== undefined) properties.isSale  = { checkbox: !!fields.isSale  };
    if (fields.saleEnd !== undefined) properties.saleEnd = fields.saleEnd
      ? { date: { start: fields.saleEnd } }
      : { date: null };
    if (fields.isNew   !== undefined) properties.isNew   = { checkbox: !!fields.isNew   };
    if (fields.update  !== undefined)
      properties.update = { date: { start: new Date().toISOString().split("T")[0] } };

    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.message || "更新失敗" });
    }

    // 回讀 Notion 確認真的已更新，才回報成功
    const v = await verifyPage(NOTION_TOKEN, pageId, properties);
    if (!v.ok) {
      return res.status(500).json({ error: "Notion 尚未確認更新，請再按一次儲存", mismatches: v.mismatches });
    }

    res.status(200).json({ success: true, verified: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
