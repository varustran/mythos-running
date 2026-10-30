import type { GameChapter } from "./types";

export const gameChapters: GameChapter[] = [
  {
    id: 1,
    slug: "map-in-the-rain",
    title: {
      vi: "Chương 1: Bản Đồ Trong Mưa",
      en: "Chapter 1: The Map in the Rain",
      "zh-CN": "第 1 章：雨中的地图",
      ja: "第1章：雨のなかの地図",
    },
    subtitle: {
      vi: "Đêm mưa rào bên chân thành cổ",
      en: "A stormy night beside the ancient citadel",
      "zh-CN": "古城墙旁的暴雨之夜",
      ja: "古城壁のほとりの雨夜",
    },
    location: {
      vi: "Cửa Thượng Tứ, Kinh Thành Huế",
      en: "Thuong Tu Gate, Hue Citadel",
      "zh-CN": "顺化古城 上四门",
      ja: "フエ王宮 トゥオントゥ門",
    },
    image: "/images/game-chapter-1.jpg",
    targetMeters: 400,
    secretClue: {
      vi: "Khi nhịp chân đều đặn dưới mưa, tiếng gạch vỡ sẽ chỉ hướng cho bạn.",
      en: "When your cadence stays steady in the rain, crumbling bricks will guide your turn.",
      "zh-CN": "当雨中步频保持稳定，碎砖瓦砾将为你指引方向。",
      ja: "雨の中でピッチを一定に保つと、崩れかけのレンガが道を示します。",
    },
    initialDialogue: [
      {
        id: "c1_1",
        speaker: "Lão Khắc",
        speakerRole: {
          vi: "Người canh thành già",
          en: "Old Citadel Watchman",
          "zh-CN": "老城守望者",
          ja: "老いた城壁の見張り番",
        },
        text: {
          vi: "Cậu thanh niên, dừng bước đã! Giờ này không ai chạy ngoài hào thành cả... Trừ phi cậu cũng đang tìm những con đường biến mất.",
          en: "Hold your stride, young runner! Nobody runs by the moat at this hour... unless you too seek the paths that fade away.",
          "zh-CN": "年轻人，且慢！这个时辰没人会在护城河边奔跑……除非你也在寻找那些正在消逝的路径。",
          ja: "若者よ、足を止めなさい！こんな時間に堀端を走る者などおらぬ……消えゆく小道を探しているのなら別だが。",
        },
        choices: [
          {
            text: {
              vi: "Cháu chỉ đang chạy bộ ban đêm thôi.",
              en: "I'm just doing my regular night run.",
              "zh-CN": "我只是在进行例行的夜跑。",
              ja: "いつものナイトランをしているだけです。",
            },
            nextNodeId: "c1_2a",
            effect: "explore",
          },
          {
            text: {
              vi: "Con đường biến mất là sao ạ?",
              en: "What do you mean by paths that fade?",
              "zh-CN": "消逝的路径是什么意思？",
              ja: "消える道とはどういうことですか？",
            },
            nextNodeId: "c1_2b",
            effect: "preserve",
          },
        ],
      },
      {
        id: "c1_2a",
        speaker: "Lão Khắc",
        speakerRole: {
          vi: "Người canh thành già",
          en: "Old Citadel Watchman",
          "zh-CN": "老城守望者",
          ja: "老いた城壁の見張り番",
        },
        text: {
          vi: "Cuốn sổ da này rớt ở chân cột đèn số 7. Trong đó vẽ 8 cung đường chưa từng có trên bản đồ hiện đại. Cầm lấy, chạy qua 400 mét đầu tiên về phía cổng thành phía Bắc!",
          en: "This leather journal fell by Lantern 7. It charts eight routes missing from modern maps. Take it, and run the first 400 meters toward the North Bastion!",
          "zh-CN": "这本皮质手记落在了 7 号灯柱旁。里面记载了现代地图从未收录的 8 条路线。拿上它，向北城门跑完最初的 400 米！",
          ja: "この革表紙のノートは7番ランタンの足元に落ちていた。現代の地図にない8つの道が記されている。これを持って北の砦へ最初の400メートルを走るのだ！",
        },
      },
      {
        id: "c1_2b",
        speaker: "Lão Khắc",
        speakerRole: {
          vi: "Người canh thành già",
          en: "Old Citadel Watchman",
          "zh-CN": "老城守望者",
          ja: "老いた城壁の見張り番",
        },
        text: {
          vi: "Mỗi con đường mang ký ức của những người từng đặt chân qua. Kẻ Giữ Đường đang xóa sạch chúng để giam giữ thành phố trong sự bất biến. Cậu phải chạy trước khi sương mù nuốt chửng tất cả!",
          en: "Every path holds echoes of those who ran it before. The Keeper of Paths is erasing them to trap the city in timeless stasis. Run before the fog consumes it all!",
          "zh-CN": "每条道路都承载着前行者的记忆。守路人正试图抹去它们，让整座城市陷入永恒的停滞。在白雾吞噬一切之前奔跑吧！",
          ja: "道にはそこを走った人々の記憶が宿っている。「道の守護者」が記憶を消し去り、街を永久に凍結させようとしている。霧に呑まれる前に走り抜けるのだ！",
        },
      },
    ],
    completionDialogue: [
      {
        id: "c1_done",
        speaker: "An",
        speakerRole: {
          vi: "Nhân vật chính",
          en: "Protagonist",
          "zh-CN": "主角",
          ja: "主人公",
        },
        text: {
          vi: "Dưới chân thành, lớp gạch cũ bỗng phát ra ánh sáng lam nhạt... Một mảnh tàn dư ký ức đầu tiên đã hòa vào cuốn sổ!",
          en: "Beneath the citadel stones, a pale cyan light surged... The first memory shard has embedded itself into the journal!",
          "zh-CN": "城石之下骤然泛起微弱的青蓝辉光……第一枚记忆碎片已经融入了手记之中！",
          ja: "城壁の敷石の下から淡いシアンの光が溢れ出した……最初の記憶の欠片がノートに刻まれた！",
        },
      },
    ],
  },
  {
    id: 2,
    slug: "street-forgot-name",
    title: {
      vi: "Chương 2: Con Phố Quên Tên",
      en: "Chapter 2: The Street That Forgot Its Name",
      "zh-CN": "第 2 章：遗忘名字的街道",
      ja: "第2章：名を忘れた通り",
    },
    subtitle: {
      vi: "Ngõ nhỏ chỉ hiện ra khi giữ vững nhịp chạy",
      en: "An alley revealed only by cadence consistency",
      "zh-CN": "唯有匀速奔跑才会显现的幽巷",
      ja: "一定のリズムで走る時だけ現れる裏路地",
    },
    location: {
      vi: "Phố cổ Bao Vinh, Huế",
      en: "Bao Vinh Ancient Quarter, Hue",
      "zh-CN": "顺化 包荣古街",
      ja: "フエ バオヴィン旧市街",
    },
    image: "/images/game-chapter-2.jpg",
    targetMeters: 600,
    secretClue: {
      vi: "Đừng tăng tốc quá đà; nhịp tim ổn định chính là chìa khóa mở bức tường rêu phong.",
      en: "Do not surge wildly; a stable heart rate unlocks the moss-covered barrier.",
      "zh-CN": "切勿盲目加速；平稳的心率才是开启苔藓墙障的钥匙。",
      ja: "無闇にスプリントするな。安定した心拍数こそが苔むした石壁を開く鍵となる。",
    },
    initialDialogue: [
      {
        id: "c2_1",
        speaker: "Mai",
        speakerRole: {
          vi: "Runner dẫn tốc bí ẩn",
          en: "Mysterious Pacer",
          "zh-CN": "神秘领跑者",
          ja: "謎のペーサー",
        },
        text: {
          vi: "Cậu cũng nhìn thấy ngõ rẽ lát đá này đúng không? Người bình thường chỉ thấy một bức tường cụt. Giữ nhịp 5:15 cùng tôi!",
          en: "You see this flagstone lane too, right? Normal eyes only see a dead-end wall. Lock onto my 5:15 pace!",
          "zh-CN": "你也看到了这条青石小巷对吧？普通人只看到一堵死胡同的砖墙。跟紧我的 5:15 配速！",
          ja: "あなたにもこの石畳の路地が見えているのね？普通の人にはただの行き止まりの壁にしか見えないはず。私の5:15のペースに合わせて！",
        },
      },
    ],
    completionDialogue: [
      {
        id: "c2_done",
        speaker: "Mai",
        speakerRole: {
          vi: "Runner dẫn tốc bí ẩn",
          en: "Mysterious Pacer",
          "zh-CN": "神秘领跑者",
          ja: "謎のペーサー",
        },
        text: {
          vi: "Xuất sắc! Chúng ta vừa vượt qua đoạn đường đã bị bản đồ thành phố lãng quên suốt 60 năm qua.",
          en: "Splendid! We just traversed a segment erased from city blueprints for over sixty years.",
          "zh-CN": "太棒了！我们刚刚穿越了一条在城市测绘图中被遗忘了整整六十年的道路。",
          ja: "見事よ！私たちは今、この街の地図から60年以上も消去されていた区間を走り抜けたのよ。",
        },
      },
    ],
  },
  {
    id: 3,
    slug: "garden-lanterns",
    title: {
      vi: "Chương 3: Khu Vườn Đèn Giấy",
      en: "Chapter 3: The Garden of Paper Lanterns",
      "zh-CN": "第 3 章：纸灯笼的花园",
      ja: "第3章：紙提灯の庭園",
    },
    subtitle: {
      vi: "Ánh sáng thắp lên theo từng bước tiếp đất",
      en: "Illuminated lanterns igniting on each footstrike",
      "zh-CN": "随每次脚掌着地而点亮的古灯",
      ja: "着地の衝撃に呼応して灯る提灯",
    },
    location: {
      vi: "Nhà vườn Kim Long, Huế",
      en: "Kim Long Garden Estates, Hue",
      "zh-CN": "顺化 金龙园林",
      ja: "フエ キムロン古庭園",
    },
    image: "/images/game-chapter-4.jpg",
    targetMeters: 750,
    secretClue: {
      vi: "Thu thập đủ 5 hoa đăng nổi trên mặt nước để làm dịu cơn sóng dữ.",
      en: "Collect all 5 floating lantern embers to calm the surging ripples.",
      "zh-CN": "收集 5 盏漂浮灯火以抚平湍急水波。",
      ja: "水面に浮かぶ5つの灯篭の火を集め、荒れ狂う水面を鎮めよ。",
    },
    initialDialogue: [
      {
        id: "c3_1",
        speaker: "Người Giữ Đường",
        speakerRole: {
          vi: "Bóng hình kỳ bí",
          en: "The Shadowy Keeper",
          "zh-CN": "神秘黑影",
          ja: "影の守護者",
        },
        text: {
          vi: "Dừng lại đi, kẻ lang thang. Ký ức càng nhiều, nỗi đau càng lớn. Để ta đóng băng cung đường này vĩnh cửu...",
          en: "Turn back, wanderer. More memories only breed heavier sorrow. Let me preserve this path in timeless stone...",
          "zh-CN": "止步吧，流浪者。记忆越多，伤痛越深。让我将这条古道永远凝固在永恒的石阶上……",
          ja: "引き返しなさい、彷徨い人よ。記憶を重ねるほど苦痛は深まる。この道を永遠の静寂に閉じ込めさせておくれ……",
        },
        choices: [
          {
            text: {
              vi: "Nếu không chạy tiếp, thành phố sẽ chết mục!",
              en: "Without new strides, the city truly dies!",
              "zh-CN": "如果不继续奔跑，这座城市将彻底枯死！",
              ja: "走り続けなければ、街は本当の意味で死んでしまう！",
            },
            effect: "pioneer",
          },
          {
            text: {
              vi: "Tôi muốn hiểu vì sao ông lại muốn lưu giữ nó?",
              en: "I want to understand why you must preserve it.",
              "zh-CN": "我想明白，你为何如此执着于留存旧日？",
              ja: "なぜそこまでして保存に固執するのか知りたい。",
            },
            effect: "preserve",
          },
        ],
      },
    ],
    completionDialogue: [
      {
        id: "c3_done",
        speaker: "An",
        speakerRole: {
          vi: "Nhân vật chính",
          en: "Protagonist",
          "zh-CN": "主角",
          ja: "主人公",
        },
        text: {
          vi: "Đèn giấy đã thắp sáng cả con kênh! Con đường đã sống dậy!",
          en: "The lanterns have illuminated the entire canal! The route is alive once more!",
          "zh-CN": "纸灯笼点亮了整条古渠！古老的路途再次苏醒！",
          ja: "紙提灯が運河一面を照らし出した！道が再び息を吹き返した！",
        },
      },
    ],
  },
  {
    id: 4,
    slug: "rivers-second-current",
    title: {
      vi: "Chương 4: Dòng Chảy Thứ Hai",
      en: "Chapter 4: The River's Second Current",
      "zh-CN": "第 4 章：香江的第二潜流",
      ja: "第4章：フォーン川の第二の奔流",
    },
    subtitle: {
      vi: "Khi dòng Hương Giang đảo chiều lúc 03:17",
      en: "When the Perfume River reverses its flow at 03:17",
      "zh-CN": "凌晨 03:17 香江逆流之时",
      ja: "午前03:17、フォーン川が逆流する刻",
    },
    location: {
      vi: "Bến thuyền chùa Thiên Mụ, Huế",
      en: "Thien Mu Pagoda Pier, Hue",
      "zh-CN": "顺化 天姥寺码头",
      ja: "フエ ティエンムー寺船着場",
    },
    image: "/images/route-song-huong.jpg",
    targetMeters: 900,
    secretClue: {
      vi: "Chạy dọc theo vệt sương lam trên mặt nước để không bị dòng xoáy cuốn đi.",
      en: "Trace the cyan mist over the surface to avoid the whirlpool undertow.",
      "zh-CN": "紧沿水面青雾奔跑，避免被深水漩涡卷入。",
      ja: "水面の青い霧の筋に沿って走れ。深水の大渦に呑まれるな。",
    },
    initialDialogue: [
      {
        id: "c4_1",
        speaker: "Lão Khắc",
        speakerRole: {
          vi: "Người canh thành già",
          en: "Old Citadel Watchman",
          "zh-CN": "老城守望者",
          ja: "老いた城壁の見張り番",
        },
        text: {
          vi: "Cậu đã đi xa đến tận đây sao? Hãy lắng nghe tiếng chuông chùa Thiên Mụ. Nó đánh dấu nhịp thở của dòng sông lúc nửa đêm.",
          en: "You have journeyed this far? Listen to the Thien Mu bell. It synchronizes with the river's midnight breath.",
          "zh-CN": "你竟然跑到了这里？静听天姥寺的钟声，它与午夜香江的呼吸完全共振。",
          ja: "ここまで走り抜いたのか？ティエンムー寺の鐘の音を聴け。それは真夜中の川の呼吸と共鳴している。",
        },
      },
    ],
    completionDialogue: [
      {
        id: "c4_done",
        speaker: "An",
        speakerRole: {
          vi: "Nhân vật chính",
          en: "Protagonist",
          "zh-CN": "主角",
          ja: "主人公",
        },
        text: {
          vi: "Dòng chảy ngầm phản chiếu bầu trời sao dưới đáy nước. Cuốn sổ vừa mở ra chương của vùng đồi núi!",
          en: "The underwater current reflects starlight from the depths. The journal has revealed the mountain ascent chapter!",
          "zh-CN": "水底潜流中倒映着幽蓝星空。手记翻开了通往高峻丘陵的新篇章！",
          ja: "川底の潜流が夜空の星々を映し出している。手記は険しい丘陵へと続く新たな章を開いた！",
        },
      },
    ],
  },
  {
    id: 5,
    slug: "hill-seven-turns",
    title: {
      vi: "Chương 5: Ngọn Đồi Bảy Khúc Cua",
      en: "Chapter 5: The Hill of Seven Turns",
      "zh-CN": "第 5 章：七道弯的山丘",
      ja: "第5章：七曲がりの丘",
    },
    subtitle: {
      vi: "Rừng thông đón gió và bài kiểm tra thể lực",
      en: "Pine canopy winds and the endurance trial",
      "zh-CN": "松涛松风与终极耐力试炼",
      ja: "松の林を渡る風と持久力の試練",
    },
    location: {
      vi: "Đồi Vọng Cảnh, Huế",
      en: "Vong Canh Hill, Hue",
      "zh-CN": "顺化 望景丘",
      ja: "フエ ヴォンカインの丘",
    },
    image: "/images/route-vong-canh.jpg",
    targetMeters: 1000,
    secretClue: {
      vi: "Leo dốc cần bước chân ngắn và guồng chân nhanh để tiết kiệm oxy.",
      en: "Shorten stride and spin high cadence to preserve oxygen uphill.",
      "zh-CN": "上坡缩短步幅并提高步频以节省氧气消耗。",
      ja: "登り坂では歩幅を狭め、ピッチを上げて酸素消費を抑えよ。",
    },
    initialDialogue: [
      {
        id: "c5_1",
        speaker: "Mai",
        speakerRole: {
          vi: "Runner dẫn tốc bí ẩn",
          en: "Mysterious Pacer",
          "zh-CN": "神秘领跑者",
          ja: "謎のペーサー",
        },
        text: {
          vi: "Bảy khúc cua này đại diện cho 7 giai đoạn của một đời chạy bộ: bỡ ngỡ, háo thắng, kiệt sức, buông xuôi, hồi sinh, tĩnh lặng và thấu hiểu.",
          en: "These seven curves represent the seven stages of a runner's life: wonder, pride, collapse, surrender, rebirth, stillness, and enlightenment.",
          "zh-CN": "这七道弯象征着跑者一生的七个境界：初识、好胜、竭力、放下、重生、入静与顿悟。",
          ja: "この七つの曲がり角は、ランナーの七つの生涯の境地を象徴している。驚き、功名心、限界、諦め、再生、静寂、そして悟り。",
        },
      },
    ],
    completionDialogue: [
      {
        id: "c5_done",
        speaker: "An",
        speakerRole: {
          vi: "Nhân vật chính",
          en: "Protagonist",
          "zh-CN": "主角",
          ja: "主人公",
        },
        text: {
          vi: "Từ đỉnh đồi nhìn xuống, cả dòng sông Hương hiện lên như một vệt phát quang uốn lượn xuyên qua bóng đêm!",
          en: "From the ridge, the entire Perfume River glows like a ribbon of luminescent energy cutting the dark!",
          "zh-CN": "从峰顶俯瞰，整条香江宛若一条在幽暗夜色中流淌的发光光带！",
          ja: "丘の頂から見下ろすと、フォーン川全体が暗闇を貫く発光する帯のように輝いている！",
        },
      },
    ],
  },
  {
    id: 6,
    slug: "market-at-317",
    title: {
      vi: "Chương 6: Phiên Chợ Lúc 03:17",
      en: "Chapter 6: The Market at 03:17",
      "zh-CN": "第 6 章：凌晨 03:17 的幽市",
      ja: "第6章：午前03:17の市",
    },
    subtitle: {
      vi: "Nơi người ta đổi bước chạy lấy những mảnh đời xưa",
      en: "Where strides are traded for remnants of lost lives",
      "zh-CN": "以奔跑步履换取旧日遗痕的隐秘市场",
      ja: "走りの一歩を過去の記憶と引き換える市場",
    },
    location: {
      vi: "Chợ Đông Ba trong màn sương",
      en: "Dong Ba Market inside the mist",
      "zh-CN": "薄雾中的东巴集市",
      ja: "濃霧に包まれたドンバ市場",
    },
    image: "/images/game-hero.jpg",
    targetMeters: 1100,
    secretClue: {
      vi: "Tránh các gian hàng bóng tối; chỉ tiếp cận những ánh đèn lồng màu ngọc bích.",
      en: "Avoid shadow stalls; only approach emerald-lantern stalls.",
      "zh-CN": "避开漆黑摊位；仅靠近悬挂翠绿灯笼的摊档。",
      ja: "影の露店を避けよ。翡翠色の提灯が灯る店のみに近づくのだ。",
    },
    initialDialogue: [
      {
        id: "c6_1",
        speaker: "Bà Lão Bán Nước",
        speakerRole: {
          vi: "Thương nhân ký ức",
          en: "Memory Merchant",
          "zh-CN": "记忆行商",
          ja: "記憶の商人",
        },
        text: {
          vi: "Một ngụm nước trà gừng ấm nóng đổi lấy 500 bước chân guồng nhanh. Cậu có dám dùng nhịp tim của mình để giữ lại tên của một ngôi làng đã chìm?",
          en: "A sip of warm ginger tea in exchange for 500 cadence strides. Dare you spend your heartbeats to save a sunken village's name?",
          "zh-CN": "一口温热的生姜茶，换取五百次疾速步频。你敢用自己的心跳留住一座沉没村落的真名吗？",
          ja: "温かい生姜茶の一口と、500歩の高速ピッチの交換だ。沈みゆく村の名を残すために、お前の心拍を捧げる覚悟はあるか？",
        },
      },
    ],
    completionDialogue: [
      {
        id: "c6_done",
        speaker: "An",
        speakerRole: {
          vi: "Nhân vật chính",
          en: "Protagonist",
          "zh-CN": "主角",
          ja: "主人公",
        },
        text: {
          vi: "Tôi đã nghe thấy tiếng cười của những phiên chợ trăm năm trước... Ký ức này xứng đáng được sống lại!",
          en: "I heard the laughter of market vendors from centuries past... These memories deserve to live!",
          "zh-CN": "我听到了数百年前集市中回荡的欢笑声……这些记忆值得被重新唤醒！",
          ja: "何百年も前の商人たちの笑い声が聞こえた……この記憶は蘇るに値する！",
        },
      },
    ],
  },
  {
    id: 7,
    slug: "bridge-without-other-side",
    title: {
      vi: "Chương 7: Cây Cầu Không Có Bờ Kia",
      en: "Chapter 7: The Bridge Without an Other Side",
      "zh-CN": "第 7 章：没有彼岸的长桥",
      ja: "第7章：対岸のない橋",
    },
    subtitle: {
      vi: "Nhịp cầu sắt Trường Tiền vươn vào hư vô",
      en: "Iron spans of Truong Tien stretching into the void",
      "zh-CN": "钱场铁桥伸入无尽虚空之界",
      ja: "虚無へと伸びるチュオンティエン鉄橋",
    },
    location: {
      vi: "Cầu Trường Tiền, Sông Hương",
      en: "Truong Tien Bridge, Perfume River",
      "zh-CN": "香江 钱场桥",
      ja: "フォーン川 チュオンティエン橋",
    },
    image: "/images/game-chapter-7.jpg",
    targetMeters: 1200,
    secretClue: {
      vi: "Cây cầu chỉ nối nhịp khi người chạy không ngoái nhìn lại phía sau.",
      en: "The bridge spans connect only when the runner never looks behind.",
      "zh-CN": "唯有向前奔跑绝不回头，断裂的铁桥才会重新合拢。",
      ja: "決して後ろを振り返らない者にのみ、途切れた橋桁は再び繋がる。",
    },
    initialDialogue: [
      {
        id: "c7_1",
        speaker: "Người Giữ Đường",
        speakerRole: {
          vi: "Bóng hình kỳ bí",
          en: "The Shadowy Keeper",
          "zh-CN": "神秘黑影",
          ja: "影の守護者",
        },
        text: {
          vi: "Bờ bên kia không tồn tại nữa đâu, An! Mọi thứ phía trước chỉ là biến động và lãng quên. Hãy dừng chân tại nhịp cầu thứ 6 này vĩnh viễn!",
          en: "The other bank no longer exists, An! Ahead lies only chaos and oblivion. Rest here at Span 6 for all eternity!",
          "zh-CN": "对岸早已不复存在，安！前方只有动荡与遗忘。永远停歇在第六节桥拱之下吧！",
          ja: "対岸などもう存在しないのだ、アン！先にあるのは混沌と忘却だけだ。この6番目の橋桁で永遠に足を休めるがよい！",
        },
      },
    ],
    completionDialogue: [
      {
        id: "c7_done",
        speaker: "An",
        speakerRole: {
          vi: "Nhân vật chính",
          en: "Protagonist",
          "zh-CN": "主角",
          ja: "主人公",
        },
        text: {
          vi: "Cây cầu sáng rực lên! Sương mù tan biến, mở ra cánh cổng Ngọ Môn dẫn vào Dấu Chân Cuối Cùng!",
          en: "The bridge illuminates! The fog dissipates, unlocking the Ngo Mon Gate to The Last Route!",
          "zh-CN": "长桥华光大盛！浓雾尽散，午门大门轰然开启，通往最后的终极之路！",
          ja: "橋が一斉に輝いた！霧が晴れ、真の「最後のルート」へと続く午門の扉が開かれた！",
        },
      },
    ],
  },
  {
    id: 8,
    slug: "the-last-route",
    title: {
      vi: "Chương 8: Dấu Chân Cuối Cùng",
      en: "Chapter 8: The Last Route",
      "zh-CN": "第 8 章：最后的终极之路",
      ja: "第8章：最後のルート",
    },
    subtitle: {
      vi: "Quyết định vận mệnh của các cung đường xứ Huế",
      en: "Determining the destiny of all running routes",
      "zh-CN": "抉择顺化所有古道路途的终极命运",
      ja: "フエのすべての道が迎える運命の決断",
    },
    location: {
      vi: "Quảng trường Ngọ Môn, Đại Nội Huế",
      en: "Ngo Mon Square, Imperial Citadel",
      "zh-CN": "顺化皇城 午门广场",
      ja: "フエ王宮 午門前広場",
    },
    image: "/images/hero-running.jpg",
    targetMeters: 1400,
    secretClue: {
      vi: "Quyết định cuối cùng nằm ở trái tim bạn, không phải đôi chân.",
      en: "The final resolution lies within your intent, not your feet.",
      "zh-CN": "最终的抉择源自内心，而非双足。",
      ja: "最後の決断は足ではなく、お前の心が下す。",
    },
    initialDialogue: [
      {
        id: "c8_1",
        speaker: "Người Giữ Đường",
        speakerRole: {
          vi: "Người Giữ Đường",
          en: "Keeper of Paths",
          "zh-CN": "守路人",
          ja: "道の守護者",
        },
        text: {
          vi: "Cậu đã chạy hết tất cả các cung đường. Giờ đây cậu phải chọn: Đóng băng thành phố để giữ vẹn nguyên ký ức xưa, hay mở toang tất cả để những bước chân mới viết tiếp trang sử?",
          en: "You have traversed every forgotten path. Now choose: Freeze the city to preserve its pristine past, or unlock it all so new strides may forge its future?",
          "zh-CN": "你已经跑完了所有消逝的道路。现在必须抉择：将整座城封存以保全昔日记忆，还是彻底破封，让未来的全新步履书写崭新篇章？",
          ja: "すべての失われた道を走り抜いたな。今こそ選べ。過去の記憶を完璧に残すために街を凍結させるか、それともすべてを解き放ち、新たな足跡に未来を紡がせるか？",
        },
        choices: [
          {
            text: {
              vi: "Lưu giữ ký ức: Tôi muốn thành phố không bao giờ đổi thay (Kết thúc 1: Người Lưu Giữ)",
              en: "Preserve memories: I want the city never to change (Ending 1: The Preserver)",
              "zh-CN": "守护记忆：我愿古城永不褪色（结局 1：守护者）",
              ja: "記憶の保存：街が変わらないことを望む（エンディング1：保存者）",
            },
            effect: "preserve",
          },
          {
            text: {
              vi: "Khai mở tương lai: Hãy để những thế hệ runner mới tạo nên con đường mới (Kết thúc 2: Người Khai Mở)",
              en: "Unlock the future: Let new generations carve new routes (Ending 2: The Pioneer)",
              "zh-CN": "开辟未来：让新一代跑者开拓崭新路途（结局 2：先锋者）",
              ja: "未来の解放：新しい世代のランナーに新たな道を（エンディング2：開拓者）",
            },
            effect: "pioneer",
          },
          {
            text: {
              vi: "Hòa làm một: Tôi sẽ chạy mãi mãi để kết nối quá khứ và tương lai (Kết thúc 3: Bước Chạy Bất Tận)",
              en: "Become the bridge: I will run eternally between past and future (Ending 3: The Eternal Runner)",
              "zh-CN": "融为一体：我将永远奔跑，连接过去与未来（结局 3：永恒跑者）",
              ja: "境界となる：過去と未来を繋ぐため永遠に走り続ける（エンディング3：永遠のランナー）",
            },
            effect: "endure",
          },
        ],
      },
    ],
    completionDialogue: [
      {
        id: "c8_done",
        speaker: "An",
        speakerRole: {
          vi: "Nhân vật chính",
          en: "Protagonist",
          "zh-CN": "主角",
          ja: "主人公",
        },
        text: {
          vi: "Bình minh đầu tiên sau màn đêm huyền bí đã chiếu sáng Ngọ Môn. Mỗi bước chân của chúng ta hôm nay, chính là huyền thoại của ngày mai.",
          en: "The first dawn after the mystical night breaks over Ngo Mon. Every stride we take today becomes tomorrow's mythos.",
          "zh-CN": "神秘长夜之后的破晓曙光照亮了午门广场。我们今日迈出的每一步，都将成为明日的传奇。",
          ja: "神秘の夜を越えた最初の夜明けが午門を照らし出す。私たちが今日刻む一歩一歩が、明日の神話（Mythos）となるのだ。",
        },
      },
    ],
  },
];
