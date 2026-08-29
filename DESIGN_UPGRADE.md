# W-82 設計升級指南

## 📋 目錄
1. [快速開始](#快速開始)
2. [設計系統概覽](#設計系統概覽)
3. [色彩系統](#色彩系統)
4. [排版和間距](#排版和間距)
5. [元件使用指南](#元件使用指南)
6. [最佳實踐](#最佳實踐)

---

## 快速開始

### 步驟 1：替換主題文件
將所有 HTML 文件中的：
```html
<link rel="stylesheet" href="js/theme.css?v=2">
```

改為：
```html
<link rel="stylesheet" href="js/theme-premium.css">
```

### 步驟 2：測試所有頁面
- 首頁 (index.html)
- 商品詳細 (product.html)
- 購物車 (cart.html)
- 結帳 (checkout.html)
- 後台頁面 (admin-*.html)

### 步驟 3：調整管理員主題
如果使用 admin-theme.css，也建議升級它。

---

## 設計系統概覽

### 🎨 核心設計原則

| 原則 | 說明 |
|------|------|
| **質感優先** | 使用漸變、陰影和微妙的效果 |
| **清晰階層** | 色彩和尺寸明確區分不同的重要度 |
| **平滑互動** | 所有過渡和動畫都流暢自然 |
| **易於掃描** | 充分的白空間和清晰的視覺分組 |
| **無障礙設計** | 足夠的對比度和清晰的焦點狀態 |

---

## 色彩系統

### 🎯 主要色彩

```
主色調 (Primary)        副色調 (Neutral)       功能色
┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐
│ --primary       │   │ --white         │   │ --accent (紅)    │
│ #1a1a1a (深黑)  │   │ #ffffff         │   │ #c9302c          │
│                 │   │                 │   │                  │
│ --primary-light │   │ --gray-50       │   │ --success (綠)   │
│ #2d2d2d         │   │ #fafafa         │   │ #059669          │
└─────────────────┘   └─────────────────┘   └──────────────────┘
```

### 灰色漸度
- `--gray-50` - 最淺背景 (#fafafa)
- `--gray-100` - 輕背景 (#f3f4f6)
- `--gray-200` - 分隔線 (#e5e7eb)
- `--gray-400` - 次要文本 (#9ca3af)
- `--gray-600` - 普通文本 (#4b5563)
- `--gray-900` - 主文本 (#111827)

### 推薦用途
```
標題      → --primary (#1a1a1a) 或 --gray-900
正文      → --gray-700 (#374151)
次要文本  → --gray-500 (#6b7280)
禁用狀態  → --gray-400 (#9ca3af)
背景      → --gray-50 (#fafafa)
容器      → --white (#ffffff)
強調色    → --accent (#c9302c) - 限制使用
```

---

## 排版和間距

### 📝 字體大小階級

| 用途 | 尺寸 | 權重 | 使用場景 |
|------|------|------|---------|
| 頁面標題 | 28px | 700 | 頁面主標題 |
| 區段標題 | 20px | 700 | 主區段 |
| 卡片標題 | 16px | 700 | 卡片標題 |
| 大文本 | 16px | 600 | 按鈕、重要信息 |
| 正文 | 15px | 400 | 大部分內容 |
| 小文本 | 14px | 400 | 描述文本 |
| 標籤 | 12px | 600 | 標籤、分類 |
| 說明文 | 11px | 500 | 輔助信息 |

### 📏 間距系統 (8px 基準)

```
小間距   → 4px (mt-1, mb-1, p-1)
常規間距 → 8px (mt-2, mb-2, p-2)
中等間距 → 12px (mt-3, mb-3, p-3)
大間距   → 16px (mt-4, mb-4, p-4)
元素間   → 10-16px (使用 gap)
區段間   → 20px 以上
```

### 圓角系統

```
超小圓角 → 4px   (--radius-xs)   - 小組件
小圓角   → 6px   (--radius-sm)   - 徽章、標籤
標準圓角 → 12px  (--radius)      - 按鈕、輸入框
大圓角   → 16px  (--radius-lg)   - 卡片、區塊
超大圓角 → 20px  (--radius-xl)   - 大容器
```

---

## 元件使用指南

### 1️⃣ 按鈕

#### 主要按鈕 (主要操作)
```html
<button class="btn-primary">購買</button>
```

**特點**：
- 深灰黑漸變
- 白色文字
- 懸停時升起並增加陰影
- 點擊時有視覺反饋

#### 次要按鈕 (替代操作)
```html
<button class="btn-secondary">取消</button>
```

**特點**：
- 白色背景，深灰黑邊框
- 懸停時淡化背景

---

### 2️⃣ 卡片

#### 商品卡片
```html
<a href="product.html" class="product-card">
  <img class="product-card-img" src="image.jpg" alt="">
  <div class="product-card-body">
    <div class="product-card-cat">分類</div>
    <div class="product-card-name">商品名稱</div>
    <div class="badge badge-new">新品</div>
    <div class="product-card-price">¥999</div>
  </div>
</a>
```

**特點**：
- 底部有陰影，懸停時升起
- 圖片縮放過渡
- 清晰的價格層級

#### 區塊卡片
```html
<div class="card-block">
  <div class="card-block-title">標題</div>
  <div class="card-block-text">內容</div>
</div>
```

---

### 3️⃣ 表單元素

#### 基礎輸入框
```html
<div class="form-group">
  <label>郵箱</label>
  <input type="email" placeholder="example@email.com">
</div>
```

**特點**：
- 邊框 1.5px，淡灰色
- 聚焦時變深並添加陰影
- 自動圓角和間距

#### 文本區域
```html
<textarea placeholder="輸入訊息..."></textarea>
```

---

### 4️⃣ 徽章

```html
<!-- 新品徽章 -->
<span class="badge badge-new">新品</span>

<!-- 熱賣徽章 -->
<span class="badge badge-hot">熱賣</span>

<!-- 特價徽章 -->
<span class="badge badge-sale">特價</span>
```

---

### 5️⃣ 警告框

```html
<!-- 信息 -->
<div class="alert alert-info">這是一條信息提示</div>

<!-- 成功 -->
<div class="alert alert-success">操作成功！</div>

<!-- 警告 -->
<div class="alert alert-warning">請注意此警告</div>

<!-- 錯誤 -->
<div class="alert alert-error">發生錯誤</div>
```

---

### 6️⃣ 分類 Tab

```html
<div class="cat-bar">
  <div class="cat-chip active">全部</div>
  <div class="cat-chip">電子</div>
  <div class="cat-chip">服飾</div>
</div>
```

**特點**：
- 可橫向滑動
- 活躍狀態有漸變背景
- 懸停時邊框變深

---

## 最佳實踐

### ✅ 設計檢查清單

- [ ] **色彩對比** - 文本與背景的對比度 ≥ 4.5:1
- [ ] **間距一致** - 使用預設的間距系統
- [ ] **圓角統一** - 相同的元件使用相同的圓角
- [ ] **陰影層級** - 重要元件有適當的陰影深度
- [ ] **過渡流暢** - 所有過渡 200ms 以上，避免卡頓
- [ ] **行高足夠** - 正文行高 1.6 以上，便於閱讀
- [ ] **字體大小** - 正文 ≥ 14px，易於在手機上閱讀
- [ ] **呼應一致** - 按鈕和鏈接有明確的點擊反饋

### 🎨 配色範例

#### 高級和諧配色
```css
/* 深色優雅 */
主色：--primary (#1a1a1a)
強調色：--accent (#c9302c)
背景：--gray-50 (#fafafa)

/* 用於特殊場景 */
成功：--success (#059669)
警告：--warning (#f59e0b)
信息：--info (#0284c7)
```

### 📱 響應式設計

```
手機 (< 640px)
├─ 2 列商品網格
├─ 全寬按鈕
└─ 緊湊間距

平板 (640px - 768px)
├─ 3 列商品網格
├─ 較大字體
└─ 正常間距

桌面 (> 768px)
├─ 4-5 列商品網格
├─ 最大寬度限制
└─ 寬鬆間距
```

### 🎬 動畫規範

```
快速 (150ms)：按鈕悸動、圖標反應
標準 (200ms)：元件淡入淡出、過渡效果
緩慢 (300ms)：頁面進場、模態窗口
```

---

## 管理員面板升級

如果要升級管理員面板的設計，可參考相同的色彩和間距系統。建議：

1. 保持深色背景 (--primary)
2. 使用清晰的色彩區分操作 (新增、編輯、刪除)
3. 表格使用斑馬紋和懸停高亮
4. 表單使用大間距便於操作

---

## 故障排除

### 問題：某些元件看起來風格不對

**解決方案**：
1. 確保使用 `theme-premium.css` 而不是 `theme.css`
2. 清除瀏覽器快取 (Ctrl+Shift+Delete)
3. 檢查 CSS 文件是否完整加載

### 問題：自訂樣式與新系統衝突

**解決方案**：
1. 使用 CSS 變數而不是硬編碼色彩：`color: var(--primary)`
2. 避免 `!important`，優先使用更具體的選擇器
3. 對於舊的內聯樣式，逐漸遷移到新系統

---

## 進階自訂

### 調整色彩

編輯 `theme-premium.css` 的 `:root` 部分：

```css
:root {
  --primary: #1a1a1a;  /* 改為你的品牌色 */
  --accent: #c9302c;   /* 改為你的強調色 */
  /* ... 其他顏色 ... */
}
```

### 調整排版

對於更大的螢幕，增加字體大小：

```css
@media (min-width: 1024px) {
  body { font-size: 16px; }
  .product-card-name { font-size: 15px; }
}
```

---

## 下一步

1. ✅ 應用 `theme-premium.css` 到所有頁面
2. 📸 在各種裝置上測試 (手機、平板、桌面)
3. ♿ 進行無障礙性檢查 (色彩對比、焦點狀態)
4. 🎯 根據反饋微調顏色和間距
5. 📦 考慮添加深色模式支持

---

**最後更新**：2026 年 8 月  
**設計系統版本**：1.0
