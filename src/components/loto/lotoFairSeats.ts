// 6 diverse 3D character models for the festival crowd
export const FAIR_MODELS = [
  '/assets/loto/patron-1.png',        // 0: Khán giả nam chăm chú dò vé
  '/assets/loto/patron-2.png',        // 1: Khán giả giơ vé hô Kinh
  '/assets/nhau/patron-female-1.png', // 2: Bạn nữ trẻ trung áo pastel
  '/assets/nhau/patron-female-2.png', // 3: Bạn nữ nâng ly / vẫy tay
  '/assets/nhau/patron-1.png',        // 4: Thanh niên áo thun streetwear
  '/assets/nhau/patron-uncle-1.png',  // 5: Chú trung niên vui tính
];

export const DEFAULT_AVATARS = [
  { bg: 'from-rose-500 to-pink-600', icon: '👧' },
  { bg: 'from-sky-500 to-blue-700', icon: '👦' },
  { bg: 'from-amber-500 to-orange-600', icon: '👨' },
  { bg: 'from-emerald-500 to-teal-700', icon: '👩' },
  { bg: 'from-violet-500 to-purple-700', icon: '😎' },
  { bg: 'from-fuchsia-500 to-pink-700', icon: '🧢' },
  { bg: 'from-orange-500 to-red-600', icon: '🥳' },
  { bg: 'from-yellow-400 to-amber-600', icon: '✨' },
];

/**
 * KHÁN ĐÀI HỘI CHỢ LÔ TÔ DÂN GIAN:
 * 1. 31 người ngồi quây quần gần nhau ở trung tâm (Row 5 -> Row 1, y: 60% - 93%).
 * 2. Nếu còn người thì xếp vào các hàng đằng sau hướng về bục gỗ (Row 0, Row -1, Row -2, y: 44% - 55%).
 * 3. TẤT CẢ TÊN KHÁN GIẢ ĐỀU Ở TRÊN ĐẦU (Head Nameplate: [Avatar + Tên]), dưới chân hoàn toàn sạch đẹp.
 */
export const FAIR_SEATS = [
  // HÀNG 5 (Hàng tiền cảnh sát mép dưới - 5 chỗ, scale 1.05, y: ~92.5%)
  { x: 18, y: 92.0, scale: 1.04, flip: false, modelIdx: 1 }, // 0
  { x: 34, y: 92.5, scale: 1.05, flip: false, modelIdx: 0 }, // 1
  { x: 50, y: 93.0, scale: 1.06, flip: false, modelIdx: 2 }, // 2
  { x: 66, y: 92.5, scale: 1.05, flip: true,  modelIdx: 4 }, // 3
  { x: 82, y: 92.0, scale: 1.04, flip: true,  modelIdx: 3 }, // 4

  // HÀNG 4 (Hàng cận cảnh - 6 chỗ, scale 0.93, y: ~84.5%)
  { x: 16, y: 83.5, scale: 0.92, flip: false, modelIdx: 4 }, // 5
  { x: 30, y: 84.2, scale: 0.93, flip: false, modelIdx: 2 }, // 6
  { x: 43, y: 84.8, scale: 0.94, flip: false, modelIdx: 0 }, // 7
  { x: 57, y: 84.8, scale: 0.94, flip: true,  modelIdx: 1 }, // 8
  { x: 70, y: 84.2, scale: 0.93, flip: true,  modelIdx: 3 }, // 9
  { x: 84, y: 83.5, scale: 0.92, flip: true,  modelIdx: 5 }, // 10

  // HÀNG 3 (Hàng giữa hội trường - 7 chỗ, scale 0.83, y: ~76.5%)
  { x: 15, y: 75.5, scale: 0.82, flip: false, modelIdx: 1 }, // 11
  { x: 27, y: 76.0, scale: 0.83, flip: false, modelIdx: 3 }, // 12
  { x: 38, y: 76.5, scale: 0.84, flip: false, modelIdx: 5 }, // 13
  { x: 50, y: 77.0, scale: 0.85, flip: false, modelIdx: 0 }, // 14
  { x: 62, y: 76.5, scale: 0.84, flip: true,  modelIdx: 2 }, // 15
  { x: 73, y: 76.0, scale: 0.83, flip: true,  modelIdx: 4 }, // 16
  { x: 85, y: 75.5, scale: 0.82, flip: true,  modelIdx: 1 }, // 17

  // HÀNG 2 (Hàng sau trung tâm - 7 chỗ, scale 0.74, y: ~68.5%)
  { x: 17, y: 67.5, scale: 0.73, flip: false, modelIdx: 5 }, // 18
  { x: 28, y: 68.0, scale: 0.74, flip: false, modelIdx: 0 }, // 19
  { x: 39, y: 68.5, scale: 0.75, flip: false, modelIdx: 2 }, // 20
  { x: 50, y: 69.0, scale: 0.76, flip: false, modelIdx: 1 }, // 21
  { x: 61, y: 68.5, scale: 0.75, flip: true,  modelIdx: 3 }, // 22
  { x: 72, y: 68.0, scale: 0.74, flip: true,  modelIdx: 4 }, // 23
  { x: 83, y: 67.5, scale: 0.73, flip: true,  modelIdx: 0 }, // 24

  // HÀNG 1 (Hàng đầu cụm 31 người - 6 chỗ, scale 0.65, y: ~60.5%)
  { x: 20, y: 60.0, scale: 0.64, flip: false, modelIdx: 0 }, // 25
  { x: 32, y: 60.5, scale: 0.65, flip: false, modelIdx: 2 }, // 26
  { x: 44, y: 61.0, scale: 0.66, flip: false, modelIdx: 1 }, // 27
  { x: 56, y: 61.0, scale: 0.66, flip: true,  modelIdx: 4 }, // 28
  { x: 68, y: 60.5, scale: 0.65, flip: true,  modelIdx: 3 }, // 29
  { x: 80, y: 60.0, scale: 0.64, flip: true,  modelIdx: 5 }, // 30

  // HÀNG PHÍA SAU (NẾU CÒN THÊM NGƯỜI THÌ XẾP ĐẰNG SAU - ROW 0, ROW -1)
  // Row 0 (Hàng phía sau 1 - 8 chỗ, scale 0.56, y: ~55.5%)
  { x: 17, y: 55.0, scale: 0.55, flip: false, modelIdx: 4 }, // 31
  { x: 26, y: 55.4, scale: 0.56, flip: false, modelIdx: 1 }, // 32
  { x: 36, y: 55.7, scale: 0.56, flip: false, modelIdx: 3 }, // 33
  { x: 45, y: 56.0, scale: 0.57, flip: false, modelIdx: 5 }, // 34
  { x: 55, y: 56.0, scale: 0.57, flip: true,  modelIdx: 0 }, // 35
  { x: 64, y: 55.7, scale: 0.56, flip: true,  modelIdx: 2 }, // 36
  { x: 74, y: 55.4, scale: 0.56, flip: true,  modelIdx: 4 }, // 37
  { x: 83, y: 55.0, scale: 0.55, flip: true,  modelIdx: 1 }, // 38

  // Row -1 (Hàng phía sau 2 sát chân bục gỗ - 8 chỗ, scale 0.48, y: ~50.5%)
  { x: 19, y: 50.0, scale: 0.47, flip: false, modelIdx: 2 }, // 39
  { x: 28, y: 50.3, scale: 0.48, flip: false, modelIdx: 0 }, // 40
  { x: 37, y: 50.6, scale: 0.49, flip: false, modelIdx: 4 }, // 41
  { x: 46, y: 50.8, scale: 0.49, flip: false, modelIdx: 1 }, // 42
  { x: 54, y: 50.8, scale: 0.49, flip: true,  modelIdx: 3 }, // 43
  { x: 63, y: 50.6, scale: 0.49, flip: true,  modelIdx: 5 }, // 44
  { x: 72, y: 50.3, scale: 0.48, flip: true,  modelIdx: 2 }, // 45
  { x: 81, y: 50.0, scale: 0.47, flip: true,  modelIdx: 0 }, // 46
];

/**
 * THỨ TỰ LẤP ĐẦY CHỖ NGỒI (SEAT FILL ORDER):
 * 1. Nhóm 31 người đầu: Lấp đầy trọn vẹn cụm 31 ghế gần nhau (Row 5 -> Row 1).
 * 2. Người thứ 32 trở đi: Tiếp tục ngồi các hàng đằng sau hướng về phía bục gỗ sân khấu.
 */
export const SEAT_FILL_ORDER = [
  // 1. Nhóm 1-5 người: Tiền cảnh trung tâm
  2, 1, 3, 7, 8,
  // 2. Nhóm 6-11 người: Tiền cảnh & Cận cảnh
  0, 4, 14, 6, 9, 13,
  // 3. Nhóm 12-21 người: Hàng giữa & Cận cảnh
  15, 5, 10, 21, 12, 16, 20, 22, 11, 17,
  // 4. Nhóm 22-31 người: Lấp đầy hàng 2 & hàng 1 (Tròn 31 người quây quần gần nhau)
  19, 23, 18, 24, 27, 28, 26, 29, 25, 30,
  // 5. Nếu còn thêm người: Tự động xếp vào các hàng đằng sau
  34, 35, 33, 36, 32, 37, 31, 38,
  42, 43, 41, 44, 40, 45, 39, 46,
];

export const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
