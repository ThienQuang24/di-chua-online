# 🎪 TỔNG HỢP TOÀN BỘ TÍNH NĂNG & HƯỚNG DẪN KẾT NỐI
## HỆ THỐNG TIKTOK LIVE INTERACTIVE (LÔ TÔ HỘI CHỢ · QUÁN NHẬU · ĐI CHÙA)

Dự án này là nền tảng game tương tác thời gian thực dành cho **TikTok LIVE Studio** và **OBS Studio**, tích hợp kết nối trực tiếp với TikTok Live qua websocket, xử lý bình luận, tự động cấp vé, chấm điểm, xướng số ca dao bolero bằng AI Voice Clone & ca sĩ thật, vũ công nhảy múa và đồng bộ đa thiết bị (máy tính streamer + màn hình live + điện thoại di động người xem).

---

## 📌 MỤC LỤC
1. [Tổng Quan 3 Chế Độ Trải Nghiệm (Themes)](#1-tổng-quan-3-chế-độ-trải-nghiệm-themes)
2. [Chi Tiết Chế Độ: Gánh Hát Lô Tô Hội Chợ](#2-chi-tiết-chế-độ-gánh-hát-lô-tô-hội-chợ)
3. [Chi Tiết Chế Độ: Quán Nhậu Vỉa Hè 1 2 3 Dô](#3-chi-tiết-chế-độ-quán-nhậu-vỉa-hè-1-2-3-dô)
4. [Chi Tiết Chế Độ: Đi Chùa Online 3D](#4-chi-tiết-chế-độ-đi-chùa-online-3d)
5. [Hệ Thống Âm Thanh & AI Voice Cloning Độc Quyền](#5-hệ-thống-âm-thanh--ai-voice-cloning-độc-quyền)
6. [Cơ Chế Đồng Bộ Đa Thiết Bị & Khán Giả Trên Điện Thoại (/ve)](#6-cơ-chế-đồng-bộ-đa-thiết-bị--khán-giả-trên-điện-thoại-ve)
7. [Hướng Dẫn Kết Nối Từng Bước (TikTok LIVE Studio / OBS)](#7-hướng-dẫn-kết-nối-từng-bước-tiktok-live-studio--obs)
8. [Bảng Tra Cứu Lệnh Chat Dành Cho Người Xem](#8-bảng-tra-cứu-lệnh-chat-dành-cho-người-xem)
9. [Bảng Tặng Quà TikTok & Đặc Quyền VIP](#9-bảng-tặng-quà-tiktok--đặc-quyền-vip)
10. [Khắc Phục Sự Cố & Câu Hỏi Thường Gặp (FAQ)](#10-khắc-phục-sự-cố--câu-hỏi-thường-gặp-faq)

---

## 1. TỔNG QUAN 3 CHẾ ĐỘ TRẢI NGHIỆM (THEMES)

Nền tảng hỗ trợ chuyển đổi linh hoạt giữa 3 chủ đề chỉ bằng 1 tham số URL (`?theme=loto`, `?theme=nhau`, `?theme=chua`):

| Chế độ (Theme) | Tham số URL | Bối cảnh | Điểm nhấn tương tác |
|---|---|---|---|
| **🎪 Gánh Hát Lô Tô Hội Chợ** | `?theme=loto` | Sân khấu hội chợ đêm, lồng cầu quay số, dàn đèn lồng, ca sĩ & vũ công biểu diễn | Khán giả gõ `layve` nhận vé số 9x3, máy tự dò số, hô Kinh nổ pháo hoa, vũ công nhảy múa khi donate quà |
| **🍻 Quán Nhậu Vỉa Hè 123 Dô** | `?theme=nhau` | Quán bia hơi vỉa hè đêm Hà Nội / Sài Gòn, bàn nhựa đỏ Duy Tân, bia bọt tuyết, đĩa mồi | Khán giả gõ `dzo` nâng ly chúc tụng, tổ chức sinh nhật `cmsn`, tặng quà thành "Đại Gia Bao Quán" |
| **🪷 Đi Chùa Online 3D** | `?theme=chua` | Chánh điện 3D trang nghiêm, tượng Phật dát vàng, lư hương nghi ngút, đệm lễ | Khán giả gõ `adidaphat` lên thắp hương lạy 3 lạy, camera áp sát người tặng quà, cầu an thi cử/sức khỏe |

---

## 2. CHI TIẾT CHẾ ĐỘ: GÁNH HÁT LÔ TÔ HỘI CHỢ

Đây là chế độ hoàn thiện và giàu tính năng nhất của dự án, tái hiện 100% không khí gánh hát lô tô hội chợ dân gian Nam Bộ.

### 2.1. Lồng Cầu Quay Số 3D & Cơ Chế Xướng Số
* **Lồng cầu 3D tương tác:** Bấm quay là các quả bóng số lộn nhào vật lý bên trong lồng kim loại, quả bóng may mắn lăn ra bàn mở số.
* **Chế độ quay linh hoạt:**
  * **Quay Thủ Công (Manual):** Streamer có thể bấm quay ngẫu nhiên hoặc chỉ định sẵn con số muốn ra (1 đến 90) để khớp với bài hát đang biểu diễn.
  * **Tự Động Quay (Auto Spin):** Tự động bốc số sau mỗi 10s, 15s, 20s... Streamer chỉ việc rảnh tay hát hò, giao lưu trò chuyện.
* **Trí thông minh chống trùng số:** Tự động loại trừ các số đã gọi trong ván (tối đa 90 số), hiển thị thanh lịch sử các số vừa gọi ở đầu màn hình.

### 2.2. Kho 90 Câu Hò & 90 Bài Hát Ca Sĩ Thật
* **Kho 90 câu thơ / hò xướng số dân gian:** Đầy đủ 90 câu hò bài chòi, vè dân gian, bolero luyến láy từ con số 01 đến con số 90.
* **Kho 90 bài hát người thật hát:** Thư mục `public/assets/loto/songs/{num}.mp3` chứa bản thu giọng hát thật truyền cảm của các nghệ sĩ lô tô nổi tiếng (Hằng Ny, Dạ Thảo, Đoàn Hương Nam).
* **Nhạc đệm Organ Bo sân khấu:** Tự động hòa âm tiếng đệm đàn Organ Bo dân dã + hiệu ứng Reverb sân khấu vang vọng khi MC hô số.

### 2.3. Bố Cục Khán Phòng 47+ Ghế Vòng Cung & Tên Trên Đầu
* **31 ghế VIP quây quần trung tâm:** Phân bố 5 hàng ghế vòng cung tiền cảnh (`y: 60%` đến `93%`), các nhân vật ngồi gần nhau ấm cúng, không che bục gỗ sân khấu.
* **Tự động mở hàng ghế phía sau:** Khi số lượng người chơi vượt quá 31 người (40, 50, 70+ người), hệ thống tự động xếp người chơi vào các hàng ghế phía sau (`Row 0`, `Row -1`) với tỷ lệ thu nhỏ 2.5D tự nhiên.
* **Tên và Avatar đặt ngay trên đỉnh đầu:** Mỗi nhân vật có một thanh huy hiệu capsule `[ Avatar + Tên ]` nhỏ gọn trên đầu. Dưới chân nhân vật hoàn toàn sạch sẽ, không lo bị đè chữ lên người ngồi trước.
* **Hiệu ứng dính số ngọc lục bảo:** Khi con số vừa quay trúng vào ô vé của người nào, huy hiệu `🎯 Dính số!` viền xanh ngọc sẽ phát sáng êm dịu (`animate-pulse`).

### 2.4. Khả Năng Xử Lý 100 Đến 1.000+ Khán Giả (Smart Dynamic Priority)
Khi phòng Live có hàng trăm đến hàng nghìn người cùng xem:
* **Hệ thống dò số siêu tốc:** Kiểm tra và đánh dấu đồng thời hàng nghìn tấm vé trong vòng 0,001 giây mỗi lượt quay.
* **Thuật toán đẩy người kịch tính lên hàng đầu:**
  1. 👑 **Khách KINH RỒI (Thắng giải):** Ưu tiên tuyệt đối lên ghế VIP số 1, đội vương miện giơ vé ăn mừng.
  2. 🔥 **Khách CHỜ KINH (thiếu 1–2 số):** Tự động nhảy lên các hàng ghế trước với huy hiệu hồi hộp `🔥 Chờ 05, 47`.
  3. 🎯 **Khách vừa dính số:** Nhấp nháy huy hiệu `🎯 Dính số!`.
  4. 💬 **Khách vừa chat / tặng quà:** Hiển thị bong bóng trò chuyện trực tiếp.
  5. **Số còn lại:** Được tính vào tổng số người chơi hiển thị trên thanh trạng thái hội trường `👥 {count} khán giả`.

### 2.5. Kho Vũ Công Nhảy Múa Biểu Diễn Đồ Sộ
Khi có người tặng quà hoặc streamer kích hoạt trên bảng điều khiển, sân khấu sẽ bùng nổ với các màn vũ đạo:
* **Vũ công 3D Dân Gian:** Múa quạt lễ hội (`dancer-fan`), Nhảy Disco sôi động (`dancer-disco`), Nhảy Hip-hop đường phố (`dancer-hiphop`), Nữ ca sĩ duyên dáng (`dancer-female-flair`).
* **Vũ công 3D GLB:** Ba Gà hài hước (`ba-ga.glb`), Vica nhí nhảnh (`vi-ca.glb`), Robot biểu cảm (`robot-expressive.glb`).
* **Dàn Video Vũ Công Alpha & Green Screen Hot Trend:**
  * **Chika Fujiwara Dance (Anime Kaguya-sama)**: Điệu múa anime kinh điển số 1.
  * **Chika Spin**: Chika xoay vòng tròn siêu đáng yêu.
  * **Waifu MMD**: Mỹ nhân anime 3D nhảy vũ điệu quyến rũ.
  * **Alice Genshin**: Bé Alice nhí nhảnh nhún nhảy.
  * **Altera FGO**: Kiếm sĩ anime nhảy cực ngầu.
  * **Cặp Đôi Cá Sấu (Croc Duo)**: 2 chú cá sấu nhảy đôi hài hước viral.
  * **Haaland Phonk Dance**: Cầu thủ Haaland nhảy giật gót điệu nghệ.
  * **Bộ Ba Kpop Nữ (Kpop Trio)**: Nhóm nhạc nữ nhảy Kpop thời thượng.
  * **TocToc Dance**: Điệu nhảy lắc hông TikTok bắt tai.
  * **Cat Meme**: Chú mèo meme lắc đầu nhịp điệu.
  * **Henry Stickmin Distraction Dance**: Điệu nhảy gây mất tập trung tấu hài.
* **Tính năng nạp Video tự do:** Streamer có thể bấm `[+ Tải Lên Video Nhảy Riêng]` để tải lên bất kỳ video MP4 phông xanh (Green Screen) hoặc WebM trong suốt nào, hệ thống tự tách nền hiển thị ngay!

### 2.6. Bộ 5 Tính Năng Giữ Chân & Đẩy Tương Tác Mới Nhất
1. 🚨 **Hệ Thống "Bắt Kinh Giả - Phạt Hài Hước" (Anti-Fake Kinh):**
   * Khi khán giả gõ `kinh`, `kinh rồi`, `trúng rồi`, `bingo` trên chat TikTok (hoặc bấm nút `🚨 Hô Kinh!` trên trang điện thoại `/ve`), hệ thống tự động đối chiếu vé 9×3 của họ.
   * Nếu đủ 5 số trên 1 hàng: Nổ pháo hoa trao giải ngay lập tức.
   * Nếu chưa đủ 5 số: Bật còi báo động vui nhộn **"🚨 BÁO ĐỘNG KINH HỤT / KINH GIẢ!"**, tự động phóng to tờ vé của người đó lên sân khấu để cả phòng thấy họ mới trúng bao nhiêu số, giọng MC AI đọc câu trêu hài hước và phạt nhân vật đứng dậy múa quạt 10 giây.
2. 🔥 **Hiệu Ứng "Cao Trào Chờ Kinh - Sắp Nổ Hũ" (Tension & Heartbeat Mode):**
   * Khi có khán giả đạt trạng thái Chờ Kinh (`4/5` số trên 1 hàng), thanh **"🔥 CAO TRÀO CHỜ KINH"** tự động xuất hiện liệt kê tên và con số họ đang chờ.
   * Khi có từ 2 người trở lên cùng Chờ Kinh, khung sân khấu rực sáng viền đèn Neon đỏ và phát nhịp tim hồi hộp (`Heartbeat`) mỗi khi lồng cầu quay.
3. 👑 **Đặc Quyền Đại Gia Donate: "Vé Vàng VIP & Xin Vía Lồng Cầu":**
   * Bất kỳ khán giả nào tặng quà trên Live sẽ được tự động nâng cấp lên **👑 VÉ VÀNG VIP** (huy hiệu Vương miện vàng trên đầu nhân vật, khung vé Hoàng Kim và ưu tiên ngồi hàng ghế đầu trung tâm).
   * Đồng thời hiển thị bảng vinh danh **"👑 VIP [Tên] đang xin vía lồng cầu!"** ngay bên dưới lồng quay số.
4. 🎲 **Mini-Game "Đoán Số Tiếp Theo: Chẵn hay Lẻ?" Giữa 2 Lần Quay:**
   * Khán giả có thể gõ nhanh `C` (`chẵn`) hoặc `L` (`lẻ`) trên khung chat TikTok (hoặc bấm nút `CHẴN (C)` / `LẺ (L)` ngay trên điện thoại `/ve`).
   * Thanh tỷ lệ dự đoán cập nhật trực tiếp trên sân khấu và tự động vinh danh số lượng người đoán trúng ngay khi quả cầu nổ ra.
5. 💾 **Tự Động Lưu Trạng Thái Ván Chơi (Auto-Save Persistence):**
   * Toàn bộ số đã gọi, giải thưởng và danh sách vé của tất cả khán giả được tự động lưu liên tục vào cả **Server (`data/loto_session_backup.json`)** và **Trình duyệt (`localStorage`)**.
   * Dù Streamer lỡ tay bấm `F5` tải lại trang hay khởi động lại Server, ván chơi đang quay dở vẫn được khôi phục nguyên vẹn 100%.

---

## 3. CHI TIẾT CHẾ ĐỘ: QUÁN NHẬU VỈA HÈ 1 2 3 DÔ

Tái hiện không khí quán nhậu bình dân hè phố thân quen:
* **Không gian quán nhậu 3D:** Bàn ghế nhựa Duy Tân, cốc bia hơi bọt tuyết, dĩa mồi nhậu nem chua, đậu phộng luộc, đá ướp lạnh.
* **Hành động nâng ly chúc tụng:** Khi người xem comment `dzo`, `123 dzo`, `uong`, tất cả khách trong quán cùng nâng ly bia hô vang: *"1, 2, 3... DÔ!"*.
* **Tổ chức sinh nhật trực tiếp trên Live:** Người xem gõ `cmsn [Tên]` hoặc `sinh nhật [Tên]`, quán sẽ thắp bánh kem sinh nhật, đốt pháo sáng pháo hoa và bật nhạc Happy Birthday chúc mừng.
* **Bảng Vàng "Đại Gia Bao Quán":** Vinh danh những người xem ủng hộ nhiều bia và mồi nhất.
* **Góc Tâm Sự Bàn Nhậu:** Người xem comment tâm sự sẽ được hiển thị dạng bảng gỗ treo trên vách quán.

---

## 4. CHI TIẾT CHẾ ĐỘ: ĐI CHÙA ONLINE 3D

Không gian tâm linh, thiền tịnh thư giãn:
* **Chánh Điện 3D tương tác hoàn toàn:** Tượng Phật dát vàng, lư hương nghi ngút khói thơm, chuông mõ ngân vang.
* **Hành lễ thắp hương:** Người xem gõ `adidaphat` hoặc tặng quà sẽ xuất hiện nhân vật mặc áo tràng mang tên và avatar TikTok của họ, bước lên bậc tam cấp thắp hương và lạy 3 lạy.
* **Camera áp sát (Spotlight 3.6x):** Khi có người tặng quà lớn, máy quay tự động zoom cận cảnh người đó trong lúc hành lễ với bảng tên vàng và cánh sen rơi lấp lánh.
* **Thanh Tim & Mưa Hoa Sen:** Khi cả phòng live thả đủ 666 tim, hiệu ứng mưa cánh sen hồng và sao sáng sẽ rơi ngập tràn màn hình suốt 60 giây.
* **Bảng TOP THÀNH TÂM:** Xếp hạng 10 người có công đức cao nhất, 10 tấm đệm hoa sen trước bục Phật dành riêng cho 10 người này.

---

## 5. HỆ THỐNG ÂM THANH & AI VOICE CLONING ĐỘC QUYỀN

### 5.1. Giọng Đọc MC AI Chuẩn Tiếng Việt
* Tích hợp **Microsoft Edge TTS Neural** với 2 giọng đọc tự nhiên, truyền cảm:
  * 🎙️ **Nam Minh:** Giọng nam trầm ấm, hào sảng, xướng số rõ ràng, dõng dạc.
  * 🎙️ **Hoài My:** Giọng nữ ngọt ngào, dịu dàng, luyến láy phong cách miền Nam.
* Tự động phát âm chuẩn số Lô Tô: phân biệt rõ ràng *"mười lăm"* (15), *"năm mươi lăm"* (55), *"bảy mươi mốt"* (71)...

### 5.2. Công Nghệ AI Voice Cloning (Nhân Bản Giọng Ca Sĩ Hằng Ny)
* Tích hợp API **ElevenLabs / Fish Audio** nhân bản giọng ca ngọc nữ Hằng Ny.
* Tự động sinh file giọng hát gọi số có hồn, luyến láy dân ca từ file giọng mẫu sạch 1 phút đính kèm tại `public/assets/loto/clone_samples/hang_ny_sample.mp3`.
* Bộ nhớ đệm (Cache) âm thanh cục bộ: Mỗi số chỉ cần tạo 1 lần và lưu lại vào đĩa cứng, lần sau phát lại tức thì không tốn thêm token/chi phí API.

---

## 6. CƠ CHẾ ĐỒNG BỘ ĐA THIẾT BỊ & KHÁN GIẢ TRÊN ĐIỆN THOẠI (`/ve`)

Dự án thiết kế theo kiến trúc **Client-Server Realtime** qua công nghệ Server-Sent Events (SSE):

```
                   ┌────────────────────────────────────────┐
                   │           SERVER (Node / TSX)          │
                   │       Port 3000 - SSE Event Stream     │
                   └──────────────────┬─────────────────────┘
                                      │
         ┌────────────────────────────┼──────────────────────────┐
         ▼                            ▼                          ▼
┌──────────────────┐        ┌──────────────────┐       ┌──────────────────┐
│   OBS / STAGE    │        │ STREAMER PANEL   │       │ MOBILE COMPANION │
│  (?view=stage)   │        │ (?view=streamer) │       │     (/ve)        │
│  Màn hình Live   │        │ Bảng điều khiển  │       │ Điện thoại khách │
└──────────────────┘        └──────────────────┘       └──────────────────┘
```

* **Mã QR Cầm Vé Trực Tiếp:** Trên sân khấu luôn có nút `[📱 Quét QR Cầm Vé]`. Khán giả dùng camera điện thoại quét mã là lập tức mở trang vé riêng của mình.
* **Đồng bộ thời gian thực 100%:** Khi Streamer bấm quay ra số nào, tấm vé trên điện thoại của toàn bộ khán giả sẽ tự động nhấp nháy khoanh tròn số đó ngay lập tức.
* **Tự động gán vé:** Khi người xem vào link `/ve`, hệ thống tự nhận diện thiết bị và cấp 1 tấm vé ngẫu nhiên duy nhất cho họ. Khán giả cũng có thể nhập nickname TikTok của mình để nhận diện trên màn hình live.

---

## 7. HƯỚNG DẪN KẾT NỐI TỪNG BƯỚC (TIKTOK LIVE STUDIO / OBS)

### Bước 1: Khởi Động Server Dự Án
Bạn có thể khởi động nhanh bằng cách bấm đúp vào 1 trong 3 file `.bat` (trên Windows):
* 🎪 **Muốn Live Lô Tô:** Chạy `BAT-LIVE-LOTO.bat`
* 🍻 **Muốn Live Quán Nhậu:** Chạy `BAT-LIVE-NHAU.bat`
* 🪷 **Muốn Live Đi Chùa:** Chạy `BAT-LIVE.bat`

*(Hoặc trên macOS / Linux: mở terminal gõ `npm run dev`)*.

---

### Bước 2: Thêm Sân Khấu Vào TikTok LIVE Studio
1. Mở phần mềm **TikTok LIVE Studio** trên máy tính.
2. Thêm một nguồn mới: chọn **Link (Trình duyệt web / Browser Source)**.
3. Nhập đường dẫn tương ứng với chế độ bạn muốn live:
   * **Lô Tô Hội Chợ:** `http://lvh.me:3000/?view=stage&theme=loto`
   * **Quán Nhậu 123 Dô:** `http://lvh.me:3000/?view=stage&theme=nhau`
   * **Đi Chùa Online:** `http://lvh.me:3000/?view=stage&theme=chua`
4. Cài đặt độ phân giải màn hình dọc:
   * Chiều rộng (Width): **1080**
   * Chiều cao (Height): **1920**
5. Tích chọn **"Điều khiển âm thanh qua phần mềm"** để âm thanh tiếng hò xướng số và tiếng vỗ tay truyền thẳng vào livestream.

> 💡 **Lưu ý về tên miền `lvh.me`:** `lvh.me` là tên miền công khai tự động trỏ về `127.0.0.1` (localhost). Cần dùng `lvh.me` vì TikTok LIVE Studio đôi khi chặn từ khóa `localhost`.

---

### Bước 3: Thêm Sân Khấu Vào OBS Studio (Nếu Dùng OBS)
1. Trong OBS Studio, bấm dấu `+` ở bảng **Sources (Nguồn)** → chọn **Browser (Trình duyệt)**.
2. Đặt URL: `http://localhost:3000/?view=stage&theme=loto` (hoặc `theme=nhau`, `theme=chua`).
3. Đặt kích thước: Width **1080**, Height **1920**.
4. Tích chọn **"Control audio via OBS" (Điều khiển âm thanh qua OBS)**.

---

### Bước 4: Tự Động Live 1-Click & Treo Máy 24/7 (`Tab 2: Tự Động Live & OBS`)
1. Mở trình duyệt web trên máy tính, truy cập `http://localhost:3000`.
2. Bấm vào **Tab 2: `🚀 2. Tự Động Live & OBS`** trong Bảng Điều Khiển Lô Tô:
   * Nhập **ID tài khoản TikTok** của bạn (ví dụ: `ganh_hat_loto`, không cần `@`).
   * Bấm nút **`🚀 BẬT TỰ ĐỘNG LIVE TOÀN DIỆN`** (hoặc bảo trợ lý AI: *"Live TikTok cho tài khoản @..."*).
3. Hệ thống sẽ **tự động thực hiện trọn gói**:
   * **Tự động mở cửa sổ Sân Khấu 9:16** (hoặc tự động kết nối **OBS WebSocket cổng 4455** để tạo nguồn `San Khau Lo To 9:16` 1080x1920, nạp RTMP Stream Key và bấm **Start Stream** trên OBS).
   * **Tự động canh sóng TikTok (`Auto-Watch 15s`)**: Kiểm tra phòng Live mỗi 15 giây, ngay khi tài khoản của bạn bấm *Phát trực tiếp (Go LIVE)* trên TikTok là tự động bắt sóng comment/quà tặng tức thì.
   * **Tự động bật Chế Độ Treo Máy 24/7 (`🤖 Treo Tự Động 24/7`)**:
     * Tự động quay số mỗi 18 giây.
     * Khi có người trúng Kinh (hoặc hết 90 số), tự động vinh danh 15 giây rồi **tự động qua Ván mới & phát lại vé mới** (không bao giờ bị đứng ván khi treo máy).
     * Tự động bật **Bot Khán Giả Giữ Nhiệt**: lấp ghế khán giả và định kỳ hiện **Bong Bóng Chat (`💬 ...`)** trên đầu nhân vật.

---

## 8. BẢNG TRA CỨU LỆNH CHAT DÀNH CHO NGƯỜI XEM

Người xem khi vào livestream chỉ cần gõ bình luận vào ô chat TikTok (mọi bình luận đều sẽ hiển thị thành **Bong Bóng Chat `💬`** ngay trên đầu nhân vật của người đó trong 8 giây):

| Lệnh Bình Luận | Chế Độ Áp Dụng | Hành Động Trong Game |
|---|---|---|
| `layve`, `lấy vé`, `ve`, `vé`, `xin vé`, `dò vé` | 🎪 Lô Tô | Hệ thống tự cấp vé số Lô Tô 9x3, xếp chỗ ngồi vào hội trường và tự động dò số |
| `kinh`, `kinh rồi`, `bingo` | 🎪 Lô Tô | Báo hiệu trúng thưởng nếu vé đủ 5 số 1 hàng; nếu chưa đủ sẽ bật **Còi Báo Động Kinh Giả & Phạt Múa Quạt** |
| `C`, `chẵn` hoặc `L`, `lẻ` | 🎪 Lô Tô | Tham gia Mini-game **Đoán Số Tiếp Theo Chẵn hay Lẻ** ngay dưới lồng cầu |
| *Bất kỳ câu chat nào khác* | 🎪 Lô Tô | Tự động cấp ghế ngồi (nếu chưa có) và hiện **Bong Bóng Chat** nổi lên ngay trên đầu nhân vật 3D |
| `dzo`, `zo`, `123 dzo`, `uong`, `can ly` | 🍻 Quán Nhậu | Toàn bộ quán nhậu cùng giơ bia hô to *"1 2 3 DÔ!"* |
| `cmsn [Tên]`, `sinh nhật [Tên]`, `snvv` | 🍻 Quán Nhậu | Tổ chức sinh nhật: thắp nến bánh kem, đốt pháo sáng, bật nhạc chúc mừng |
| `adidaphat`, `nam mo a di da phat` | 🪷 Đi Chùa | Nhân vật bước lên bậc tam cấp, dâng hương và lạy Phật 3 lạy |
| Bình luận cầu an (thi cử, sức khỏe, bình an...) | 🪷 Đi Chùa | MC AI tự động nhận diện và cất giọng đọc lời chúc an lành riêng cho người đó |

---

## 9. BẢNG TẶNG QUÀ TIKTOK & ĐẶC QUYỀN VIP

Khi người xem tặng quà trên TikTok Live, game sẽ tự động phản hồi theo các cấp bậc:

### Trong Gánh Hát Lô Tô:
* 🌹 **Hoa Hồng (1 xu):** Tự động cấp vé may mắn + MC AI cất tiếng cảm ơn + Kích hoạt vũ điệu Múa Quạt Dân Gian.
* 🍦 **Cây Kem / Donut (10–30 xu):** Nâng cấp vé Viền Vàng May Mắn + Kích hoạt vũ điệu Lắc Hông TikTok / TocToc Dance.
* 👑 **Vương Miện / Tim (90–199 xu):** Ghế VIP hàng đầu + Tặng 2 vé + Kích hoạt dàn vũ công Kpop Trio / Disco sôi động.
* 🚀 **Tên Lửa / Sư Tử / Pháo Hoa (1.000+ xu):** Mưa pháo hoa toàn hội trường + Kích hoạt vũ công Đoàn Gánh Hát / Haaland Phonk / Chika Waifu + Quyền ưu tiên chỉ định số tiếp theo.

---

## 10. KHẮC PHỤC SỰ CỐ & CÂU HỎI THƯỜNG GẶP (FAQ)

#### Q1: Tại sao trong TikTok LIVE Studio bị vọng âm (2 giọng nói lặp lại)?
> **Trả lời:** Chỉ mở âm thanh ở trang nguồn trình duyệt trong LIVE Studio (`?view=stage`). Trang điều khiển của Streamer (`?view=streamer`) đã được tắt tiếng mặc định để tránh vọng âm. Nếu bạn mở thêm tab stage trên trình duyệt thường, hãy đóng hoặc tắt tiếng tab đó.

#### Q2: Khán giả quét mã QR trên điện thoại nhưng không mở được vé?
> **Trả lời:** Đảm bảo điện thoại và máy tính chạy server đang kết nối **chung một mạng Wi-Fi**. Mã QR trên sân khấu sẽ tự động chuyển thành địa chỉ IP nội bộ của máy tính (ví dụ: `http://192.168.1.15:3000/ve`).

#### Q3: Kết nối TikTok báo lỗi hoặc không nhận comment?
> **Trả lời:**
> 1. Bạn phải **bắt đầu phát Live trên TikTok trước**, sau đó mới bấm nút **[Kết Nối]** trên trang điều khiển.
> 2. Đảm bảo gõ đúng `uniqueId` (username TikTok không có dấu `@`).

#### Q4: Làm sao để thay đổi nhạc nền hoặc hình nền sân khấu?
> **Trả lời:** Tất cả tài nguyên đều nằm ở thư mục `public/assets/`:
> * Nhạc nền: `public/assets/audio/`
> * Ảnh nền: `public/assets/bg/`
> * Video vũ công: `public/assets/loto/dancers/`  
> Bạn chỉ cần copy file mới đè lên file cũ cùng tên, hoặc chọn từ Bảng điều khiển Streamer.

---

*Tài liệu được cập nhật tự động theo phiên bản mới nhất trên nhánh `dev/thienvuong`.*
