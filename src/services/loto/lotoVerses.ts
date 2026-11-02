// Bộ bài hát xướng số Lô Tô dân gian Việt Nam đầy đủ 90 số
// Được biên soạn theo điệu hò, câu hát cải biên, thơ lục bát và ca dao hội chợ miền Nam.
// Âm điệu rộn ràng, giàu vần điệu để giọng đọc AI (Hoài My / Nam Minh) ngắt nhịp hát truyền cảm.

export const LOTO_INTRO_VERSES: string[] = [
  "Cờ ra con mấy, con mấy con cờ ra... Lẳng lặng mà nghe, nghe tôi xướng số con cờ ra...",
  "Là con số gì đây, số gì nó ra đây... Bà con cô bác lắng tai mà nghe...",
  "Tay cầm tờ vé, mắt ngó lên sân khấu, tai lắng nghe câu hò, số gì nó ra đây...",
  "Đêm nay hội mở tưng bừng, cờ ra con mấy đón mừng vận may...",
  "Trời mưa ướt lá me bay, ai mua vé số chiều nay trúng liền...",
  "Gió đưa cành trúc la đà, hội vui Lô Tô tiếng ca rộn ràng...",
  "Trăm hoa đua nở đón xuân, tiếng chuông đồng vọng xa gần lắng nghe...",
  "Nghe vẻ nghe ve, nghe vè kêu số, con cờ may mắn xướng khúc tơ duyên...",
  "Vui sao tiếng hát câu hò, tay cầm tờ vé chăm lo dò tìm...",
  "Một duyên hai nợ ba tình, Lô Tô đêm hội xập xình đón may..."
];

export const LOTO_SPECIAL_VERSES: Record<number, string> = {
  "1": "Đi ngang qua chợ Bến Thành, thấy cô em gái nghiêng vành nón che.\nGió đưa chiếc áo bà ba, nụ cười duyên dáng làm ta say lòng...\nCờ ra con số Một! Là con số Một (01)!",
  "2": "Đôi chim én liệng trời xanh, chúc cho đôi lứa duyên lành trăm năm.\nThương nhau tơ tóc bạc đầu, son sắt một lòng chẳng đổi thay...\nLà con số Hai! Đôi chim câu số Hai (02)!",
  "3": "Ba mặt một lời chuyện trăm năm, trầu cau dạm ngõ duyên thắm tình nồng.\nThương em chẳng quản đường xa, qua sông đò vắng đón người tri âm...\nCờ ra con số Ba! Con số Ba (03)!",
  "4": "Bốn biển là nhà bốn phương hội tụ, anh em chung một mái ấm tình thương.\nĐêm nay hội mở xập xình, ai may ai mắn đón lộc đầu xuân...\nLà con số Bốn! Con số Bốn (04)!",
  "5": "Năm anh em trên một chiếc xe tăng, như năm bông sen ngát hương đời.\nĐồng lòng chung sức vượt ngàn gian khó, vinh quang rực rỡ đón chào ngày mới...\nCờ ra con số Năm! Con số Năm (05)!",
  "6": "Lục bình trôi sông sáu cánh tím ngát, nhớ người em gái bên dòng sông quê.\nChiều chiều ra bến trông mong, bóng con đò nhỏ xuôi dòng về đâu...\nLà con số Sáu! Con số Sáu (06)!",
  "7": "Bảy nổi ba chìm với nước non, tấm lòng son sắt thủy chung vẹn toàn.\nDù cho đá mòn sông cạn, tấc dạ sắt son chẳng chút phai tàn...\nCờ ra con số Bảy! Con số Bảy (07)!",
  "8": "Bát cơm đầy nghĩa mẹ ơn cha, hạt ngọc trần gian nuôi con khôn lớn.\nCông cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra...\nLà con số Tám! Con số Tám (08)!",
  "9": "Chín tầng mây bay lượn ngút ngàn, thần tiên dạo gót cõi bồng lai.\nChúc cho cô bác phát tài, công thành danh toại đón mai đón đào...\nCờ ra con số Chín! Con số Chín (09)!",
  "10": "Mười phân vẹn mười trọn chữ ân tình, trong ngoài chu tất nghĩa tình thâm sâu.\nTrăm năm duyên thắm bách niên, gia đạo bình yên phúc đức vẹn tròn...\nLà con số Mười! Mười phân vẹn mười số Mười (10)!",
  "11": "Đôi đũa so le đầu giường, tình duyên lận đận vấn vương tơ lòng.\nĐợi chờ qua mấy mùa trăng, mong ngày sum họp đắp bồi duyên may...\nCờ ra con Mười Một! Đôi đũa số Mười Một (11)!",
  "12": "Trúc xinh trúc mọc đầu đình, em xinh em đứng một mình cũng duyên.\nMười hai bến nước biết bến nào trong, thương em hôm sớm long đong gánh hàng...\nCờ ra con Mười Hai! Là con Mười Hai (12)!",
  "13": "Mười ba con hạc bay về phương Nam, rợp cánh mây trời đón nắng xuân sang.\nĐường xa vạn dặm chẳng màng, mang tin vui tới cho nàng chờ mong...\nLà con Mười Ba! Con số Mười Ba (13)!",
  "14": "Mười bốn trăng non e ấp đón chờ, đêm rằm trăng sáng dệt vần thơ duyên.\nNgước nhìn cung quảng xa xôi, ước ao đôi lứa trọn đời bên nhau...\nCờ ra con Mười Bốn! Con số Mười Bốn (14)!",
  "15": "Rằm tháng giêng trăng sáng lung linh, vằng vặc đầu đình tỏ rạng muôn nơi.\nCầu cho mưa thuận gió hòa, nhà nhà ấm no rạng ngời niềm vui...\nLà con Mười Lăm! Rằm trăng tròn Mười Lăm (15)!",
  "16": "Tuổi trăng tròn mười sáu đẹp xinh, má thắm môi hồng tóc xõa ngang vai.\nEm đi trẩy hội mùa xuân, bao chàng ngơ ngẩn đứng nhìn ngẩn ngơ...\nCờ ra con Mười Sáu! Trăng tròn Mười Sáu (16)!",
  "17": "Bẻ gãy sừng trâu tuổi mười bảy rạng ngời, sức trẻ xông pha dựng xây non sông.\nChí lớn vươn tới trời mây, tự hào tiến bước tương lai rạng ngời...\nLà con Mười Bảy! Tuổi trẻ Mười Bảy (17)!",
  "18": "Mười tám thôn vườn trầu ngát hương cau, đường về Hóc Môn bóng dừa xanh mát.\nCâu hò điệu lý quê hương, dạt dào tình nghĩa muôn đời không phai...\nCờ ra con Mười Tám! Thôn vườn trầu Mười Tám (18)!",
  "19": "Mười chín bước chân tìm về cố hương, nhớ mái tranh xưa khói lam ban chiều.\nBao năm lưu lạc phương xa, nay về đất mẹ chan hòa yêu thương...\nLà con Mười Chín! Con số Mười Chín (19)!",
  "20": "Tuổi đôi mươi phơi phới niềm tin, tương lai rộng mở thênh thang đón chào.\nKhát vọng tuổi trẻ vươn cao, chung tay thắp sáng bao niềm ước mơ...\nCờ ra con Hai Mươi! Tuổi trẻ Hai Mươi (20)!",
  "21": "Hai mươi mốt tuổi xuân thì, tình duyên chớm nở ngập ngừng đón đưa.\nThương em chẳng ngại nắng mưa, sớm hôm lui tới cho vừa lòng nhau...\nLà con Hai Mươi Mốt! Con số Hai Mươi Mốt (21)!",
  "22": "Đôi thiên nga lướt trên mặt hồ, trắng muốt dịu dàng sánh bước bên nhau.\nTình chàng ý thiếp trọn đời, thủy chung son sắt muôn đời không phai...\nCờ ra con Hai Mươi Hai! Cặp thiên nga Hai Mươi Hai (22)!",
  "23": "Hai mươi ba đưa ông Táo về trời, cá chép hóa rồng cưỡi mây đạp gió.\nTáo quân tâu chuyện nhân gian, ban cho tài lộc bình an muôn nhà...\nLà con Hai Mươi Ba! Đưa ông Táo Hai Mươi Ba (23)!",
  "24": "Đêm nằm mơ thấy bóng người xưa, ngày trông đêm nhớ nắng mưa dãi dầu.\nHai tư giờ cách trở nhịp cầu, một ngày không gặp tựa ba thu sầu...\nCờ ra con Hai Mươi Tư! Con số Hai Mươi Tư (24)!",
  "25": "Hai lăm bến phà ngược xuôi dòng sông, đưa khách sang bờ đón gió mênh mông.\nNước ròng nước lớn đẩy đưa, bóng người con gái đón chờ người thương...\nLà con Hai Mươi Lăm! Bến phà Hai Mươi Lăm (25)!",
  "26": "Hai sáu đường tơ dệt gấm thêu hoa, tay khéo em may chiếc áo dài duyên.\nNắng vàng rực rỡ qua hiên, chúc cho cô bác bình yên sang giàu...\nCờ ra con Hai Mươi Sáu! Con số Hai Mươi Sáu (26)!",
  "27": "Hai bảy đóa hoa dâng mẹ hiền, lòng thành hiếu kính đáp đền ơn sâu.\nCầu mong cha mẹ sống lâu, hưởng phúc an lạc cùng đàn cháu con...\nLà con Hai Mươi Bảy! Đóa hoa hiếu kính Hai Mươi Bảy (27)!",
  "28": "Hai tám bến đò rộn rã đón xuân, tiếng cười khúc khích vang xa ngút ngàn.\nThuyền hoa chở sắc mai vàng, đón tết sum vầy ngập tràn yêu thương...\nCờ ra con Hai Mươi Tám! Bến đò Hai Mươi Tám (28)!",
  "29": "Hai chín ngày dài trông ngóng tin vui, cánh chim thiên lý mang về bình an.\nQua rồi những nỗi gian nan, mừng ngày tái hợp chứa chan ân tình...\nLà con Hai Mươi Chín! Con số Hai Mươi Chín (29)!",
  "30": "Ba mươi chưa phải là Tết, vội chi cô bác hãy còn cơ may.\nĐêm nay gom hết vận may, rinh ngay giải thưởng về tay rạng ngời...\nCờ ra con Ba Mươi! Đêm giao thừa Ba Mươi (30)!",
  "31": "Ba mươi mốt đóa sen ngát hương, ngát tỏa hương thơm khắp chốn thiền môn.\nTâm an tĩnh tại dịu dàng, phúc đức tài lộc ngập tràn niềm vui...\nLà con Ba Mươi Mốt! Đóa sen Ba Mươi Mốt (31)!",
  "32": "Ba mươi hai chiếc răng khôn mỉm cười duyên, duyên dáng làm sao nụ cười mùa xuân.\nNụ cười xua hết nhọc nhằn, chúc cho cô bác muôn phần tươi vui...\nCờ ra con Ba Mươi Hai! Nụ cười Ba Mươi Hai (32)!",
  "33": "Con ba ba béo tốt nằm phơi nắng vàng, rùa vàng đội tháp mang ngọc về đây.\nLộc tài phú quý sum vầy, làm ăn phát đạt đời đầy ấm no...\nLà con Ba Mươi Ba! Con ba ba Ba Mươi Ba (33)!",
  "34": "Ba tư gác tía lầu son rực rỡ, đèn hoa giăng lối đón khách thập phương.\nĐêm vui câu hát vấn vương, chúc cho tài lộc bốn phương đổ về...\nCờ ra con Ba Mươi Tư! Gác tía Ba Mươi Tư (34)!",
  "35": "Ba lăm con dê núi nhảy nhót sườn đồi, râu dài phơ phất tung tăng dạo chơi.\nDê cười hỉ xả thảnh thơi, chúc cho cô bác trọn đời an khang...\nLà con Ba Mươi Lăm! Con dê Ba Mươi Lăm (35)!",
  "36": "Rủ nhau chơi khắp Long Thành, ba mươi sáu phố rành rành chẳng sai.\nHàng Đào, Hàng Bạc, Hàng Gai, lung linh phố cổ nhớ ai sớm chiều...\nCờ ra con Ba Mươi Sáu! Phố cổ Ba Mươi Sáu (36)!",
  "37": "Ba bảy thước lụa mềm mại thướt tha, dệt nên tà áo dịu dàng quê hương.\nEm đi trẩy hội bốn phương, để bao thương nhớ tơ vương trong lòng...\nLà con Ba Mươi Bảy! Thước lụa Ba Mươi Bảy (37)!",
  "38": "Ông Địa bụng bự phe phẩy quạt mo, miệng cười rạng rỡ ban phúc ban tài.\nCầu cho buôn bán đắt hàng, tiền vô như nước bạc vàng đầy kho...\nCờ ra con Ba Mươi Tám! Ông Địa nhỏ Ba Mươi Tám (38)!",
  "39": "Thần Tài gõ cửa phát lộc muôn phương, rước ngọc đón vàng vào tận buồng trong.\nLàm ăn phát đạt hanh thông, công thành danh toại thỏa lòng ước mong...\nLà con Ba Mươi Chín! Thần Tài nhỏ Ba Mươi Chín (39)!",
  "40": "Bốn mươi năm tròn son sắt nghĩa phu thê, gừng cay muối mặn xin đừng quên nhau.\nTrải qua giông bão dãi dầu, tình sâu nghĩa nặng bền lâu trọn đời...\nCờ ra con Bốn Mươi! Tròn trĩnh số Bốn Mươi (40)!",
  "41": "Bốn mươi mốt đóa hồng tươi thắm, ngát hương ngào ngạt đón gió ban mai.\nTặng người tri kỷ sớm mai, thắt chặt tình bạn muôn đời không phai...\nLà con Bốn Mươi Mốt! Đóa hồng Bốn Mươi Mốt (41)!",
  "42": "Bốn mươi hai nhịp cầu vồng lung linh, bắc qua dải mây nối liền đôi bờ.\nĐưa người viễn xứ xa quê, nay về hội ngộ đề huề vui tươi...\nCờ ra con Bốn Mươi Hai! Cầu vồng Bốn Mươi Hai (42)!",
  "43": "Bốn mươi ba con sóng vỗ bờ cát trắng, biển xanh lồng lộng gió thổi mênh mông.\nThuyền ai chở nặng niềm tin, mang về mẻ cá lộc tình đầy khoang...\nLà con Bốn Mươi Ba! Sóng biển Bốn Mươi Ba (43)!",
  "44": "Bốn tư mùa hoa ngát hương trần gian, xuân hạ thu đông đượm thắm ân tình.\nTrời ban phúc lộc an khang, chúc cho vạn sự trăm đường thuận buồm...\nCờ ra con Bốn Mươi Tư! Con số Bốn Mươi Tư (44)!",
  "45": "Bốn mươi lăm phút một hiệp bóng say mê, cầu thủ tranh tài rực lửa cầu trường.\nTiếng reo tiếng hò cổ vũ, chiến thắng vinh quang rạng rỡ cờ hoa...\nLà con Bốn Mươi Lăm! Hiệp đấu Bốn Mươi Lăm (45)!",
  "46": "Bốn sáu bến thuyền ngược xuôi xuôi ngược, buồm giương đón gió lướt sóng ra khơi.\nTàu về tôm cá đầy khoang, dân làng mở hội rộn ràng tiếng reo...\nCờ ra con Bốn Mươi Sáu! Bến thuyền Bốn Mươi Sáu (46)!",
  "47": "Bốn bảy nụ cười rạng rỡ đón duyên, trăm hoa đua nở rộn rã đầu đình.\nChúc cho cô bác thân tình, trúng ván lô tô tươi xinh rạng ngời...\nLà con Bốn Mươi Bảy! Con số Bốn Mươi Bảy (47)!",
  "48": "Bốn tám cung đàn thánh thót ngân nga, điệu đàn tri kỷ ấm áp tình quê.\nTiếng tơ tiếng trúc gọi về, bao nhiêu ký ức say mê lòng người...\nCờ ra con Bốn Mươi Tám! Cung đàn Bốn Mươi Tám (48)!",
  "49": "Bốn mươi chín năm vượt ngàn sóng gió, nay bước qua đèo đón lộc hanh thông.\nQua cơn bĩ cực đến hồi thái lai, rạng rỡ nụ cười đón ánh bình minh...\nLà con Bốn Mươi Chín! Con số Bốn Mươi Chín (49)!",
  "50": "Năm mươi năm vàng kết nghĩa tình thân, tri âm tri kỷ trân quý ngàn đời.\nNâng ly cạn chén mừng vui, tình sâu nghĩa nặng muôn đời khắc ghi...\nCờ ra con Năm Mươi! Tròn trịa Năm Mươi (50)!",
  "51": "Năm mươi mốt lá cờ bay phấp phới, hội làng rộn rã trống giục liên hồi.\nBà con nô nức về xem, Lô Tô mở hội đón duyên đón tài...\nLà con Năm Mươi Mốt! Cờ hoa Năm Mươi Mốt (51)!",
  "52": "Năm mươi hai tuần một năm an vui, bốn mùa thịnh vượng sức khỏe dồi dào.\nChúc cho cô bác ngọt ngào, tài lộc như nước ào ào chảy vô...\nCờ ra con Năm Mươi Hai! Năm mươi hai tuần Năm Mươi Hai (52)!",
  "53": "Năm mươi ba tuổi tóc điểm hoa râm, phúc đức con cháu hiếu thảo vẹn tròn.\nAn nhàn vui thú điền viên, bình an thanh thản xua tan muộn phiền...\nLà con Năm Mươi Ba! Con số Năm Mươi Ba (53)!",
  "54": "Rừng vàng biển bạc bao la đất trời, năm tư dân tộc anh em một nhà.\nChung tay xây đắp nước non, Bắc Nam sum họp thắm nồng yêu thương...\nCờ ra con Năm Mươi Tư! Dân tộc Năm Mươi Tư (54)!",
  "55": "Năm mươi lăm con chim én lượn bay, cánh én chao nghiêng báo hiệu xuân về.\nCành mai khoe sắc vàng tươi, chúc cho cô bác rạng ngời nụ cười...\nLà con Năm Mươi Lăm! Đôi năm Năm Mươi Lăm (55)!",
  "56": "Năm sáu mùa trăng dạt dào kỷ niệm, nhớ bóng hình ai đứng đợi bên cầu.\nThời gian thoăn thoắt thoi đưa, tình xưa nghĩa cũ xin đừng nhạt phai...\nCờ ra con Năm Mươi Sáu! Kỷ niệm Năm Mươi Sáu (56)!",
  "57": "Năm bảy tiếng chuông ngân vang thanh bình, khói trầm lan tỏa xua hết ưu phiền.\nTâm thành hướng tới điều hay, đón nhận phúc lạc tràn đầy niềm vui...\nLà con Năm Mươi Bảy! Chuông ngân Năm Mươi Bảy (57)!",
  "58": "Năm tám đóa sen dâng đời thanh bạch, gần bùn chẳng chút hôi tanh mùi bùn.\nNgát hương thơm ngát đất trời, thanh cao phẩm hạnh rạng ngời nghìn năm...\nCờ ra con Năm Mươi Tám! Đóa sen Năm Mươi Tám (58)!",
  "59": "Năm chín giây trôi nín thở chờ mong, lồng cầu quay tít hồi hộp vô cùng.\nAi sắp KINH ván này đây, mau giơ tay lên đón mừng vận may...\nLà con Năm Mươi Chín! Nín thở Năm Mươi Chín (59)!",
  "60": "Sáu mươi năm một cuộc đời thanh thản, qua bao ghềnh thác về bến bình yên.\nAn nhàn con cháu sum vầy, sống lâu trăm tuổi tràn đầy phúc vinh...\nCờ ra con Sáu Mươi! Cuộc đời Sáu Mươi (60)!",
  "61": "Sáu mươi mốt dải ngân hà lấp lánh, ngàn sao soi sáng khắp cõi trời cao.\nƯớc mong duyên thắm ngọt ngào, phát tài phát lộc dạt dào yêu thương...\nLà con Sáu Mươi Mốt! Ngân hà Sáu Mươi Mốt (61)!",
  "62": "Sáu mươi hai câu ca dao mẹ ru êm đềm, ngọt ngào như dòng sữa mẹ nuôi con.\nBao năm khôn lớn thành người, ơn sâu nghĩa nặng muôn đời chẳng quên...\nCờ ra con Sáu Mươi Hai! Ca dao Sáu Mươi Hai (62)!",
  "63": "Sáu mươi ba tỉnh thành rộn rã tiếng cười, non sông gấm vóc rực rỡ ngàn hoa.\nTình quê nghĩa xóm đậm đà, đi đâu cũng nhớ quê nhà thân yêu...\nLà con Sáu Mươi Ba! Tỉnh thành Sáu Mươi Ba (63)!",
  "64": "Sáu tư quẻ dịch hanh thông vạn sự, thuận gió thuận mưa đắc tài đắc lộc.\nKinh doanh buôn bán hanh thông, công thành danh toại thỏa lòng ước mong...\nCờ ra con Sáu Mươi Tư! Quẻ dịch Sáu Mươi Tư (64)!",
  "65": "Sáu lăm ngọn đèn sáng rực đêm vui, hội chợ lung linh sắc màu rạng rỡ.\nTiếng cười rộn rã muôn phương, xin mời cô bác tiếp tục dò theo...\nLà con Sáu Mươi Lăm! Ngọn đèn Sáu Mươi Lăm (65)!",
  "66": "Sáu mươi sáu đóa mai vàng đón tết, lộc non đâm chồi rực rỡ đón xuân.\nCặp số may mắn song hành, vạn sự cát tường phúc thọ an khang...\nCờ ra con Sáu Mươi Sáu! Cặp đôi Sáu Mươi Sáu (66)!",
  "67": "Sáu bảy bước chân dạo phố đêm rằm, ngắm trăng ngắm gió ngắm cảnh phồn hoa.\nTay cầm tờ vé may sao, trúng con lô tô đón trọn niềm vui...\nLà con Sáu Mươi Bảy! Phố vui Sáu Mươi Bảy (67)!",
  "68": "Lộc phát lộc phát tài vinh rực rỡ, tiền vào như nước của cải đề huề.\nLàm ăn buôn bán hanh thông, thần tài ban phước ngập tràn niềm vui...\nCờ ra con Sáu Mươi Tám! Lộc phát Sáu Mươi Tám (68)!",
  "69": "Sáu chín con thuyền no gió ra khơi, buồm căng sóng lướt vượt đại dương xa.\nTàu về tôm cá đầy khoang, mùa vàng bội thu ngập tràn niềm vui...\nLà con Sáu Mươi Chín! Con thuyền Sáu Mươi Chín (69)!",
  "70": "Bảy mươi tuổi xưa nay hiếm có, đức độ trường tồn rạng rỡ gia phong.\nCây cao bóng cả che đời, chúc cho cha mẹ sống đời an vui...\nCờ ra con Bảy Mươi! Thất thập Bảy Mươi (70)!",
  "71": "Bảy mươi mốt vì sao sáng rực trời đêm, soi đường chỉ lối đón bến bình yên.\nTâm trong trí sáng kiên cường, vượt qua sóng gió vững vàng tiến lên...\nLà con Bảy Mươi Mốt! Vì sao Bảy Mươi Mốt (71)!",
  "72": "Bảy hai phép thần thông quảng đại, cưỡi mây lướt gió biến hóa khôn lường.\nTề Thiên Đại Thánh hiển linh, mang niềm vui tới cho người chờ mong...\nCờ ra con Bảy Mươi Hai! Phép tiên Bảy Mươi Hai (72)!",
  "73": "Bảy ba cung bậc tình khúc mê say, tiếng đàn réo rắt dạt dào tơ vương.\nKhúc ca tri kỷ ân tình, chúc cho duyên thắm muôn đời bên nhau...\nLà con Bảy Mươi Ba! Khúc ca Bảy Mươi Ba (73)!",
  "74": "Bảy tư nhánh trúc xanh tươi bên thềm, gió lay cành trúc nhẹ nhàng đung đưa.\nEm ngồi em dệt tơ tằm, đợi người viễn xứ nhớ lời hẹn xưa...\nCờ ra con Bảy Mươi Tư! Nhánh trúc Bảy Mươi Tư (74)!",
  "75": "Bảy mươi lăm đóa hướng dương đón ánh mặt trời, rực rỡ vàng ươm kiêu hãnh vươn cao.\nNiềm tin hy vọng ngập tràn, vinh quang thắp sáng nụ cười reo vang...\nLà con Bảy Mươi Lăm! Hướng dương Bảy Mươi Lăm (75)!",
  "76": "Bảy sáu khúc ca rộn ràng làng xóm, đờn ca tài tử réo rắt bên sông.\nNâng ly rượu nếp thơm nồng, chúc cho cô bác thỏa lòng ước mơ...\nCờ ra con Bảy Mươi Sáu! Làng xóm Bảy Mươi Sáu (76)!",
  "77": "Bảy mươi bảy đóa cát tường may mắn, cầu chúc bình an vạn sự cát tường.\nĐôi bảy vững bước kiên cường, phúc lộc song toàn gia đạo an vui...\nLà con Bảy Mươi Bảy! Đôi bảy Bảy Mươi Bảy (77)!",
  "78": "Thần Tài Thổ Địa phù hộ bình an, xua đi tà khí đón rước điều may.\nÔng Địa cười tươi cầm quạt, phát tài phát lộc cho người thành tâm...\nCờ ra con Bảy Mươi Tám! Ông Địa lớn Bảy Mươi Tám (78)!",
  "79": "Thần Tài đại phát tiền vào như nước, vàng bạc đầy kho phú quý vinh hoa.\nKhai trương đại phát phát tài, làm ăn tấn tới rạng ngời tương lai...\nLà con Bảy Mươi Chín! Thần Tài lớn Bảy Mươi Chín (79)!",
  "80": "Tám mươi cây số đường về quê hương, hàng dừa xanh mát đón bóng người xa.\nQuê hương nghĩa nặng tình sâu, bao năm phiêu bạt nay về sum vầy...\nCờ ra con Tám Mươi! Chẵn chòi Tám Mươi (80)!",
  "81": "Tám mươi mốt nạn thỉnh kinh đã vượt, Tây Du trọn đạo đón rước chân kinh.\nVượt qua muôn nỗi gập ghềnh, quả ngọt tươi thắm đón chào tương lai...\nLà con Tám Mươi Mốt! Trọn đạo Tám Mươi Mốt (81)!",
  "82": "Tám mươi hai lời chúc an khang thịnh vượng, chúc cho cô bác vạn sự như mơ.\nTiền tài danh vọng đủ đầy, gia đình hạnh phúc sum vầy an vui...\nCờ ra con Tám Mươi Hai! An khang Tám Mươi Hai (82)!",
  "83": "Tám ba cánh nhạn chao lượn trời cao, báo tin xuân tới ngập tràn niềm vui.\nNhạn bay qua chốn sông dài, mang ngàn lời chúc phát tài phát duyên...\nLà con Tám Mươi Ba! Cánh nhạn Tám Mươi Ba (83)!",
  "84": "Tám tư dải lụa mềm mại vắt ngang đồi, sương sớm long lanh đón ánh bình minh.\nCảnh quê sơn thủy hữu tình, chúc cho tình bạn thắm nồng bền lâu...\nCờ ra con Tám Mươi Tư! Dải lụa Tám Mươi Tư (84)!",
  "85": "Tám lăm ngọn đuốc thắp sáng tương lai, rực rỡ vinh quang thắp sáng niềm tin.\nVững vàng tiếp bước đường dài, vinh hoa phú quý đón chào ngày mai...\nLà con Tám Mươi Lăm! Ngọn đuốc Tám Mươi Lăm (85)!",
  "86": "Phát lộc phát tài gia đình êm ấm, ăn nên làm ra vạn sự hanh thông.\nChúc cho cô bác trong làng, tiền vô rủng rỉnh bạc vàng đầy tay...\nCờ ra con Tám Mươi Sáu! Phát lộc Tám Mươi Sáu (86)!",
  "87": "Tám bảy dòng sông đổ ra biển lớn, sóng vỗ mênh mông ôm trọn đất trời.\nTình người cao cả bao la, như dòng sữa mẹ chan hòa yêu thương...\nLà con Tám Mươi Bảy! Dòng sông Tám Mươi Bảy (87)!",
  "88": "Đầu xuân rước lộc vào nhà, song hỷ lâm môn nở hoa tưng bừng.\nĐại phát đại lợi vui mừng, chúc cho cô bác rủng rỉnh tiền tiêu...\nCờ ra con Tám Mươi Tám! Cặp phát Tám Mươi Tám (88)!",
  "89": "Tám chín nấc thang vươn tới thành công, kiên trì bền bỉ chinh phục đỉnh cao.\nVinh quang rực rỡ đón chào, bước lên đài vinh hiển ngập tràn niềm vui...\nLà con Tám Mươi Chín! Nấc thang Tám Mươi Chín (89)!",
  "90": "Đường dài vạn dặm thênh thang, hội vui Lô Tô tiếng hát rộn ràng ngàn phương.\nChín mươi tuổi hạc thọ trường, trọn vẹn ván cờ tài lộc vinh quang...\nVề trọn ván cờ! Cờ ra con Chín Mươi! Con số Chín Mươi (90)!"
};

export function getLotoChant(num: number): { verse: string; spokenText: string } {
  const intro = LOTO_INTRO_VERSES[Math.floor(Math.random() * LOTO_INTRO_VERSES.length)];
  const body = LOTO_SPECIAL_VERSES[num] || `Cờ ra con mấy, con mấy cờ ra... Con số ${num}!`;
  
  // Dòng thơ hiển thị trên sân khấu (2-3 câu nhịp nhàng)
  const verse = body;
  
  // Lời đọc hoàn chỉnh cho AI hát xướng: gồm khúc dạo đầu ngân nga + câu thơ vần điệu + chốt số hào sảng
  const spokenText = `${intro} ... ${body.replace(/\n/g, ' ')}`;
  
  return { verse, spokenText };
}
