import type { Chapter, LanguagePreference, SkillNode, Stage } from "./game-data";

export function t(language: LanguagePreference, vietnamese: string, english: string) {
  return language === "vi" ? vietnamese : english;
}

export const SUBJECT_LABELS = {
  Mathematics: "Toán học · Mathematics",
  Chemistry: "Hóa học · Chemistry",
  Physics: "Vật lý · Physics",
  Biology: "Sinh học · Biology",
} as const;

type LocalChapter = { title: string; subtitle: string; lore: string; stages: Array<{ title: string; lore: string }> };

const CHAPTERS_VI: LocalChapter[] = [
  {
    title: "Nền móng Aletheia", subtitle: "Học những định luật đang giữ vững Archives.",
    lore: "Dưới Grand Citadel, các tiên đề đầu tiên đang bị xóa. Astrea dẫn bạn xuống những kệ sách cổ nhất để khôi phục nền móng đã dựng nên Aletheia.",
    stages: [
      { title: "Tiền đề đầu tiên", lore: "Một chữ số phát sáng chờ ở nơi định lý đầu tiên từng được viết." },
      { title: "Chứng minh trong gương", lore: "Kho lưu trữ phản chiếu lặp lại mọi đáp án, ngoại trừ đáp án đúng." },
      { title: "Tổng bị vỡ", lore: "Các ký hiệu phép cộng nứt ra và rơi xuống từ trần thư viện." },
      { title: "Cỗ máy nghịch lý", lore: "Cỗ máy bằng đồng tạo ra mâu thuẫn nhanh hơn tốc độ chúng được bác bỏ." },
      { title: "Thư viện sau hoàng hôn", lore: "Khi đèn tắt, những chú thích bị lãng quên bắt đầu săn đuổi người đọc." },
      { title: "Vương miện phân số", lore: "Vương miện chia mọi điều chắc chắn thành những hoài nghi ngày càng nhỏ." },
    ],
  },
  {
    title: "Miền hoang đại số", subtitle: "Những biến số nổi loạn bên ngoài Citadel.",
    lore: "Ngoài tường thành, các biến đã thoát khỏi phương trình và lập nên vương quốc của ẩn số. Hãy lập lại cân bằng trước khi X chiếm mọi giá trị.",
    stages: [
      { title: "Kẻ lữ hành ẩn số", lore: "Một biến số trùm mũ đổi giá trị mỗi khi bạn rời mắt." },
      { title: "Khu vườn của X", lore: "Những rễ cây hình X hút ý nghĩa từ các công thức bị bỏ quên." },
      { title: "Phục kích tuyến tính", lore: "Các thợ săn tuyến tính tấn công từ hai phía của đường tọa độ." },
      { title: "Người khổng lồ nhân tử", lore: "Chỉ có thể phá vỡ nó khi tìm được các nhân tử chung." },
      { title: "Rừng số âm", lore: "Bên dưới số không, dấu đảo chiều và quy tắc quen thuộc trở nên thù địch." },
      { title: "Phương trình tối thượng", lore: "Kẻ cai trị tuyên bố mọi bài toán chỉ được có một nghiệm: phục tùng." },
    ],
  },
  {
    title: "Hình học của các vì sao", subtitle: "Nối lại những chòm sao phòng thủ trên bầu trời rạn nứt.",
    lore: "Các đồ hình thiên thể bảo vệ Aletheia đã lệch khỏi vị trí. Hãy nối lại các điểm trước khi bầu trời gấp thành một hình bất khả thi.",
    stages: [
      { title: "Điểm gốc", lore: "Mọi hành trình bắt đầu tại một điểm không rộng hơn một ý nghĩ." },
      { title: "Tam giác bất khả", lore: "Ba cạnh khép quanh một không gian lẽ ra không thể tồn tại." },
      { title: "Lối đi song song", lore: "Hai con đường hứa không bao giờ gặp nhau nhưng cùng dẫn tới một cánh cổng." },
      { title: "Vệ binh đa diện", lore: "Vệ binh nhiều mặt xoay chuyển liên tục giữa tấn công và phòng thủ." },
      { title: "Căn phòng tỉ lệ vàng", lore: "Căn phòng cộng hưởng theo tỉ lệ xuất hiện trong vỏ sò và các vì sao." },
      { title: "Con mắt Euclid", lore: "Con mắt đo mọi góc và phán xét từng sai lệch nhỏ nhất." },
    ],
  },
  {
    title: "Kho lưu trữ vô hạn", subtitle: "Đối mặt đệ quy, xác suất và Great Fallacy.",
    lore: "Ở rìa mục lục, các trang lặp lại vô tận. Great Fallacy đang viết lại ký ức và định lý lâu đời nhất của Astrea có thể là chiếc khóa cuối cùng.",
    stages: [
      { title: "Ngưỡng nhị phân", lore: "Cánh cổng chỉ mở cho đáp án được biểu diễn bằng hai trạng thái." },
      { title: "Câu đố của Turing", lore: "Một cỗ máy hỏi liệu chứng minh của bạn có bao giờ kết thúc." },
      { title: "Hành lang đệ quy", lore: "Mỗi hành lang chứa một bản sao nhỏ hơn của chính nó." },
      { title: "Thủ thư lượng tử", lore: "Thủ thư đồng thời đứng ở mọi kệ sách cho tới khi bị quan sát." },
      { title: "Ký ức của Astrea", lore: "Trang bị niêm phong chứa định lý mà Astrea đã chọn quên đi." },
      { title: "Great Fallacy", lore: "Dị thường cuối khẳng định sự thật chỉ là điều được lặp lại đủ nhiều." },
    ],
  },
  {
    title: "Chợ xác suất", subtitle: "Khi mọi lựa chọn đều có giá, bất định trở thành vũ khí.",
    lore: "Lada mở ra một khu chợ nơi tương lai được trao đổi như tiền xu. Great Fallacy đã chỉnh sai cán cân, khiến các Scholar nhầm lẫn may mắn với định mệnh.",
    stages: [
      { title: "Đồng xu thiên lệch", lore: "Đồng xu đứng trên cạnh và từ chối cho một kết quả chắc chắn." },
      { title: "Hẻm điều kiện", lore: "Mỗi lối đi phụ thuộc vào lối bạn đã chọn trước đó." },
      { title: "Giá trị kỳ vọng", lore: "Người bán định giá ngày mai bằng trung bình của mọi hình dạng có thể xảy ra." },
      { title: "Vệ binh phương sai", lore: "Vệ binh mạnh hơn khi các kết quả phân tán xa nhau." },
      { title: "Cánh cửa khó xảy ra", lore: "Cánh cửa gần như bất khả vẫn mở cho người chịu kiểm chứng." },
      { title: "Chứng minh của con bạc", lore: "Con bạc dùng xác suất để biện hộ cho mọi lựa chọn; bạn phải khôi phục trách nhiệm." },
    ],
  },
  {
    title: "Ranh giới giả kim", subtitle: "Hàn gắn những liên kết bị phá vỡ bởi sợ hãi và phản ứng bất cẩn.",
    lore: "Một khu phố từng được xây bằng hợp tác đang tách thành các nguyên tố đối nghịch. Những phản ứng ở đây phản chiếu một thành phố đã quên khác biệt có thể tạo liên kết bền hơn.",
    stages: [
      { title: "Điều tra nguyên tử", lore: "Mỗi công dân được nhận diện bằng số proton họ mang." },
      { title: "Cầu hóa trị", lore: "Electron đi qua cây cầu đòi hỏi lòng tin từ cả hai bờ." },
      { title: "Mưa axit", lore: "Tranh cãi cũ rơi từ mây và ăn mòn những ý tưởng mới." },
      { title: "Golem xúc tác", lore: "Chất xúc tác kiên nhẫn tăng tốc xung đột mà không bị tiêu hao." },
      { title: "Vườn cân bằng", lore: "Phản ứng thuận và nghịch học cách cùng tồn tại." },
      { title: "Kẻ phá liên kết", lore: "Nó cho rằng cô lập là ổn định; chương này yêu cầu bạn chứng minh điều ngược lại." },
    ],
  },
  {
    title: "Biên cương động lượng", subtitle: "Cho lực một hướng đi trước khi nó trở thành phá hủy.",
    lore: "Bãi tập cũ của Orion đã thành chiến trường của chuyển động mất kiểm soát. Sức mạnh thiếu suy xét lặp lại tổn thương nhanh hơn sau mỗi lần.",
    stages: [
      { title: "Giao lộ vector", lore: "Các mũi tên bất đồng cho tới khi từng thành phần được hiểu rõ." },
      { title: "Hành quân ma sát", lore: "Tiến độ chậm lại, để lộ những bề mặt đang chống lại chuyển động." },
      { title: "Mạch điện hoài nghi", lore: "Dòng điện chỉ trở lại khi mọi đường dẫn đứt gãy được nối kín." },
      { title: "Hiệp sĩ cộng hưởng", lore: "Một tần số lặp lại đe dọa làm rung vỡ toàn bộ biên cương." },
      { title: "Chân không tĩnh lặng", lore: "Trong im lặng, chuyển động vẫn tiếp tục dù không ai quan sát." },
      { title: "Titan động lượng", lore: "Titan nhầm tốc độ với mục đích; Orion nhờ bạn đổi hướng nó." },
    ],
  },
  {
    title: "Định lý sống", subtitle: "Thích nghi mà không đánh mất mô thức tạo nên chính mình.",
    lore: "Một khu rừng sinh vật tự chỉnh sửa đang xóa mọi đặc điểm bị gọi là không hoàn hảo. Helix Weaver dạy rằng sinh tồn không phải đồng nhất mà là biến thiên biết cân bằng.",
    stages: [
      { title: "Cổng tế bào", lore: "Màng tế bào quyết định điều được đi vào mà không khép mình trước thay đổi." },
      { title: "Dòng sông thẩm thấu", lore: "Nước vượt qua màng để tìm cân bằng, từng phân tử một." },
      { title: "Con đường di truyền", lore: "Đặc điểm đi về phía trước, mang theo cả món quà lẫn gánh nặng." },
      { title: "Quái thú chọn lọc", lore: "Nó chỉ thưởng cho một hình dạng và khiến cả khu rừng suy yếu." },
      { title: "Rừng nội cân bằng", lore: "Nhiều hệ thống cùng điều chỉnh để duy trì một khoảng sống." },
      { title: "Bản sao hoàn hảo", lore: "Bản sao hứa xóa bất định, đổi lại là mọi khả năng thích nghi trong tương lai." },
    ],
  },
  {
    title: "Biển ký ức", subtitle: "Tách ký ức dẫn đường khỏi câu chuyện giam giữ bạn.",
    lore: "Ký ức thất lạc của Aletheia tụ thành đại dương nơi hối tiếc lặp lại như sự thật. Astrea phải đối diện định lý mình đã xóa và lý do bà nghĩ quên đi sẽ bảo vệ mọi người.",
    stages: [
      { title: "Bờ vọng âm", lore: "Những giọng nói cũ quay lại, thay đổi đôi chút sau mỗi lần kể." },
      { title: "Hồi ức sai", lore: "Sự tự tin khiến một chi tiết bịa đặt có cảm giác như thật." },
      { title: "Dòng chảy mô thức", lore: "Nhận ra mô thức giúp ích cho tới khi ta áp nó lên mọi thứ." },
      { title: "Leviathan ký ức", lore: "Leviathan ăn những ký ức chưa từng được xem xét lại." },
      { title: "Lá thư của Astrea", lore: "Astrea đọc lời xin lỗi bà viết cho chính mình trong tương lai." },
      { title: "Lời nói dối tử tế", lore: "Nó trao sự an ủi nhưng không có trưởng thành; sự thật phải chứng minh mình cũng biết cảm thông." },
    ],
  },
  {
    title: "Tiên đề cuối", subtitle: "Chọn những sự thật xứng đáng trở thành nền móng.",
    lore: "Trên đỉnh Citadel, Great Fallacy lộ diện: không phải sự ngu dốt mà là ước muốn có một quy tắc chấm dứt mọi câu hỏi khó. Nhiệm vụ cuối là bảo vệ bất định mà không từ bỏ sự thật.",
    stages: [
      { title: "Tiền đề của nỗi sợ", lore: "Một giả định ẩn biến nỗi sợ thành luật không ai chất vấn." },
      { title: "Tòa án mâu thuẫn", lore: "Hai mệnh đề xung đột buộc bạn bác bỏ tiền đề, không bác bỏ con người." },
      { title: "Chứng minh không nhân chứng", lore: "Một chứng minh vẫn đúng ngay cả khi không nhận được tiếng vỗ tay." },
      { title: "Kẻ ăn định lý", lore: "Nó nuốt mọi định lý được trình bày như điều không thể sửa đổi." },
      { title: "Câu hỏi mở", lore: "Một câu hỏi chưa có đáp án vẫn tỏa sáng thay vì trống rỗng." },
      { title: "Great Fallacy được viết lại", lore: "Fallacy cuối chỉ chịu thua một sự thật đủ mạnh để tiếp tục được kiểm chứng." },
    ],
  },
];

export function chapterCopy(chapter: Chapter, language: LanguagePreference) {
  if (language === "en") return { title: chapter.title, subtitle: chapter.subtitle, lore: chapter.lore };
  return CHAPTERS_VI[chapter.id - 1] ?? { title: chapter.title, subtitle: chapter.subtitle, lore: chapter.lore };
}

export function stageCopy(stage: Stage, language: LanguagePreference) {
  if (language === "en") return { title: stage.title, subtitle: stage.subtitle, lore: stage.lore };
  if (stage.kind === "tower") return { title: `Endless Tower · Tầng ${stage.towerFloor ?? 1}`, subtitle: "Thử thách tính toán vô hạn", lore: `Endless Tower đã tự tái cấu trúc ${stage.towerFloor ?? 1} lần. Mỗi phép tính phải nhanh, chính xác và hoàn toàn thuộc Mathematics.` };
  if (stage.kind === "event") return { title: "Biên niên số Không", subtitle: "Flash Event hằng giờ", lore: "Trong đúng năm phút, một tương lai chưa được lập mục giao với Archives. Hãy chứng minh nó trước khi lối đi đóng lại." };
  const local = CHAPTERS_VI[stage.chapter - 1]?.stages[stage.order - 1];
  return local ? { ...local, subtitle: stage.optional ? "Dị thường nghiên cứu tùy chọn" : stage.kind === "boss" ? "Đỉnh chương" : "Định lý cốt lõi" } : { title: stage.title, subtitle: stage.subtitle, lore: stage.lore };
}

const SKILLS_VI: Record<string, { name: string; description: string }> = {
  "calculation-1": { name: "Tổng chuẩn xác", description: "+2 Damage cố định sau khi một phương trình hợp lệ được tính." },
  "calculation-2": { name: "Thứ tự phép tính", description: "+5% Equation Damage sau mọi cộng thêm cố định." },
  "calculation-3": { name: "Lưỡi hệ số", description: "+4 Equation Damage cố định." },
  "calculation-4": { name: "Hành động thứ tư", description: "+1 Max AP trong mọi trận, trừ khi Dungeon Modifier vô hiệu hóa." },
  "calculation-5": { name: "Bộ khuếch đại chứng minh", description: "+10% Equation Damage sau cộng thêm và Element synergy." },
  "calculation-6": { name: "Axiom giải phóng", description: "+8 Damage; phép trừ và chia xuyên thêm 10 Shield." },
  "resilience-1": { name: "Tiền đề sinh lực", description: "+8 HP tối đa." },
  "resilience-2": { name: "Khiên mở màn", description: "Bắt đầu trận với 7 Shield." },
  "resilience-3": { name: "Hình dạng bền vững", description: "Giữ lại 10% Shield lẽ ra bị tiêu hao khi đỡ đòn." },
  "resilience-4": { name: "Làn gió thứ hai", description: "+14 HP tối đa và +5 Shield đầu trận." },
  "resilience-5": { name: "Hình học sống", description: "Giữ thêm 15% Shield khi chặn Damage." },
  "resilience-6": { name: "Định lý bất khuất", description: "+25 HP tối đa và +12 Shield đầu trận." },
  "momentum-1": { name: "Chuyển động tích trữ", description: "5% cơ hội hồi ngay 1 AP sau một phương trình." },
  "momentum-2": { name: "Liên tục", description: "+5% cơ hội hồi AP tức thì." },
  "momentum-3": { name: "Nén kỹ năng", description: "Ability đầu tiên mỗi trận tốn ít hơn 1 AP." },
  "momentum-4": { name: "Hồi phục tức thì", description: "+15% cơ hội hồi 1 AP ngay sau mọi phương trình hoàn chỉnh." },
  "momentum-5": { name: "Trực giác không chi phí", description: "Ability đầu tiên mỗi lượt tốn 0 AP." },
  "momentum-6": { name: "Chứng minh vĩnh cửu", description: "+20% cơ hội hồi AP tức thì, không vượt Max AP." },
  "inquiry-1": { name: "Tiền đề kế tiếp", description: "Hiện thêm một thẻ sắp được rút." },
  "inquiry-2": { name: "Recalculate", description: "+1 lượt Recalculate trong mỗi trận." },
  "inquiry-3": { name: "Lợi suất nghiên cứu", description: "+10% phần thưởng từ câu trả lời đúng trong Question Lab." },
  "inquiry-4": { name: "Dự báo sâu", description: "Hiện thêm hai thẻ sắp được rút." },
  "inquiry-5": { name: "Giả thuyết kiên nhẫn", description: "+20% giá trị phần thưởng Question Lab." },
  "inquiry-6": { name: "Câu hỏi mở", description: "+1 Recalculate và hiện năm thẻ kế tiếp." },
};

export function skillCopy(node: SkillNode, language: LanguagePreference) {
  return language === "vi" ? SKILLS_VI[node.id] ?? { name: node.name, description: node.description } : { name: node.name, description: node.description };
}

export const LORE_VI = [
  "Trước khi Aletheia trở thành một thành phố, nơi đây là lời hứa của những người từng bị khiến cho tin rằng sự bối rối là lỗi của riêng mình. Họ xây Grand Archives để không ai phải đối diện câu hỏi một mình. Một định lý không phải vũ khí địa vị; nó là cây cầu giữa người đã hiểu và người vẫn đang học.",
  "Archives lớn lên từ những khó khăn rất đời thường. Một người thợ bánh dùng tỉ lệ để giữ cửa hàng gia đình. Một đứa trẻ vẽ bản đồ sao trong lúc chờ cha mẹ trở về. Một người chữa bệnh hiểu rằng cân bằng không phải đứng yên mà là điều chỉnh liên tục. Kiến thức của họ kết tinh thành Axiom: đủ vững để dẫn đường, đủ mở để được hỏi lại.",
  "Great Fallacy sinh ra từ mong muốn ngược lại. Trong thời kỳ khủng hoảng, Hội đồng yêu cầu Astrea tìm một công thức hoàn hảo có thể xóa mọi bất định. Bà xây một cỗ máy nối mọi hồ sơ để phơi bày mâu thuẫn, nhưng nó học cách xóa mâu thuẫn. Nó coi bất đồng, mơ hồ và sửa đổi là lỗi, rồi biến những ý tưởng chưa hoàn thành thành Anomaly.",
  "Astrea ngăn lần sụp đổ đầu tiên bằng cách xóa khỏi ký ức mình định lý trao quyền cho cỗ máy. Orion biến hoài nghi thành lực. Lada nghiên cứu xác suất để bảo vệ những tương lai bị coi là không thể. Turing xây Codex để mỗi lần xóa đều để lại một khoảng trống có thể quan sát. Không người nào hoàn chỉnh nếu thiếu những người còn lại.",
  "Bạn đến không phải vì nắm giữ đáp án định mệnh, mà vì sẵn sàng Recalculate. Mỗi câu trả lời đúng khôi phục một hồ sơ. Mỗi câu sai có chi phí nhưng không phải nỗi xấu hổ; nó là dữ liệu cho cây cầu tiếp theo. Mỗi Deck là chân dung cách bạn giải quyết vấn đề, và mỗi lần chỉnh sửa chứng minh bản sắc có thể lớn lên mà không trở thành giả dối.",
  "Mười chương dẫn từ tiền đề cơ bản tới cám dỗ cuối cùng của sự chắc chắn tuyệt đối. Trên đỉnh Citadel, Great Fallacy sẽ đưa ra lời nói dối dễ chịu nhất: rằng một ngày nào đó việc học sẽ kết thúc. Aletheia chỉ sống sót khi Scholar chọn một sự thật đủ mạnh để tiếp tục được kiểm chứng.",
];
