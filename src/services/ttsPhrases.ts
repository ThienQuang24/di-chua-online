import { containsBanned } from './bannedWords';

export function formatUsernameForTts(username: string): string {
  if (!username) return 'bạn';

  let clean = username
    .normalize('NFKC')
    .replace(/[︀-️‍⃣]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}\s._-]/gu, ' ')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean || containsBanned(clean)) return 'bạn';

  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  clean = clean.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  clean = clean.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  clean = clean.replace(/[._\-]+/g, ' ');

  const digitWords: Record<string, string> = {
    '0': 'không',
    '1': 'một',
    '2': 'hai',
    '3': 'ba',
    '4': 'bốn',
    '5': 'năm',
    '6': 'sáu',
    '7': 'bảy',
    '8': 'tám',
    '9': 'chín',
  };

  const words = clean.split(/\s+/).filter(Boolean);
  const processed: string[] = [];

  for (const w of words) {
    if (/^\d+$/.test(w)) {
      const spelled = w
        .split('')
        .map((d) => digitWords[d] || d)
        .join(' ');
      processed.push(spelled);
      continue;
    }

    const lower = w.toLowerCase();

    if (lower === 'thanhtam') {
      processed.push('Thanh Tâm');
      continue;
    }
    if (lower === 'minhtue') {
      processed.push('Minh Tuệ');
      continue;
    }
    if (lower === 'tuyetmai') {
      processed.push('Tuyết Mai');
      continue;
    }
    if (lower === 'luukikim') {
      processed.push('Lưu Ki Kim');
      continue;
    }

    const prefixes = [
      'duy', 'thanh', 'minh', 'tuyet', 'ngoc', 'phuc', 'van', 'xuan',
      'kim', 'hong', 'hoang', 'quoc', 'viet', 'hai', 'nam', 'quang',
      'tien', 'trung', 'tuan'
    ];

    let splitDone = false;
    for (const p of prefixes) {
      if (lower.startsWith(p) && lower.length > p.length) {
        processed.push(w.slice(0, p.length), w.slice(p.length));
        splitDone = true;
        break;
      }
    }

    if (!splitDone) {
      processed.push(w);
    }
  }

  return processed.join(' ');
}

export const WISHES = [
  'Chúc {who} thân tâm an lạc, bao phiền muộn đều nhẹ đi ạ.',
  'Chúc {who} sức khỏe dồi dào, cha mẹ ở nhà luôn mạnh khỏe ạ.',
  'Chúc {who} làm ăn thuận lợi, tài lộc dồi dào ạ.',
  'Chúc gia đình {who} êm ấm, con cháu hiếu thảo ạ.',
  'Chúc {who} công việc hanh thông, ra đường gặp quý nhân ạ.',
  'Chúc {who} học hành tấn tới, thi cử đỗ đạt ạ.',
  'Chúc {who} sớm gặp được người thương, duyên lành trọn vẹn ạ.',
  'Chúc {who} tai qua nạn khỏi, đi đâu cũng bình yên ạ.',
  'Chúc {who} phước lộc đầy nhà, vạn sự như ý ạ.',
  'Chúc {who} lòng luôn thanh thản, gặp chuyện gì cũng bình tĩnh vượt qua ạ.',
  'Chúc nhà {who} trên thuận dưới hòa, ấm no hạnh phúc ạ.',
  'Chúc {who} mọi điều mong cầu đều sớm thành tựu ạ.',
];

export const OFFERING_BLESSINGS = [
  'Nam mô A Di Đà Phật. Kính chúc quý vị một ngày bình an, công việc thuận lợi, mọi điều muộn phiền dần được hóa giải, tâm luôn nhẹ nhàng và an nhiên.',
  'Nguyện cho quý vị đang nỗ lực mỗi ngày sớm nhìn thấy thành quả xứng đáng. Dù đường đời còn nhiều thử thách, mong quý vị luôn vững lòng và không đánh mất niềm tin.',
  'Chúc quý vị sáng thức dậy với một tâm hồn nhẹ nhõm, tối trở về với một trái tim bình yên. Mong mỗi ngày trôi qua đều có những niềm vui nhỏ đáng trân trọng.',
  'Nguyện cho những ai đang áp lực vì công việc, học hành và cuộc sống tìm được chút bình yên trong tâm. Mong quý vị đủ sức khỏe, đủ kiên nhẫn và đủ sáng suốt để bước tiếp.',
  'Chúc quý vị làm việc gặp người thiện lành, học hành ngày càng tiến bộ, những dự định đang ấp ủ từng bước trở thành hiện thực.',
  'Nam mô A Di Đà Phật. Nguyện cho quý vị và gia đình luôn mạnh khỏe, trên dưới thuận hòa, trong nhà đầy ắp tiếng cười, ngoài đời gặp nhiều nhân duyên tốt đẹp.',
  'Mong quý vị không quá buồn vì những điều đã qua, cũng không quá lo về những chuyện chưa tới. Hãy trân trọng hiện tại và dành cho bản thân một chút dịu dàng.',
  'Chúc những người trẻ đang tìm kiếm hướng đi cho mình có đủ bản lĩnh để thử sức, đủ kiên trì để trưởng thành và đủ bình tĩnh để không so sánh cuộc đời mình với người khác.',
  'Nguyện cho quý vị đang mưu sinh xa nhà luôn được bình an trên mỗi chặng đường. Mong công việc ổn định, sức khỏe dồi dào và sớm có những ngày sum họp ấm áp bên gia đình.',
  'Chúc quý vị tài chính ngày càng ổn định, biết vun vén và sử dụng đồng tiền một cách sáng suốt. Mong những nỗ lực chân chính mang lại cuộc sống đủ đầy và an tâm.',
  'Nam mô A Di Đà Phật. Nguyện cho ai đang mang trong lòng nỗi buồn có thêm sức mạnh để vượt qua. Mong những tổn thương dần được xoa dịu và niềm vui lại ghé thăm.',
  'Chúc quý vị đang học tập, thi cử có tâm trí sáng suốt, tinh thần vững vàng, tiếp thu kiến thức tốt và đạt được kết quả tương xứng với công sức đã bỏ ra.',
  'Mong quý vị giữa những bộn bề cuộc sống vẫn dành được thời gian nghỉ ngơi, chăm sóc sức khỏe và quan tâm đến những người thân yêu.',
  'Nguyện cho những ai đang bắt đầu công việc mới, dự án mới hay hành trình mới luôn giữ được sự tự tin, gặp được người đồng hành tốt và từng bước tiến về phía trước.',
  'Chúc quý vị có những mối quan hệ chân thành, biết yêu thương đúng cách, biết buông bỏ điều không phù hợp và trân trọng những người thật lòng bên cạnh mình.',
  'Nam mô A Di Đà Phật. Nguyện cho cha mẹ và những bậc sinh thành luôn được khỏe mạnh, sống vui bên con cháu. Mong mỗi gia đình đều có thêm thời gian yêu thương và sẻ chia.',
  'Chúc quý vị hôm nay dù có bận rộn đến đâu vẫn tìm được một khoảnh khắc bình yên. Một hơi thở sâu, một nụ cười nhẹ, đôi khi cũng đủ làm ngày dài trở nên dễ chịu hơn.',
  'Nguyện cho quý vị đang gặp khó khăn không đánh mất hy vọng. Mong từng vấn đề dần tìm được hướng giải quyết, từng bước nhỏ hôm nay mở ra những cơ hội tốt đẹp ngày mai.',
  'Chúc quý vị luôn giữ được tâm thiện lành, lời nói hòa nhã và cách sống chân thành. Mong những điều tốt đẹp quý vị trao đi sẽ góp phần làm cuộc sống thêm ấm áp.',
  'Nam mô A Di Đà Phật. Kính chúc toàn thể quý vị đang hiện diện tại Tâm Tịnh Tâm An thân tâm an lạc, gia đạo bình an, công việc hanh thông, trí tuệ sáng suốt và mỗi ngày đều có thêm một lý do để mỉm cười.',
];

export const FAMILY_BLESSINGS = OFFERING_BLESSINGS.filter((b) => /gia đình|gia đạo|cha mẹ/.test(b));

export const SHARE_REMINDER_PHRASES = [
  'Nam mô A Di Đà Phật. Quý phật tử nhớ bấm chia sẻ live cho bạn bè, người thân cùng vào nghe nhé. Chúc cả nhà phước lộc đầy nhà, vạn sự hanh thông ạ.',
  'Dạ, ai nghe thấy lòng nhẹ nhõm thì chia sẻ live này cho người thương cùng nghe với ạ. Chúc quý vị phước lộc đầy nhà, vạn sự hanh thông.',
  'A Di Đà Phật. Thêm một người cùng nghe là thêm một phần an lành. Quý vị bấm chia sẻ giúp kênh nhé, chúc phước lộc đầy nhà, vạn sự hanh thông ạ.',
];
