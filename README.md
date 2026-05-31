# 肌肉互動 PWA · 部署指南

這是 v0.2 的 PWA(漸進式網頁應用)版本。部署到 HTTPS 網站之後,手機瀏覽器打開可「加到主畫面」,變成桌面 app。

---

## 📦 檔案說明

```
muscle-app-pwa/
├── index.html              ← 主程式(含 PWA 設定)
├── manifest.json           ← app 資訊(名稱、icon、主題色)
├── service-worker.js       ← 離線快取邏輯
├── icons/                  ← 各尺寸 app icon
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   ├── apple-touch-icon.png
│   └── favicon-32.png
└── 4_-muscular-system.glb  ← 自己放進來(Z-Anatomy 匯出的模型)
```

把你的 `.glb` 模型檔放進這個資料夾,就可以開始部署了。

---

## 🧪 本地測試

PWA 必須透過 HTTP / HTTPS,不能用 `file://` 直接開。最簡單的方式:

```bash
cd muscle-app-pwa
python3 -m http.server 8000
```

然後瀏覽器打開 `http://localhost:8000`。在 Chrome DevTools 的 Application 分頁可以看到 Service Worker 是否註冊成功、檢查 manifest、清快取等等。

手機要連到同一個 Wi-Fi,用電腦的內網 IP(例如 `http://192.168.1.5:8000`)就能在手機上測試,但因為不是 HTTPS,某些 PWA 行為(例如「加到主畫面」的提示)不會出現。要完整測試手機 PWA 體驗,需要走以下部署。

---

## 🚀 免費部署(推薦 GitHub Pages)

### 1. 註冊 GitHub 並建立 repo

到 [github.com](https://github.com) 開帳號,**New repository**,取個名字(例如 `muscle-app`),設為 Public,建立。

### 2. 上傳檔案

最簡單:把 `muscle-app-pwa/` 裡所有檔案拖曳到 repo 頁面 → Commit。
或用 git command line:

```bash
cd muscle-app-pwa
git init
git remote add origin https://github.com/你的帳號/muscle-app.git
git add .
git commit -m "Initial PWA"
git branch -M main
git push -u origin main
```

### 3. 啟用 Pages

Repo 頁面 → **Settings** → **Pages** → Source 選 `main` branch、folder 選 `/ (root)` → Save。
等 1~2 分鐘,你的網址會出現:`https://你的帳號.github.io/muscle-app/`

### 4. 在手機開啟

打開上面那個網址,等模型載入,測試正常後:

- **iOS Safari**:點下方分享鍵 → 「加入主畫面」
- **Android Chrome**:會自動跳出「安裝 app」的橫幅,沒跳出的話從選單 → 「安裝應用程式」

完成。桌面就有 icon,點開全螢幕運作,跟原生 app 沒兩樣。

---

## 🔄 更新

改完任何檔案後 push,GitHub Pages 自動部署。
**但**:Service Worker 會用快取,使用者不會立刻看到更新。
正確做法:每次發佈時把 `service-worker.js` 開頭的 `CACHE_VERSION = 'muscle-app-v1'` 改成 `v2`、`v3`...,瀏覽器就會清掉舊快取、拉新版。

---

## 🌐 其他免費部署選項

| 服務 | 優點 | 適合 |
|------|------|------|
| **GitHub Pages** | 完全免費、跟 git 整合好 | 個人專案 |
| **Vercel** | 速度快、設定簡單、有自訂網域 | 想要快、想要好網址 |
| **Netlify** | 拖曳資料夾即可上傳,免註冊也能用 | 完全不想碰 git |
| **Cloudflare Pages** | 全球 CDN、無流量限制 | 預期會有很多人用 |

擇一即可,流程都類似。

---

## ⚠️ 注意事項

1. **HTTPS 必須**:Service Worker、PWA 安裝都要求 HTTPS。上述平台都自動提供。
2. **.glb 檔案大小**:GitHub 單檔上限 100 MB、repo 上限 1 GB。如果 .glb > 100 MB,要先用 Blender 減面或切分區再匯出。
3. **離線使用**:第一次連網載入後,後續可離線。但更換 .glb 模型時必須連網。
4. **iOS 限制**:iOS 的 PWA 不能用 Push 通知、背景同步等部分原生功能;這個 app 不用到所以沒影響。
5. **資料儲存**:目前紀錄存在瀏覽器的 localStorage(每個域名約 5–10 MB)。要存大量照片時要升級到 IndexedDB——下一階段做 Capacitor 包成正式 app 時會一起改。

---

## 📱 下一步:Capacitor 包成 App Store 上架版

想要 App Store / Play Store 上架、加上原生相機拍攝改善前後照片功能,告訴我,我幫你做 Capacitor 包裝層。
