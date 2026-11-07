# DỰ ÁN ĐI CHÙA ONLINE & GÁNH HÁT LÔ TÔ LIVE TIKTOK (INTERACTIVE STREAM)

---

## 1. THÔNG TIN DỰ ÁN & REPOSITORY
- **Tên dự án:** Đi Chùa Online & Gánh Hát Lô Tô Hội Chợ Dân Gian (TikTok Live Interactive Studio)
- **Đường dẫn Git Remote (GitHub):** [https://github.com/ThienQuang24/di-chua-online.git](https://github.com/ThienQuang24/di-chua-online.git)
- **Nhánh chính (Branches):**
  - `main`: Nhánh production chuẩn nhất.
  - `dev/thienvuong`: Nhánh phát triển chính (đã đồng bộ 100% commit với `main`).
- **Commit mới nhất:** `968f530` (`refactor: complete Zero-Bloat cleanup and modularization (0 violations, all files <= 250 lines)`).

---

## 2. NỘI DUNG & TỔNG QUAN TÍNH NĂNG DỰ ÁN

Dự án là nền tảng livestream tương tác thời gian thực chuẩn tỉ lệ 9:16 dọc cho TikTok LIVE, tích hợp 2 chế độ sân khấu độc đáo:

### 2.1. Chế độ Chánh Điện Chùa (Đi Chùa Online)
- **Không gian Chánh Điện 3D/2.5D:** Bàn thờ Phật trang nghiêm, ánh hào quang, khói trầm hương nghi ngút, chuông u minh, mõ gia trì.
- **Hàng ghế Phật tử tương tác:** Khi người xem bình luận hoặc tặng quà trên TikTok LIVE, nhân vật Phật tử áo lam lập tức xuất hiện, quỳ lạy trang nghiêm với tên hiển thị trên đầu.
- **Dâng lễ & Bảng vàng công đức:** Hiệu ứng hoa sen, đèn hoa đăng, mâm ngũ quả bay lên bàn thờ khi donate quà.
- **Hệ thống Âm thanh & TTS Phật Giáo:** Tự động phát nhạc thiền thanh tịnh, chuông mõ; tự động đọc lời cảm ơn người tặng quà, chào khách mới vào bằng giọng đọc truyền cảm.

### 2.2. Chế độ Gánh Hát Lô Tô Hội Chợ Dân Gian (Lô Tô Live)
- **Lồng cầu quay số chuẩn 1-90:** Quay số tự động hoặc thủ công kèm hiệu ứng visual lồng cầu xoay.
- **31 Ghế khán giả ngồi dưới khán phòng:** Nhân vật 3D sống động quay lưng về phía màn hình hướng lên sân khấu, tên người xem hiển thị ngay trên đầu, bong bóng chat hiển thị bình luận tức thì.
- **Hệ thống Vé Lô Tô Tự Động & VIP:**
  - Người xem gõ `ve` hoặc comment nhận vé: Hệ thống phát vé chuẩn 3 hàng x 9 cột truyền thống.
  - Tặng quà TikTok (hoa hồng, kem, mũ nón...): Nhận vé VIP viền vàng óng ánh, tự động dò số.
- **Bàn Streamer Đa Năng (5 Tabs):**
  1. *Lồng Cầu:* Bắt đầu, dừng, quay số tiếp theo, chế độ Auto-Spin, phát thưởng.
  2. *Auto-Live (OBS Studio):* Kết nối tự động OBS WebSocket, mở cửa sổ Stage 1080x1920 không viền, tự đồng bộ kịch bản.
  3. *Âm Thanh & Giọng Hát:* Phát nhạc hội chợ, beat nhạc lô tô, đọc số kêu lô tô kèm câu vè dân gian qua Edge TTS/Web Audio.
  4. *Vũ Đoàn Ăn Mừng (18 Điệu Nhảy):* Múa quạt, Cá Sấu (croc duo), Kpop Trio, Waifu MMD, Haaland Phonk, Chika Spin, Stickmin, Waifu Flair... hỗ trợ cả video tách nền xanh (Chroma Key).
  5. *Quản Lý Khán Giả:* Theo dõi danh sách vé, người sắp trúng (đợi 1 số), ghim vé lên màn hình, xử lý người hô "Kinh".
- **Hệ thống Xử phạt Báo Kinh Giả:** Khi ai đó chưa đủ 5 số mà hô "kinh", hệ thống tự động bêu tên và đưa ra hình phạt vui nhộn (nhảy 10s, uống nước, múa quạt).
- **Mini-game Dự đoán Chẵn / Lẻ:** Người xem comment `chan` hoặc `le` trước mỗi vòng quay để nhận điểm thưởng.

---

## 3. CÁCH KẾT NỐI & VẬN HÀNH

### 3.1. Kết nối TikTok LIVE (Thời gian thực)
1. Trong giao diện Streamer Deck, nhập `@username` kênh TikTok đang phát trực tiếp.
2. Nhấn nút **"Kết Nối TikTok"**.
3. Hệ thống sử dụng thư viện `tiktok-live-connector` bắt toàn bộ sự kiện:
   - Bình luận (`chat`)
   - Tặng quà (`gift`)
   - Thả tim (`like`)
   - Người mới vào xem (`roomUser` / `member`)
   - Chia sẻ livestream (`share`)

### 3.2. Kết nối OBS Studio (Xuất hình livestream 1080x1920)
1. Mở OBS Studio $\rightarrow$ Công cụ (Tools) $\rightarrow$ Cài đặt WebSocket Server (Port mặc định: `4455`).
2. Trong tab **Auto-Live** của dự án:
   - Nhập Địa chỉ OBS WebSocket (`ws://localhost:4455`) và mật khẩu (nếu có).
   - Nhấn **"Kết Nối OBS"**.
3. Thêm nguồn Browser Source trên OBS:
   - **URL Sân Khấu Chùa:** `http://localhost:3000/?view=stage&theme=chua`
   - **URL Sân Khấu Lô Tô:** `http://localhost:3000/?view=stage&theme=loto`
   - **Độ phân giải:** Width: `1080`, Height: `1920`.

### 3.3. Trang xem và dò vé trên Điện Thoại (Mobile Ticket View)
- Người xem quét mã QR trên màn hình hoặc truy cập:
  `http://<IP_MÁY_CHỦ>:3000/?view=mobile-ticket&user=<username>`
- Giao diện thân thiện trên điện thoại, tự động đánh dấu số đã ra, nút bấm "KINH RỒI!" khi đủ hàng.

---

## 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL (TỪ A ĐẾN Z)

### Bước 1: Clone dự án từ GitHub
```bash
git clone https://github.com/ThienQuang24/di-chua-online.git
cd di-chua-online
```

### Bước 2: Cài đặt Dependencies
```bash
npm install
```

### Bước 3: Khởi động Máy Chủ Tích Hợp (Full-stack Server + Vite)
```bash
# Chạy cả Backend API Server và Frontend Vite trên port 3000
npm run server
# hoặc: npx tsx server.ts
```

### Bước 4: Truy cập các màn hình làm việc
- **Giao diện Điều khiển đầy đủ (Streamer Deck + Stage):**
  [http://localhost:3000/?view=both&theme=loto](http://localhost:3000/?view=both&theme=loto)
- **Màn hình Chánh Điện Chùa:**
  [http://localhost:3000/?view=both&theme=chua](http://localhost:3000/?view=both&theme=chua)
- **Màn hình Clean Sân Khấu cho OBS (Chỉ có sân khấu 9:16):**
  [http://localhost:3000/?view=stage&theme=loto](http://localhost:3000/?view=stage&theme=loto)

### Bước 5: Kiểm tra chất lượng Code (Zero-Bloat Audit & Build)
```bash
# Type check không lỗi
npm run lint

# Build production
npm run build
```

---

## 5. CẤU TRÚC THƯ MỤC CHUẨN CỦA DỰ ÁN TRÊN GIT
```text
di-chua-online/
├── server.ts                       # Backend Express & TikTok Live SSE Connector
├── index.html                      # HTML Entry
├── vite.config.ts                  # Vite Bundler Config
├── package.json                    # Script & Dependencies
├── public/                         # Assets tĩnh (âm thanh, ảnh 3D, nền HD)
│   └── assets/
│       ├── audio/                  # Nhạc thiền, chuông mõ, beat lô tô
│       ├── bg/                     # Nền 9:16 Chánh điện & Hội chợ Lô Tô
│       ├── dances/                 # Video vũ đoàn tách nền
│       └── loto/                   # Sprite nhân vật khán giả 3D
└── src/
    ├── App.tsx                     # Component điều phối chính (<= 250 dòng)
    ├── components/
    │   ├── AppStageViewport.tsx    # Khung hiển thị Stage
    │   ├── ChanhDienStage.tsx      # Sân khấu Chánh điện
    │   ├── OfferingArea.tsx        # Khu vực dâng lễ cúng dường
    │   ├── StreamerDeck.tsx        # Bàn điều khiển Chùa
    │   └── loto/                   # Module Gánh hát Lô Tô
    │       ├── LotoStage.tsx       # Sân khấu Lô Tô
    │       ├── LotoFairCrowd.tsx   # 31 Ghế khán giả hội chợ
    │       ├── LotoStageDancer.tsx # Vũ đoàn ăn mừng (18 styles)
    │       ├── LotoStreamerPanel.tsx # Bàn điều khiển Lô Tô Streamer
    │       ├── MobileLotoTicketView.tsx # Giao diện vé điện thoại
    │       └── tabs/               # 5 Tabs điều khiển phân tách chuẩn
    ├── composables/                # Hooks điều khiển SSE, comment, actions
    ├── services/                   # apiClient, lotoEngine, soundEngine
    ├── three/                      # Three.js 3D Chánh điện (Scene, Actor, Assets)
    └── types/                      # TypeScript definitions
```
