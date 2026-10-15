// 寫入 Notion 後回讀確認：只有 Notion 真的已經是我們送出的值，才算成功
// 用法：await verifyPage(NOTION_TOKEN, pageId, properties)
//       properties 就是送給 Notion 的 properties 物件（同一份）

const SKIP = Symbol("skip");
const HEADERS = (token) => ({
  Authorization: `Bearer ${token}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
});

// 把「送出去的格式」轉成可比較的值
function expectedOf(prop) {
  if (!prop) return SKIP;
  if ("checkbox" in prop) return !!prop.checkbox;
  if ("number" in prop) return prop.number ?? null;
  if ("title" in prop || "rich_text" in prop) {
    const arr = prop.title || prop.rich_text || [];
    return arr.map(t => t.text?.content ?? "").join("");
  }
  if ("select" in prop) return prop.select?.name ?? null;
  if ("status" in prop) return prop.status?.name ?? null;
  if ("date" in prop) return prop.date?.start ?? null;
  if ("email" in prop) return prop.email ?? null;
  if ("phone_number" in prop) return prop.phone_number ?? null;
  return SKIP; // formula 等無法寫入的欄位不比對
}

// 把 Notion 回讀的格式轉成可比較的值
function actualOf(prop) {
  if (!prop) return SKIP;
  switch (prop.type) {
    case "checkbox":     return !!prop.checkbox;
    case "number":       return prop.number ?? null;
    case "title":        return prop.title.map(t => t.plain_text).join("");
    case "rich_text":    return prop.rich_text.map(t => t.plain_text).join("");
    case "select":       return prop.select?.name ?? null;
    case "status":       return prop.status?.name ?? null;
    case "date":         return prop.date?.start ?? null;
    case "email":        return prop.email ?? null;
    case "phone_number": return prop.phone_number ?? null;
    default:             return SKIP;
  }
}

function same(a, b) {
  if (typeof a === "number" || typeof b === "number") return Number(a ?? 0) === Number(b ?? 0);
  const n = v => (v === null || v === undefined ? "" : String(v).trim());
  return n(a) === n(b);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 回讀頁面，逐一比對 sentProps。失敗會重試幾次（Notion 讀寫可能有短暫延遲）
export async function verifyPage(token, pageId, sentProps, { retries = 4, delay = 400 } = {}) {
  let mismatches = [];
  for (let i = 0; i < retries; i++) {
    if (i) await sleep(delay);
    const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, { headers: HEADERS(token) });
    const page = await r.json();
    if (!r.ok) {
      mismatches = [{ key: "_read", error: page.message || "讀取失敗" }];
      continue;
    }
    mismatches = [];
    for (const [key, sent] of Object.entries(sentProps)) {
      const exp = expectedOf(sent);
      if (exp === SKIP) continue;
      const got = actualOf(page.properties?.[key]);
      if (got === SKIP || !same(exp, got)) {
        mismatches.push({ key, expected: exp, got: got === SKIP ? null : got });
      }
    }
    if (!mismatches.length) return { ok: true };
  }
  return { ok: false, mismatches };
}

// 確認頁面已封存（刪除）
export async function verifyArchived(token, pageId, { retries = 4, delay = 400 } = {}) {
  for (let i = 0; i < retries; i++) {
    if (i) await sleep(delay);
    const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, { headers: HEADERS(token) });
    const page = await r.json();
    if (r.ok && (page.archived || page.in_trash)) return { ok: true };
  }
  return { ok: false };
}
