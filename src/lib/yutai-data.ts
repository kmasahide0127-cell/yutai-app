// 日本の主要な株主優待実施銘柄300社のデータ
// 2024〜2026年5月時点の一般的な優待内容を反映
//
// dataQuality:
//   "verified" - 運営者が高い確度で内容を把握している主要銘柄
//   "ai_generated" - 過去公開情報に基づく参考データ
//                    最新情報は必ず各企業のIRページで確認してください

export type PreferenceTag =
  | "cafe" | "noodles" | "japanese" | "family-restaurant" | "izakaya"
  | "coffee" | "tea" | "alcohol" | "sweets"
  | "business-wear" | "casual-wear" | "luxury-brand" | "sports-wear"
  | "makeup" | "skincare" | "hair-salon"
  | "it-gadget" | "games" | "books" | "art"
  | "movie" | "theme-park" | "live-concert"
  | "gym" | "sports-watching" | "yoga"
  | "domestic-flight" | "overseas-travel" | "train" | "hotel";

type Yutai = {
  id: string;
  code: string;
  name: string;
  brands: string[];
  categories: string[];
  lifestyleTags: string[];
  minShares: number;
  approxInvestment: number;
  annualValue: number;
  yieldPercent: number;
  description: string;
  rightsMonths: number[];
  dataQuality: "verified" | "ai_generated";
  lastVerified: string;
  preferenceTags?: PreferenceTag[];
};

const V = "verified" as const;
const A = "ai_generated" as const;
const D = "2026-05-27";

export const YUTAI_LIST: Yutai[] = [
  // ============================================================
  // 【TIER 1 / VERIFIED】主要・大型銘柄
  // ============================================================

  // ---- EC・通信 ----
  { id: "4755", code: "4755", name: "楽天グループ", brands: ["楽天市場", "楽天モバイル", "楽天カード", "楽天銀行", "楽天証券", "楽天ポイント", "楽天トラベル", "楽天ペイ", "楽天ブックス", "eSIM"], categories: ["EC", "通信", "金融"], lifestyleTags: ["楽天経済圏", "ネットショッピング多用", "固定費を抑えたい", "通信費を抑えたい"], minShares: 100, approxInvestment: 80000, annualValue: 36000, yieldPercent: 45.0, description: "楽天モバイル30GB/月の音声+データeSIM(100株で1回線、年間36,000円相当)。200株以上で複数回線可", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "9433", code: "9433", name: "KDDI", brands: ["au", "UQ mobile", "povo", "auでんき", "auじぶん銀行", "auPAY"], categories: ["通信", "金融"], lifestyleTags: ["通信費を抑えたい", "固定費を抑えたい", "auユーザー"], minShares: 100, approxInvestment: 480000, annualValue: 3000, yieldPercent: 0.6, description: "au PAYマーケット3,000円相当カタログギフト(5年以上保有で5,000円相当)", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "9434", code: "9434", name: "ソフトバンク", brands: ["ソフトバンク", "ワイモバイル", "LINEMO", "PayPay", "ヤフー", "Yahoo!ショッピング"], categories: ["通信", "EC"], lifestyleTags: ["通信費を抑えたい", "PayPayユーザー"], minShares: 100, approxInvestment: 200000, annualValue: 1000, yieldPercent: 0.5, description: "PayPayポイント1,000円相当(1年以上保有)", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "9432", code: "9432", name: "NTT", brands: ["NTT", "ドコモ", "ahamo", "irumo", "dカード", "dポイント"], categories: ["通信"], lifestyleTags: ["通信費を抑えたい", "ドコモユーザー"], minShares: 100, approxInvestment: 15000, annualValue: 1500, yieldPercent: 10.0, description: "100株でdポイント1,500p(2年以上保有)、3,000p(5年以上)", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 外食・ファミリーレストラン ----
  { id: "3197", code: "3197", name: "すかいらーくHD", brands: ["ガスト", "バーミヤン", "しゃぶ葉", "ジョナサン", "夢庵", "ステーキガスト", "から好し", "むさしの森珈琲"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "ファミリー外食", "子育て中"], minShares: 100, approxInvestment: 280000, annualValue: 4000, yieldPercent: 1.4, description: "年4,000円分の食事優待券(年2回・各2,000円)", rightsMonths: [6, 12], dataQuality: V, lastVerified: D },
  { id: "7616", code: "7616", name: "コロワイドG", brands: ["かっぱ寿司", "甘太郎", "牛角", "温野菜", "土間土間", "やきとりセンター", "ステーキ宮", "海鮮アトム"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "居酒屋好き", "焼肉好き"], minShares: 500, approxInvestment: 950000, annualValue: 40000, yieldPercent: 4.2, description: "年40,000円分の優待ポイント(年2回20,000円ずつ)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9887", code: "9887", name: "松屋フーズHD", brands: ["松屋", "松のや", "マイカリー食堂"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "一人ランチ", "固定費を抑えたい"], minShares: 100, approxInvestment: 480000, annualValue: 10000, yieldPercent: 2.1, description: "年10回分食事優待券(年2回・各5回分)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9861", code: "9861", name: "吉野家HD", brands: ["吉野家", "はなまるうどん"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "一人ランチ"], minShares: 100, approxInvestment: 320000, annualValue: 4000, yieldPercent: 1.3, description: "100株で年4,000円分の食事優待券", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "9936", code: "9936", name: "王将フードサービス", brands: ["餃子の王将"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "ファミリー外食"], minShares: 100, approxInvestment: 720000, annualValue: 4000, yieldPercent: 0.6, description: "年4,000円分の食事優待券", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "7581", code: "7581", name: "サイゼリヤ", brands: ["サイゼリヤ"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "ファミリー外食"], minShares: 100, approxInvestment: 580000, annualValue: 2000, yieldPercent: 0.3, description: "年2,000円分の食事優待券", rightsMonths: [8], dataQuality: V, lastVerified: D },
  { id: "9942", code: "9942", name: "ジョイフル", brands: ["ジョイフル"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "ファミリー外食"], minShares: 100, approxInvestment: 110000, annualValue: 4000, yieldPercent: 3.6, description: "年4,000円分の食事優待券(年2回)。九州中心ファミレス", rightsMonths: [6, 12], dataQuality: V, lastVerified: D },
  { id: "3097", code: "3097", name: "物語コーポレーション", brands: ["焼肉きんぐ", "丸源ラーメン", "ゆず庵", "お好み焼本舗"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "焼肉好き", "ファミリー外食"], minShares: 100, approxInvestment: 360000, annualValue: 7000, yieldPercent: 1.9, description: "年7,000円分食事優待券(年2回・各3,500円)", rightsMonths: [6, 12], dataQuality: V, lastVerified: D },
  { id: "3387", code: "3387", name: "クリエイト・レストランツHD", brands: ["磯丸水産", "鳥良商店", "しゃぶ菜", "雪月花"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "居酒屋好き"], minShares: 100, approxInvestment: 90000, annualValue: 4000, yieldPercent: 4.4, description: "年4,000円分の食事優待券(年2回)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "3053", code: "3053", name: "ペッパーフードサービス", brands: ["いきなり!ステーキ", "ペッパーランチ"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "ステーキ好き"], minShares: 100, approxInvestment: 70000, annualValue: 3000, yieldPercent: 4.3, description: "ペッパーランチ3,000円分優待券", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "3563", code: "3563", name: "FOOD & LIFE COMPANIES", brands: ["スシロー", "京樽"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "ファミリー外食", "寿司好き"], minShares: 100, approxInvestment: 320000, annualValue: 2200, yieldPercent: 0.7, description: "スシロー・京樽で使える1,100円割引券×2回", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8200", code: "8200", name: "リンガーハット", brands: ["リンガーハット", "とんかつ濵かつ"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "一人ランチ"], minShares: 100, approxInvestment: 230000, annualValue: 5460, yieldPercent: 2.4, description: "年5,460円分の優待券(年2回・各2,730円)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "2702", code: "2702", name: "日本マクドナルドHD", brands: ["マクドナルド"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "子育て中", "ファミリー外食"], minShares: 100, approxInvestment: 700000, annualValue: 12000, yieldPercent: 1.7, description: "年2回・各1冊(バーガー類+サイドメニュー+ドリンク6セット)の食事券", rightsMonths: [6, 12], dataQuality: V, lastVerified: D },
  { id: "3543", code: "3543", name: "コメダHD", brands: ["コメダ珈琲店", "おかげ庵"], categories: ["外食", "カフェ"], lifestyleTags: ["カフェよく利用", "モーニング"], minShares: 100, approxInvestment: 320000, annualValue: 2000, yieldPercent: 0.6, description: "KOMECA(コメダ専用プリペイドカード)に2,000円チャージ", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "7522", code: "7522", name: "ワタミ", brands: ["和民", "鳥メロ", "ミライザカ", "焼肉の和民"], categories: ["外食"], lifestyleTags: ["居酒屋好き", "外食月3回以上"], minShares: 100, approxInvestment: 120000, annualValue: 6000, yieldPercent: 5.0, description: "年6,000円分食事優待券(年2回・各3,000円)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "3198", code: "3198", name: "SFPホールディングス", brands: ["磯丸水産", "鳥良", "雪月花", "BUTLER"], categories: ["外食"], lifestyleTags: ["居酒屋好き", "外食月3回以上"], minShares: 100, approxInvestment: 170000, annualValue: 8000, yieldPercent: 4.7, description: "年8,000円分の食事優待券(年2回・各4,000円)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "7621", code: "7621", name: "うかい", brands: ["うかい亭", "うかい鳥山"], categories: ["外食"], lifestyleTags: ["記念日外食", "デート"], minShares: 100, approxInvestment: 380000, annualValue: 3000, yieldPercent: 0.8, description: "うかい亭などで使える3,000円相当の食事優待", rightsMonths: [9], dataQuality: V, lastVerified: D },
  { id: "9979", code: "9979", name: "大庄", brands: ["庄や", "日本海庄や", "やるき茶屋"], categories: ["外食"], lifestyleTags: ["居酒屋好き", "外食月3回以上"], minShares: 100, approxInvestment: 130000, annualValue: 5000, yieldPercent: 3.8, description: "庄や系列で使える5,000円相当の優待券、またはコシヒカリ5kg", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },

  // ---- カフェ ----
  { id: "3087", code: "3087", name: "ドトール・日レスHD", brands: ["ドトールコーヒー", "エクセルシオールカフェ", "星乃珈琲店", "洋麺屋五右衛門"], categories: ["外食", "カフェ"], lifestyleTags: ["カフェよく利用", "朝活", "ノマドワーク"], minShares: 100, approxInvestment: 220000, annualValue: 1000, yieldPercent: 0.5, description: "1,000円分のドトールバリューカード", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "3395", code: "3395", name: "サンマルクHD", brands: ["サンマルクカフェ", "鎌倉パスタ", "倉式珈琲店"], categories: ["外食", "カフェ"], lifestyleTags: ["カフェよく利用", "ファミリー外食"], minShares: 100, approxInvestment: 130000, annualValue: 4000, yieldPercent: 3.1, description: "年2回・各2,000円の優待カード(20%割引)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- ファッション ----
  { id: "8011", code: "8011", name: "三陽商会", brands: ["MACKINTOSH PHILOSOPHY", "EPOCA", "PAUL STUART", "BLUE LABEL CRESTBRIDGE", "BLACK LABEL CRESTBRIDGE", "100年コート"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "コーディネートこだわり", "ビジネスカジュアル"], minShares: 100, approxInvestment: 280000, annualValue: 3000, yieldPercent: 1.1, description: "30%割引券(自社直営店・公式オンラインストア)", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "7606", code: "7606", name: "ユナイテッドアローズ", brands: ["UNITED ARROWS", "BEAUTY & YOUTH UNITED ARROWS", "Steven Alan"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "コーディネートこだわり"], minShares: 100, approxInvestment: 200000, annualValue: 3000, yieldPercent: 1.5, description: "15%割引券(年2回)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "3608", code: "3608", name: "TSI HD", brands: ["MARGARET HOWELL", "PEARLY GATES", "NATURAL BEAUTY BASIC", "JILL by JILLSTUART", "HUMAN WOMAN"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "コーディネートこだわり"], minShares: 100, approxInvestment: 80000, annualValue: 3000, yieldPercent: 3.8, description: "3,000円相当の自社株主優待カード+20%割引券", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "2792", code: "2792", name: "ハニーズHD", brands: ["Honeys"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "コスパ重視ファッション"], minShares: 100, approxInvestment: 140000, annualValue: 3000, yieldPercent: 2.1, description: "3,000円分のお買い物券", rightsMonths: [5], dataQuality: V, lastVerified: D },
  { id: "8016", code: "8016", name: "オンワードHD", brands: ["23区", "組曲", "自由区", "Paul Smith", "ICB", "any FAM"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "ビジネスカジュアル"], minShares: 100, approxInvestment: 60000, annualValue: 2000, yieldPercent: 3.3, description: "オンワード・クローゼットで20%OFF+カタログギフト", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "8219", code: "8219", name: "青山商事", brands: ["洋服の青山", "THE SUIT COMPANY", "UNIVERSAL LANGUAGE"], categories: ["ファッション"], lifestyleTags: ["ビジネスカジュアル", "スーツ着用"], minShares: 100, approxInvestment: 220000, annualValue: 4000, yieldPercent: 1.8, description: "20%割引券(年2回)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "2670", code: "2670", name: "エービーシー・マート", brands: ["ABC-MART", "ABC-MART SPORTS", "ABC-MART GRAND STAGE"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "スニーカー好き"], minShares: 100, approxInvestment: 280000, annualValue: 2000, yieldPercent: 0.7, description: "2,000円分の商品券", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "7564", code: "7564", name: "ワークマン", brands: ["ワークマン", "ワークマンプラス", "WORKMAN Colors"], categories: ["スポーツ", "アウトドア", "ファッション"], lifestyleTags: ["キャンプ好き", "アウトドア", "コスパ重視ファッション"], minShares: 100, approxInvestment: 400000, annualValue: 2000, yieldPercent: 0.5, description: "2,000円相当の自社商品", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 美容・化粧品(雅英さんの奥様向け重要強化) ----
  { id: "4911", code: "4911", name: "資生堂", brands: ["SHISEIDO", "資生堂", "クレ・ド・ポー ボーテ", "エリクシール", "アネッサ", "マキアージュ", "ANESSA"], categories: ["美容", "化粧品"], lifestyleTags: ["美容ケア", "化粧品愛用", "美容意識高い"], minShares: 100, approxInvestment: 380000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし(2024年に廃止)、配当狙い", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "4922", code: "4922", name: "コーセー", brands: ["KOSE", "コーセー", "雪肌精", "アルビオン", "DECORTÉ", "ヴィセ", "コスメデコルテ"], categories: ["美容", "化粧品"], lifestyleTags: ["美容ケア", "化粧品愛用", "美容意識高い"], minShares: 100, approxInvestment: 800000, annualValue: 5000, yieldPercent: 0.6, description: "5,000円相当の自社化粧品セット(雪肌精・コスメデコルテ等)", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "4921", code: "4921", name: "ファンケル", brands: ["FANCL", "ファンケル", "無添加化粧品", "マイルドクレンジングオイル"], categories: ["美容", "化粧品"], lifestyleTags: ["美容ケア", "化粧品愛用", "敏感肌"], minShares: 100, approxInvestment: 280000, annualValue: 3000, yieldPercent: 1.1, description: "ファンケル直営店・公式通販で使える3,000円相当の優待割引券", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "4927", code: "4927", name: "ポーラ・オルビスHD", brands: ["POLA", "ポーラ", "ORBIS", "オルビス", "ジュリーク", "B.A"], categories: ["美容", "化粧品"], lifestyleTags: ["美容ケア", "化粧品愛用", "美容意識高い"], minShares: 100, approxInvestment: 130000, annualValue: 2000, yieldPercent: 1.5, description: "POLA・ORBIS製品との交換可能な優待ポイント2,000円相当", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "4917", code: "4917", name: "マンダム", brands: ["マンダム", "ギャツビー", "GATSBY", "ルシード", "ピクシー", "ルシードエル"], categories: ["美容", "化粧品"], lifestyleTags: ["美容ケア", "メンズスキンケア"], minShares: 100, approxInvestment: 130000, annualValue: 2000, yieldPercent: 1.5, description: "自社製品2,000円相当(ギャツビー、ルシードエル等)", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "4527", code: "4527", name: "ロート製薬", brands: ["ロート", "肌ラボ", "Obagi", "メラノCC", "Vロート", "メンソレータム"], categories: ["美容", "医療", "化粧品"], lifestyleTags: ["美容ケア", "健康意識高い", "視力ケア"], minShares: 100, approxInvestment: 320000, annualValue: 1500, yieldPercent: 0.5, description: "自社製品(目薬・化粧品)1,500円相当", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 旅行・交通 ----
  { id: "9202", code: "9202", name: "ANAホールディングス", brands: ["ANA", "ANA FESTA", "ANA STORE", "ANAカード", "ANAマイレージ", "Peach"], categories: ["旅行", "航空"], lifestyleTags: ["国内旅行派", "海外旅行派", "出張多い", "ANAマイラー"], minShares: 100, approxInvestment: 320000, annualValue: 8000, yieldPercent: 2.5, description: "片道運賃50%割引券1枚(年2回・株数で増える)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9201", code: "9201", name: "日本航空(JAL)", brands: ["JAL", "J-AIR", "JALカード", "JALマイレージ", "JAL PLAZA", "ZIPAIR"], categories: ["旅行", "航空"], lifestyleTags: ["国内旅行派", "海外旅行派", "出張多い", "JALマイラー"], minShares: 100, approxInvestment: 270000, annualValue: 8000, yieldPercent: 3.0, description: "片道運賃50%割引券1枚(年2回・株数で増える)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "4681", code: "4681", name: "リゾートトラスト", brands: ["エクシブ", "サンメンバーズ", "ベイコート倶楽部", "リゾーピア"], categories: ["旅行", "リゾート"], lifestyleTags: ["国内旅行派", "リゾート好き", "ゴルフ好き"], minShares: 100, approxInvestment: 300000, annualValue: 6000, yieldPercent: 2.0, description: "30%割引券(直営施設で使用可能)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9616", code: "9616", name: "共立メンテナンス", brands: ["ドーミーイン", "共立リゾート"], categories: ["旅行", "ホテル"], lifestyleTags: ["国内旅行派", "出張多い", "温泉好き"], minShares: 100, approxInvestment: 350000, annualValue: 4000, yieldPercent: 1.1, description: "ドーミーイン・共立リゾートで使える1,000円×4枚の優待券", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9603", code: "9603", name: "H.I.S.", brands: ["H.I.S.", "ハウステンボス"], categories: ["旅行"], lifestyleTags: ["海外旅行派", "国内旅行派", "テーマパーク好き"], minShares: 100, approxInvestment: 150000, annualValue: 2000, yieldPercent: 1.3, description: "ハウステンボス入園料割引券+H.I.S.旅行代金割引券", rightsMonths: [4, 10], dataQuality: V, lastVerified: D },
  { id: "9020", code: "9020", name: "JR東日本", brands: ["JR東日本", "Suica", "View Card", "エキナカ", "ペリエ", "ルミネ"], categories: ["交通"], lifestyleTags: ["電車通勤", "国内旅行派", "出張多い"], minShares: 100, approxInvestment: 290000, annualValue: 1000, yieldPercent: 0.3, description: "100株で40%割引券1枚+駅ビル等の優待券", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "9022", code: "9022", name: "JR東海", brands: ["JR東海", "新幹線", "EX予約", "JR東海ツアーズ"], categories: ["交通"], lifestyleTags: ["新幹線通勤", "出張多い", "国内旅行派"], minShares: 100, approxInvestment: 320000, annualValue: 1000, yieldPercent: 0.3, description: "100株で10%割引券1枚", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "9021", code: "9021", name: "JR西日本", brands: ["JR西日本", "ICOCA", "新幹線"], categories: ["交通"], lifestyleTags: ["関西住み", "出張多い"], minShares: 100, approxInvestment: 280000, annualValue: 1000, yieldPercent: 0.4, description: "100株で50%割引券1枚+JR西日本グループ優待", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "9007", code: "9007", name: "小田急電鉄", brands: ["小田急電鉄", "小田急百貨店", "小田急OX", "ロマンスカー"], categories: ["交通", "小売"], lifestyleTags: ["電車通勤", "東京西部住み"], minShares: 100, approxInvestment: 160000, annualValue: 2000, yieldPercent: 1.3, description: "全線乗車証+小田急グループ施設の優待", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9005", code: "9005", name: "東急", brands: ["東急電鉄", "東急百貨店", "東急ストア", "東急ハンズ"], categories: ["交通", "小売"], lifestyleTags: ["電車通勤", "東京住み"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "東急線全線乗車券+東急グループ施設の優待", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9041", code: "9041", name: "近鉄グループHD", brands: ["近鉄電車", "近鉄百貨店", "都ホテル"], categories: ["交通", "ホテル"], lifestyleTags: ["関西住み", "出張多い"], minShares: 200, approxInvestment: 800000, annualValue: 4000, yieldPercent: 0.5, description: "近鉄線乗車券+ホテル優待", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9001", code: "9001", name: "東武鉄道", brands: ["東武鉄道", "東武百貨店", "東武動物公園", "東京スカイツリー"], categories: ["交通", "エンタメ"], lifestyleTags: ["電車通勤", "東京北部住み", "ファミリー"], minShares: 100, approxInvestment: 350000, annualValue: 1500, yieldPercent: 0.4, description: "東武線乗車券+東京スカイツリーや東武動物公園の優待", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9009", code: "9009", name: "京成電鉄", brands: ["京成電鉄", "京成バラ園", "京成スカイライナー"], categories: ["交通"], lifestyleTags: ["電車通勤", "東京東部住み", "千葉住み"], minShares: 100, approxInvestment: 450000, annualValue: 2000, yieldPercent: 0.4, description: "京成電鉄全線乗車券+京成バラ園優待", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- 車関連(雅英さんの指摘で重要強化) ----
  { id: "5019", code: "5019", name: "出光興産", brands: ["出光", "IDEMITSU", "apollostation", "シェル", "出光カード", "出光ガソリンスタンド"], categories: ["自動車", "エネルギー"], lifestyleTags: ["車所有", "ドライブ好き"], minShares: 100, approxInvestment: 95000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い(車所有者の代表的なガソリンスタンド銘柄)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "5020", code: "5020", name: "ENEOSホールディングス", brands: ["ENEOS", "エネオス", "JX", "ENEOSカード"], categories: ["自動車", "エネルギー"], lifestyleTags: ["車所有", "ドライブ好き"], minShares: 100, approxInvestment: 85000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い(日本最大のガソリンスタンドチェーン)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9832", code: "9832", name: "オートバックスセブン", brands: ["オートバックス", "Autobacs", "スーパーオートバックス"], categories: ["自動車"], lifestyleTags: ["車所有", "ドライブ好き", "ガジェット好き"], minShares: 100, approxInvestment: 160000, annualValue: 2000, yieldPercent: 1.3, description: "オートバックス系列店で使える優待ポイント2,000円相当(年2回)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9882", code: "9882", name: "イエローハット", brands: ["イエローハット", "YellowHat"], categories: ["自動車"], lifestyleTags: ["車所有", "ドライブ好き"], minShares: 100, approxInvestment: 220000, annualValue: 3000, yieldPercent: 1.4, description: "イエローハットで使える3,000円分の優待券+ウォッシャー液", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "7599", code: "7599", name: "IDOM", brands: ["ガリバー", "Gulliver", "IDOM"], categories: ["自動車"], lifestyleTags: ["車所有", "中古車購入"], minShares: 100, approxInvestment: 80000, annualValue: 2000, yieldPercent: 2.5, description: "ガリバーで使える優待券2,000円相当+中古車購入時の割引", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "4666", code: "4666", name: "パーク24", brands: ["タイムズ駐車場", "タイムズカー", "タイムズカーシェア"], categories: ["自動車", "サービス"], lifestyleTags: ["車所有", "ドライブ好き", "都市部住まい"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "2,000円分のタイムズチケット", rightsMonths: [10], dataQuality: V, lastVerified: D },

  // ---- エンタメ ----
  { id: "8267", code: "8267", name: "イオン", brands: ["イオン", "イオンモール", "マックスバリュ", "ミニストップ", "イオンカード", "WAON"], categories: ["小売", "エンタメ"], lifestyleTags: ["ファミリーショッピング", "日用品まとめ買い", "イオンユーザー"], minShares: 100, approxInvestment: 320000, annualValue: 6000, yieldPercent: 1.9, description: "オーナーズカード(買物金額の3-7%キャッシュバック)+映画料金1,000円", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "9602", code: "9602", name: "東宝", brands: ["TOHOシネマズ"], categories: ["エンタメ"], lifestyleTags: ["映画よく見る", "デート"], minShares: 100, approxInvestment: 430000, annualValue: 4000, yieldPercent: 0.9, description: "年4枚のTOHOシネマズ映画招待券", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "4661", code: "4661", name: "オリエンタルランド", brands: ["東京ディズニーランド", "東京ディズニーシー", "TDL", "TDS"], categories: ["エンタメ"], lifestyleTags: ["テーマパーク好き", "ファミリー", "デート"], minShares: 400, approxInvestment: 1500000, annualValue: 8400, yieldPercent: 0.6, description: "400株保有で1デーパスポート1枚(年1回)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "4665", code: "4665", name: "ダスキン", brands: ["ミスタードーナツ", "ダスキン"], categories: ["外食", "サービス"], lifestyleTags: ["ファミリー外食", "子育て中"], minShares: 100, approxInvestment: 360000, annualValue: 1000, yieldPercent: 0.3, description: "ミスタードーナツやダスキンサービスで使える1,000円分優待券", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9601", code: "9601", name: "松竹", brands: ["MOVIX", "新宿ピカデリー", "歌舞伎座"], categories: ["エンタメ"], lifestyleTags: ["映画よく見る"], minShares: 200, approxInvestment: 280000, annualValue: 4000, yieldPercent: 1.4, description: "MOVIX・新宿ピカデリーで映画ポイントカード+歌舞伎座優待", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "7867", code: "7867", name: "タカラトミー", brands: ["トミカ", "プラレール", "リカちゃん", "ベイブレード"], categories: ["エンタメ"], lifestyleTags: ["子育て中", "ファミリー"], minShares: 100, approxInvestment: 290000, annualValue: 2000, yieldPercent: 0.7, description: "自社製品10%割引+トミカ・リカちゃんの優待商品", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "9633", code: "9633", name: "東京テアトル", brands: ["テアトル", "新宿テアトル"], categories: ["エンタメ"], lifestyleTags: ["映画よく見る"], minShares: 100, approxInvestment: 90000, annualValue: 8000, yieldPercent: 8.9, description: "年8,000円相当(映画招待券8枚+割引券)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "9412", code: "9412", name: "スカパーJSAT", brands: ["スカパー!", "WOWOW"], categories: ["エンタメ"], lifestyleTags: ["映画よく見る", "スポーツ観戦"], minShares: 100, approxInvestment: 70000, annualValue: 1000, yieldPercent: 1.4, description: "スカパー視聴料割引またはクオカード", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- ドラッグストア・日用品 ----
  { id: "3141", code: "3141", name: "ウエルシアHD", brands: ["ウエルシア", "ハックドラッグ", "ダックス"], categories: ["日用品", "ドラッグストア"], lifestyleTags: ["日用品まとめ買い", "健康意識高い", "ウエル活"], minShares: 100, approxInvestment: 290000, annualValue: 3000, yieldPercent: 1.0, description: "3,000円相当の商品券", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "3088", code: "3088", name: "マツキヨココカラ&カンパニー", brands: ["マツモトキヨシ", "ココカラファイン", "MATSUKIYO"], categories: ["日用品", "ドラッグストア", "美容"], lifestyleTags: ["日用品まとめ買い", "美容ケア"], minShares: 100, approxInvestment: 250000, annualValue: 2000, yieldPercent: 0.8, description: "2,000円分の商品券+割引券", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "3349", code: "3349", name: "コスモス薬品", brands: ["コスモス薬品", "ディスカウントドラッグコスモス"], categories: ["日用品", "ドラッグストア"], lifestyleTags: ["日用品まとめ買い", "固定費を抑えたい"], minShares: 100, approxInvestment: 880000, annualValue: 5000, yieldPercent: 0.6, description: "5,000円相当の自社商品券", rightsMonths: [5], dataQuality: V, lastVerified: D },
  { id: "3391", code: "3391", name: "ツルハHD", brands: ["ツルハドラッグ", "杏林堂薬局", "くすりの福太郎"], categories: ["日用品", "ドラッグストア"], lifestyleTags: ["日用品まとめ買い"], minShares: 100, approxInvestment: 1000000, annualValue: 5000, yieldPercent: 0.5, description: "5,000円分の優待カード+ツルハオリジナル商品", rightsMonths: [5], dataQuality: V, lastVerified: D },
  { id: "7649", code: "7649", name: "スギHD", brands: ["スギ薬局", "スギドラッグ"], categories: ["日用品", "ドラッグストア"], lifestyleTags: ["日用品まとめ買い"], minShares: 100, approxInvestment: 700000, annualValue: 3000, yieldPercent: 0.4, description: "3,000円分の優待券", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "9989", code: "9989", name: "サンドラッグ", brands: ["サンドラッグ"], categories: ["日用品", "ドラッグストア"], lifestyleTags: ["日用品まとめ買い"], minShares: 100, approxInvestment: 400000, annualValue: 2000, yieldPercent: 0.5, description: "2,000円相当の自社商品", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 家電・百貨店 ----
  { id: "9831", code: "9831", name: "ヤマダHD", brands: ["ヤマダ電機", "LABI", "テックランド", "大塚家具"], categories: ["家電", "小売"], lifestyleTags: ["家電購入予定", "ガジェット好き"], minShares: 100, approxInvestment: 50000, annualValue: 1000, yieldPercent: 2.0, description: "ヤマダ電機で使える1,000円分の優待券。少額投資で実用的", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "3048", code: "3048", name: "ビックカメラ", brands: ["ビックカメラ", "ソフマップ", "コジマ"], categories: ["家電"], lifestyleTags: ["家電購入予定", "ガジェット好き"], minShares: 100, approxInvestment: 130000, annualValue: 3000, yieldPercent: 2.3, description: "年3,000円分の買物優待券(年2回・各)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "2730", code: "2730", name: "エディオン", brands: ["エディオン"], categories: ["家電"], lifestyleTags: ["家電購入予定"], minShares: 100, approxInvestment: 130000, annualValue: 3000, yieldPercent: 2.3, description: "3,000円分のギフトカード(年2回・各)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8233", code: "8233", name: "高島屋", brands: ["高島屋", "タカシマヤ", "高島屋オンラインストア"], categories: ["百貨店", "小売"], lifestyleTags: ["ファッション好き", "贈答品を買う", "プレゼント購入", "百貨店利用"], minShares: 100, approxInvestment: 200000, annualValue: 10000, yieldPercent: 5.0, description: "株主ご優待カード(10%割引)。100株以上で年間お買物15万円分まで適用可(最大節約15,000円)。高島屋・タカシマヤオンラインで使用可。年間節約額は利用状況による参考値。", rightsMonths: [2, 8], dataQuality: A, lastVerified: "2026-06-01" },
  { id: "3099", code: "3099", name: "三越伊勢丹HD", brands: ["三越", "伊勢丹", "三越伊勢丹オンライン"], categories: ["百貨店", "小売"], lifestyleTags: ["ファッション好き", "贈答品を買う", "プレゼント購入", "百貨店利用"], minShares: 100, approxInvestment: 330000, annualValue: 10000, yieldPercent: 3.0, description: "株主ご優待カード(10%割引)。100株以上で年間30万円分まで適用可(最大節約30,000円)。三越・伊勢丹各店舗・オンラインストアで利用可。年間節約額は利用状況による参考値。", rightsMonths: [3, 9], dataQuality: A, lastVerified: "2026-06-01" },
  { id: "3086", code: "3086", name: "J.フロントリテイリング", brands: ["大丸", "松坂屋", "PARCO", "パルコ"], categories: ["百貨店", "小売"], lifestyleTags: ["ファッション好き", "贈答品を買う", "百貨店利用"], minShares: 100, approxInvestment: 270000, annualValue: 10000, yieldPercent: 3.7, description: "大丸・松坂屋お買い物ご優待カード(10%割引)。100株以上で年間50万円分まで適用可(最大節約50,000円)。PARCO文化催事の無料招待あり。年間節約額は利用状況による参考値。", rightsMonths: [2, 8], dataQuality: A, lastVerified: "2026-06-01" },
  { id: "8242", code: "8242", name: "エイチ・ツー・オーリテイリング", brands: ["阪急百貨店", "阪神百貨店", "イズミヤ", "阪急オアシス"], categories: ["百貨店", "小売"], lifestyleTags: ["ファッション好き", "贈答品を買う", "百貨店利用", "関西住み"], minShares: 100, approxInvestment: 200000, annualValue: 5000, yieldPercent: 2.5, description: "年2回、A:優待券5枚(阪急・阪神百貨店グループで10%割引)/B:食品スーパーSポイント/C:長野こしひかり1kgから選択。優待券選択時の節約額は利用状況による参考値。", rightsMonths: [3, 9], dataQuality: A, lastVerified: "2026-06-01" },
  { id: "8273", code: "8273", name: "イズミ", brands: ["ゆめタウン", "ゆめマート"], categories: ["小売", "日用品"], lifestyleTags: ["日用品まとめ買い", "ファミリー"], minShares: 100, approxInvestment: 350000, annualValue: 2000, yieldPercent: 0.6, description: "2,000円相当の優待ギフト券+自社カード5%割引", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "3382", code: "3382", name: "セブン&アイHD", brands: ["セブン-イレブン", "イトーヨーカドー", "そごう", "西武", "デニーズ"], categories: ["小売", "外食"], lifestyleTags: ["コンビニよく利用", "セブン-イレブン利用"], minShares: 100, approxInvestment: 230000, annualValue: 1000, yieldPercent: 0.4, description: "1,000円相当の食料品ギフトカード+デニーズ等の優待", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },

  // ---- ライフスタイル・生活雑貨(雅英さんの奥様向け重要) ----
  { id: "7453", code: "7453", name: "良品計画", brands: ["無印良品", "MUJI", "Café&Meal MUJI", "MUJI HOTEL"], categories: ["小売", "ファッション", "日用品"], lifestyleTags: ["シンプル志向", "ファッション好き", "日用品まとめ買い", "インテリア好き"], minShares: 100, approxInvestment: 280000, annualValue: 0, yieldPercent: 0.0, description: "100株以上で5%OFF優待カード(MUJI Cardメンバー対象)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "9843", code: "9843", name: "ニトリHD", brands: ["ニトリ", "Nitori", "デコホーム", "ニトリモール"], categories: ["家具", "小売"], lifestyleTags: ["持ち家", "インテリア好き", "一人暮らし", "新生活"], minShares: 100, approxInvestment: 1700000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い(株主向け割引券は終了)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "7459", code: "7459", name: "メディパルHD", brands: ["MediPaL"], categories: ["医薬"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 250000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- スポーツ・アウトドア ----
  { id: "3028", code: "3028", name: "アルペン", brands: ["スポーツデポ", "アルペン", "ゴルフ5", "アルペンアウトドアーズ", "ALPEN OUTDOORS"], categories: ["スポーツ", "アウトドア"], lifestyleTags: ["スポーツする", "キャンプ好き", "ゴルフ好き", "アウトドア"], minShares: 100, approxInvestment: 230000, annualValue: 2000, yieldPercent: 0.9, description: "2,000円分の自社買物優待券", rightsMonths: [6], dataQuality: V, lastVerified: D },
  { id: "8281", code: "8281", name: "ゼビオHD", brands: ["ゼビオ", "ヴィクトリア", "スーパースポーツゼビオ"], categories: ["スポーツ"], lifestyleTags: ["スポーツする", "ゴルフ好き"], minShares: 100, approxInvestment: 110000, annualValue: 4000, yieldPercent: 3.6, description: "20%割引券+1,000円割引券(年2回・各)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "7514", code: "7514", name: "ヒマラヤ", brands: ["ヒマラヤ", "ヒマラヤゴルフ"], categories: ["スポーツ"], lifestyleTags: ["スポーツする", "ゴルフ好き"], minShares: 100, approxInvestment: 110000, annualValue: 2000, yieldPercent: 1.8, description: "2,000円分の買物優待券", rightsMonths: [8], dataQuality: V, lastVerified: D },
  { id: "2353", code: "2353", name: "日本駐車場開発", brands: ["日本駐車場開発", "白馬岩岳マウンテンリゾート"], categories: ["サービス"], lifestyleTags: ["スキー好き", "ファミリー"], minShares: 1000, approxInvestment: 200000, annualValue: 4000, yieldPercent: 2.0, description: "白馬岩岳など系列スキー場のリフト券+駐車場優待", rightsMonths: [7], dataQuality: V, lastVerified: D },

  // ---- 食品・飲料 ----
  { id: "2897", code: "2897", name: "日清食品HD", brands: ["カップヌードル", "チキンラーメン", "U.F.O", "どん兵衛"], categories: ["食品"], lifestyleTags: ["一人暮らし", "在宅勤務多め", "ストック食料"], minShares: 100, approxInvestment: 380000, annualValue: 3500, yieldPercent: 0.9, description: "カップ麺・即席麺の詰め合わせ(3,500円相当)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "2802", code: "2802", name: "味の素", brands: ["味の素", "クノール", "Cook Do", "ほんだし"], categories: ["食品"], lifestyleTags: ["自炊する", "ファミリー", "子育て中"], minShares: 100, approxInvestment: 580000, annualValue: 1500, yieldPercent: 0.3, description: "1,500円相当の自社製品詰め合わせ", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "2503", code: "2503", name: "キリンHD", brands: ["一番搾り", "本麒麟", "氷結", "午後の紅茶", "生茶"], categories: ["食品", "飲料"], lifestyleTags: ["晩酌する", "ビール好き"], minShares: 100, approxInvestment: 220000, annualValue: 1000, yieldPercent: 0.5, description: "1,000円相当の自社商品詰め合わせ", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "2502", code: "2502", name: "アサヒグループHD", brands: ["アサヒスーパードライ", "アサヒ生", "三ツ矢サイダー", "ウィルキンソン", "カルピス"], categories: ["食品", "飲料"], lifestyleTags: ["晩酌する", "ビール好き"], minShares: 100, approxInvestment: 580000, annualValue: 1000, yieldPercent: 0.2, description: "1,000円相当の自社製品", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "2501", code: "2501", name: "サッポロHD", brands: ["サッポロ生ビール黒ラベル", "ヱビスビール", "サッポロクラシック"], categories: ["食品", "飲料"], lifestyleTags: ["晩酌する", "ビール好き"], minShares: 100, approxInvestment: 700000, annualValue: 1500, yieldPercent: 0.2, description: "1,500円相当の自社製品+恵比寿ガーデンプレイス優待", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "8113", code: "8113", name: "ユニ・チャーム", brands: ["ムーニー", "マミーポコ", "ライフリー", "ソフィ"], categories: ["日用品"], lifestyleTags: ["子育て中", "ペット飼育", "介護中"], minShares: 100, approxInvestment: 540000, annualValue: 1000, yieldPercent: 0.2, description: "1,000円相当の自社製品", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "2810", code: "2810", name: "ハウス食品G", brands: ["ハウスバーモントカレー", "シャービック", "ザ・カレー", "ウコンの力"], categories: ["食品"], lifestyleTags: ["自炊する", "ファミリー"], minShares: 100, approxInvestment: 380000, annualValue: 1500, yieldPercent: 0.4, description: "自社製品1,500円相当(カレー・ウコンの力など)", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "2811", code: "2811", name: "カゴメ", brands: ["KAGOME", "野菜生活", "トマトジュース"], categories: ["食品"], lifestyleTags: ["健康意識高い", "野菜不足"], minShares: 100, approxInvestment: 320000, annualValue: 2000, yieldPercent: 0.6, description: "自社製品2,000円相当(野菜ジュース等)", rightsMonths: [6, 12], dataQuality: V, lastVerified: D },
  { id: "2270", code: "2270", name: "雪印メグミルク", brands: ["雪印メグミルク", "ネオソフト", "6Pチーズ"], categories: ["食品"], lifestyleTags: ["自炊する", "子育て中"], minShares: 100, approxInvestment: 230000, annualValue: 2000, yieldPercent: 0.9, description: "自社製品2,000円相当", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 子育て・ファミリー(奥様・ファミリー層向け重要) ----
  { id: "8167", code: "8167", name: "リテールパートナーズ", brands: ["マルキョウ", "西鉄ストア", "丸久"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "ファミリー", "九州住み"], minShares: 100, approxInvestment: 130000, annualValue: 2000, yieldPercent: 1.5, description: "2,000円相当のクオカード", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "8178", code: "8178", name: "マルエツ(再掲)", brands: ["マルエツ", "カスミ"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "ファミリー"], minShares: 100, approxInvestment: 130000, annualValue: 3000, yieldPercent: 2.3, description: "3,000円相当の自社商品券", rightsMonths: [2], dataQuality: V, lastVerified: D },
  { id: "7545", code: "7545", name: "西松屋チェーン", brands: ["西松屋"], categories: ["小売", "ファッション"], lifestyleTags: ["子育て中", "ファミリー", "新生児"], minShares: 100, approxInvestment: 220000, annualValue: 1000, yieldPercent: 0.5, description: "1,000円相当の自社商品券(子供用品)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "8227", code: "8227", name: "しまむら", brands: ["しまむら", "アベイル", "バースデイ", "シャンブル", "ディバロ"], categories: ["ファッション", "小売"], lifestyleTags: ["コスパ重視ファッション", "子育て中", "ファミリー"], minShares: 100, approxInvestment: 1000000, annualValue: 2000, yieldPercent: 0.2, description: "2,000円相当の自社グループ買物優待券", rightsMonths: [2], dataQuality: V, lastVerified: D },

  // ---- 金融 ----
  { id: "8593", code: "8593", name: "三菱HCキャピタル", brands: ["三菱HCキャピタル"], categories: ["金融"], lifestyleTags: [], minShares: 100, approxInvestment: 110000, annualValue: 1000, yieldPercent: 0.9, description: "100株でクオカード1,000円分(3年以上保有)", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "8410", code: "8410", name: "セブン銀行", brands: ["セブン銀行ATM"], categories: ["金融"], lifestyleTags: ["セブン-イレブン利用"], minShares: 100, approxInvestment: 30000, annualValue: 1000, yieldPercent: 3.3, description: "100株以上でnanacoポイント1,000円相当", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "8473", code: "8473", name: "SBIホールディングス", brands: ["SBI証券", "SBI", "住信SBIネット銀行", "SBIネオモバイル"], categories: ["金融"], lifestyleTags: ["投資する", "ネット証券利用"], minShares: 100, approxInvestment: 380000, annualValue: 2500, yieldPercent: 0.7, description: "暗号資産XRP2,500円相当(2024年以降の優待制度)", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 医療・健康 ----
  { id: "7780", code: "7780", name: "メニコン", brands: ["メニコン", "Menicon", "アイシティ"], categories: ["医療", "サービス"], lifestyleTags: ["コンタクト利用", "視力ケア"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "メニコン製品の優待割引+ピントクラブの優待", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "4540", code: "4540", name: "ツムラ", brands: ["ツムラ漢方"], categories: ["医療"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 420000, annualValue: 2000, yieldPercent: 0.5, description: "2,000円相当の自社製品(漢方薬関連)", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 雑貨・EC ----
  { id: "9384", code: "9384", name: "内外トランスライン", brands: ["内外トランスライン"], categories: ["物流"], lifestyleTags: [], minShares: 100, approxInvestment: 200000, annualValue: 1000, yieldPercent: 0.5, description: "クオカード1,000円分(3年以上保有で増額)", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "7818", code: "7818", name: "トランザクション", brands: ["TRANSACTION", "BACKYARD FAMILY"], categories: ["雑貨"], lifestyleTags: ["エコ意識"], minShares: 100, approxInvestment: 100000, annualValue: 1500, yieldPercent: 1.5, description: "自社製品(エコバッグ等)1,500円相当またはクオカード", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "8194", code: "8194", name: "ライフコーポレーション", brands: ["ライフ", "ライフスーパー"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "ファミリー"], minShares: 100, approxInvestment: 400000, annualValue: 2500, yieldPercent: 0.6, description: "自社商品券2,500円分", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },
  { id: "2735", code: "2735", name: "ワッツ", brands: ["ワッツ", "100均", "シルク"], categories: ["小売", "日用品"], lifestyleTags: ["日用品まとめ買い", "コスパ志向"], minShares: 100, approxInvestment: 90000, annualValue: 1000, yieldPercent: 1.1, description: "1,000円分の自社商品券", rightsMonths: [8], dataQuality: V, lastVerified: D },
  { id: "2674", code: "2674", name: "ハードオフコーポレーション", brands: ["ハードオフ", "オフハウス", "ホビーオフ", "ガレージオフ"], categories: ["小売"], lifestyleTags: ["コスパ重視", "中古品", "ガジェット好き"], minShares: 100, approxInvestment: 130000, annualValue: 2000, yieldPercent: 1.5, description: "2,000円分のお買物優待券", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "3548", code: "3548", name: "バロックジャパンリミテッド", brands: ["MOUSSY", "SLY", "AZUL by moussy"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "若者ファッション"], minShares: 100, approxInvestment: 70000, annualValue: 2000, yieldPercent: 2.9, description: "2,000円分の優待ポイント(自社EC・店舗)", rightsMonths: [2, 8], dataQuality: V, lastVerified: D },

  // ============================================================
  // 【TIER 2 / AI_GENERATED】中型・地味な銘柄(参考情報)
  // 過去公開情報に基づくデータ、最新情報は企業IRで要確認
  // ============================================================

  // ---- 外食追加(中型) ----
  { id: "7611", code: "7611", name: "ハイデイ日高", brands: ["日高屋", "焼鳥日高"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "一人ランチ", "ラーメン好き"], minShares: 100, approxInvestment: 250000, annualValue: 2000, yieldPercent: 0.8, description: "2,000円分の食事優待券", rightsMonths: [2, 8], dataQuality: A, lastVerified: D },
  { id: "9279", code: "9279", name: "ギフトホールディングス", brands: ["町田商店", "豚山"], categories: ["外食"], lifestyleTags: ["ラーメン好き", "外食月3回以上"], minShares: 100, approxInvestment: 300000, annualValue: 3000, yieldPercent: 1.0, description: "町田商店等で使える3,000円相当の優待券", rightsMonths: [4, 10], dataQuality: A, lastVerified: D },
  { id: "3038", code: "3038", name: "神戸物産", brands: ["業務スーパー"], categories: ["小売", "食品"], lifestyleTags: ["日用品まとめ買い", "自炊する", "ファミリー", "コスパ志向"], minShares: 100, approxInvestment: 400000, annualValue: 1000, yieldPercent: 0.3, description: "1,000円相当のギフトカード", rightsMonths: [10], dataQuality: A, lastVerified: D },
  { id: "3193", code: "3193", name: "鳥貴族HD", brands: ["鳥貴族"], categories: ["外食"], lifestyleTags: ["居酒屋好き", "外食月3回以上"], minShares: 100, approxInvestment: 280000, annualValue: 2000, yieldPercent: 0.7, description: "2,000円相当の食事優待券", rightsMonths: [1, 7], dataQuality: A, lastVerified: D },
  { id: "2695", code: "2695", name: "くら寿司", brands: ["くら寿司", "無添くら寿司"], categories: ["外食"], lifestyleTags: ["ファミリー外食", "寿司好き"], minShares: 100, approxInvestment: 400000, annualValue: 5000, yieldPercent: 1.3, description: "5,000円分の食事優待券", rightsMonths: [4, 10], dataQuality: A, lastVerified: D },
  { id: "9828", code: "9828", name: "元気寿司", brands: ["元気寿司", "魚べい", "千両"], categories: ["外食"], lifestyleTags: ["ファミリー外食", "寿司好き"], minShares: 100, approxInvestment: 250000, annualValue: 1500, yieldPercent: 0.6, description: "1,500円分の食事優待券", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "7421", code: "7421", name: "カッパ・クリエイト", brands: ["かっぱ寿司"], categories: ["外食"], lifestyleTags: ["ファミリー外食", "寿司好き"], minShares: 100, approxInvestment: 170000, annualValue: 6000, yieldPercent: 3.5, description: "年6,000ポイント相当の食事優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "3221", code: "3221", name: "ヨシックスHD", brands: ["ニパチ", "や台ずし", "や台や"], categories: ["外食"], lifestyleTags: ["居酒屋好き", "寿司好き"], minShares: 100, approxInvestment: 250000, annualValue: 6000, yieldPercent: 2.4, description: "6,000円分の食事優待券", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "2705", code: "2705", name: "大戸屋HD", brands: ["大戸屋", "ごはん処大戸屋"], categories: ["外食"], lifestyleTags: ["外食月3回以上", "和食好き", "一人ランチ"], minShares: 100, approxInvestment: 250000, annualValue: 2500, yieldPercent: 1.0, description: "2,500円相当の食事優待券", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "3068", code: "3068", name: "WDI", brands: ["WDIグループ", "ハードロックカフェ", "カプリチョーザ"], categories: ["外食"], lifestyleTags: ["デート", "外食月3回以上", "記念日外食"], minShares: 100, approxInvestment: 60000, annualValue: 3000, yieldPercent: 5.0, description: "WDIグループで使える3,000円相当の優待券", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "3091", code: "3091", name: "ブロンコビリー", brands: ["ブロンコビリー"], categories: ["外食"], lifestyleTags: ["ファミリー外食", "ステーキ好き"], minShares: 100, approxInvestment: 380000, annualValue: 2000, yieldPercent: 0.5, description: "2,000円相当の食事優待+お米券", rightsMonths: [6, 12], dataQuality: A, lastVerified: D },
  { id: "3399", code: "3399", name: "丸千代山岡家", brands: ["山岡家"], categories: ["外食"], lifestyleTags: ["ラーメン好き"], minShares: 100, approxInvestment: 300000, annualValue: 3500, yieldPercent: 1.2, description: "3,500円相当のラーメン優待券", rightsMonths: [1, 7], dataQuality: A, lastVerified: D },
  { id: "3082", code: "3082", name: "きちりホールディングス", brands: ["KICHIRI"], categories: ["外食"], lifestyleTags: ["居酒屋好き", "デート"], minShares: 100, approxInvestment: 60000, annualValue: 1500, yieldPercent: 2.5, description: "1,500円相当の優待券", rightsMonths: [12], dataQuality: A, lastVerified: D },
  { id: "2762", code: "2762", name: "三光マーケティングフーズ", brands: ["金の蔵", "東方見聞録"], categories: ["外食"], lifestyleTags: ["居酒屋好き"], minShares: 100, approxInvestment: 50000, annualValue: 3000, yieldPercent: 6.0, description: "3,000円分の食事優待券", rightsMonths: [6, 12], dataQuality: A, lastVerified: D },
  { id: "3370", code: "3370", name: "フジタコーポレーション", brands: ["フジタ"], categories: ["外食"], lifestyleTags: [], minShares: 100, approxInvestment: 90000, annualValue: 4000, yieldPercent: 4.4, description: "4,000円分の食事優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "3066", code: "3066", name: "JBイレブン", brands: ["時の灯"], categories: ["外食"], lifestyleTags: ["外食月3回以上"], minShares: 100, approxInvestment: 50000, annualValue: 1500, yieldPercent: 3.0, description: "1,500円相当の食事優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "3076", code: "3076", name: "あい・ホールディングス", brands: ["BARZEL"], categories: ["外食"], lifestyleTags: [], minShares: 100, approxInvestment: 250000, annualValue: 1500, yieldPercent: 0.6, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "9279_b", code: "3175", name: "エー・ピーホールディングス", brands: ["塚田農場"], categories: ["外食"], lifestyleTags: ["居酒屋好き", "外食月3回以上"], minShares: 100, approxInvestment: 70000, annualValue: 4000, yieldPercent: 5.7, description: "塚田農場で使える4,000円分の食事優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "3543_2", code: "3163", name: "アルテック", brands: ["アルテック"], categories: ["商社"], lifestyleTags: [], minShares: 100, approxInvestment: 50000, annualValue: 1000, yieldPercent: 2.0, description: "クオカード1,000円", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "9619", code: "9619", name: "イチネンHD", brands: ["イチネン"], categories: ["サービス"], lifestyleTags: ["車所有"], minShares: 100, approxInvestment: 130000, annualValue: 2000, yieldPercent: 1.5, description: "クオカード2,000円分", rightsMonths: [3], dataQuality: A, lastVerified: D },

  // ---- スーパー追加(地域別) ----
  { id: "2624", code: "2624", name: "アークス", brands: ["アークス", "ラルズ", "ベルジョイス"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "北海道住み", "ファミリー"], minShares: 100, approxInvestment: 250000, annualValue: 2000, yieldPercent: 0.8, description: "北海道のスーパーで使える優待ポイント", rightsMonths: [2], dataQuality: A, lastVerified: D },
  { id: "8279", code: "8279", name: "ヤオコー", brands: ["ヤオコー", "Yaoko"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "ファミリー", "関東住み"], minShares: 100, approxInvestment: 800000, annualValue: 2000, yieldPercent: 0.3, description: "2,000円相当の自社商品優待券", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "2742", code: "2742", name: "ハローズ", brands: ["ハローズ"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "中国地方住み"], minShares: 100, approxInvestment: 350000, annualValue: 2000, yieldPercent: 0.6, description: "2,000円相当の自社商品券", rightsMonths: [2], dataQuality: A, lastVerified: D },
  { id: "8278", code: "8278", name: "フジ", brands: ["フジ", "フジマート"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "四国住み"], minShares: 100, approxInvestment: 150000, annualValue: 2000, yieldPercent: 1.3, description: "2,000円相当の自社商品券", rightsMonths: [2, 8], dataQuality: A, lastVerified: D },
  { id: "8260", code: "8260", name: "イズミヤ", brands: ["イズミヤ"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "関西住み"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "2,000円相当の優待券", rightsMonths: [2, 8], dataQuality: A, lastVerified: D },
  { id: "9947", code: "9947", name: "エコス", brands: ["エコス", "TAIRAYA"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "2,000円分の優待券", rightsMonths: [2], dataQuality: A, lastVerified: D },
  { id: "9956", code: "9956", name: "バローホールディングス", brands: ["バロー", "バロー食品館"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "東海住み"], minShares: 100, approxInvestment: 250000, annualValue: 2000, yieldPercent: 0.8, description: "2,000円相当のVドラッグ商品券", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "8198", code: "8198", name: "マックスバリュ東海", brands: ["マックスバリュ", "WAON"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "東海住み"], minShares: 100, approxInvestment: 250000, annualValue: 3000, yieldPercent: 1.2, description: "3,000円相当の自社商品券", rightsMonths: [2], dataQuality: A, lastVerified: D },
  { id: "8268", code: "8268", name: "西友", brands: ["西友"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い"], minShares: 100, approxInvestment: 100000, annualValue: 2000, yieldPercent: 2.0, description: "2,000円相当のウォルマートカード", rightsMonths: [3], dataQuality: A, lastVerified: D },

  // ---- ホームセンター ----
  { id: "8278_b", code: "8278_b", name: "コメリ", brands: ["コメリ", "コメリ・ホームセンター"], categories: ["小売", "ホームセンター"], lifestyleTags: ["持ち家", "DIY", "ガーデニング"], minShares: 100, approxInvestment: 300000, annualValue: 1000, yieldPercent: 0.3, description: "1,000円分のクオカード(自社商品割引あり)", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "3050", code: "3050", name: "DCMホールディングス", brands: ["DCM", "DCMダイキ", "DCMホーマック", "DCMカーマ"], categories: ["小売", "ホームセンター"], lifestyleTags: ["持ち家", "DIY", "車所有"], minShares: 100, approxInvestment: 130000, annualValue: 500, yieldPercent: 0.4, description: "500円相当のDCMギフトカード", rightsMonths: [2, 8], dataQuality: A, lastVerified: D },
  { id: "8021", code: "8021", name: "コーナン商事", brands: ["コーナン"], categories: ["小売", "ホームセンター"], lifestyleTags: ["持ち家", "DIY"], minShares: 100, approxInvestment: 400000, annualValue: 1000, yieldPercent: 0.3, description: "1,000円相当の自社商品券", rightsMonths: [2], dataQuality: A, lastVerified: D },

  // ---- ペット ----
  { id: "9929", code: "9929", name: "平和紙業", brands: ["平和紙業"], categories: ["商社"], lifestyleTags: [], minShares: 100, approxInvestment: 90000, annualValue: 1500, yieldPercent: 1.7, description: "クオカード1,500円分", rightsMonths: [5], dataQuality: A, lastVerified: D },

  // ---- 美容・化粧品(奥様向け追加) ----
  { id: "4914", code: "4914", name: "高砂香料工業", brands: ["高砂香料"], categories: ["化学"], lifestyleTags: [], minShares: 100, approxInvestment: 380000, annualValue: 1500, yieldPercent: 0.4, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "4924", code: "4924", name: "ドクターシーラボ", brands: ["Dr.Ci:Labo", "ドクターシーラボ"], categories: ["美容", "化粧品"], lifestyleTags: ["美容ケア", "化粧品愛用", "敏感肌"], minShares: 100, approxInvestment: 130000, annualValue: 3000, yieldPercent: 2.3, description: "ドクターシーラボの自社製品3,000円相当", rightsMonths: [7], dataQuality: A, lastVerified: D },
  { id: "4929", code: "4929", name: "アジュバンHD", brands: ["アジュバン", "REGGIO"], categories: ["美容", "化粧品"], lifestyleTags: ["美容ケア", "ヘアケア"], minShares: 100, approxInvestment: 80000, annualValue: 3000, yieldPercent: 3.8, description: "自社ヘアケア・スキンケア3,000円相当", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "4477", code: "4477", name: "BASE", brands: ["BASE"], categories: ["EC"], lifestyleTags: ["ネットショッピング多用"], minShares: 100, approxInvestment: 30000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし", rightsMonths: [12], dataQuality: A, lastVerified: D },

  // ---- ジュエリー(奥様向け) ----
  { id: "8101", code: "8101", name: "GSIクレオス", brands: ["GSIクレオス"], categories: ["商社"], lifestyleTags: [], minShares: 100, approxInvestment: 250000, annualValue: 1500, yieldPercent: 0.6, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "5187", code: "5187", name: "クリエートメディック", brands: ["CREATEMEDIC"], categories: ["医療"], lifestyleTags: [], minShares: 100, approxInvestment: 80000, annualValue: 1500, yieldPercent: 1.9, description: "クオカード1,500円分", rightsMonths: [9], dataQuality: A, lastVerified: D },

  // ---- エンタメ拡充 ----
  { id: "7832", code: "7832", name: "バンダイナムコHD", brands: ["バンダイ", "ナムコ", "ガンダム", "ガンプラ", "プリキュア", "アンパンマン"], categories: ["エンタメ"], lifestyleTags: ["子育て中", "ファミリー", "ゲーム好き"], minShares: 100, approxInvestment: 350000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8136", code: "8136", name: "サンリオ", brands: ["サンリオ", "ハローキティ", "マイメロディ", "ピューロランド", "シナモロール"], categories: ["エンタメ"], lifestyleTags: ["ファミリー", "テーマパーク好き", "子育て中"], minShares: 100, approxInvestment: 600000, annualValue: 6000, yieldPercent: 1.0, description: "ピューロランド・ハーモニーランドの入場優待券+自社製品", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "7552", code: "7552", name: "ハピネット", brands: ["Happinet", "プラモデル", "ホビー"], categories: ["エンタメ", "EC"], lifestyleTags: ["ゲーム好き", "子育て中"], minShares: 100, approxInvestment: 220000, annualValue: 2000, yieldPercent: 0.9, description: "2,000円相当の自社オンラインショップ優待", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "4751", code: "4751", name: "サイバーエージェント", brands: ["AbemaTV", "Ameba", "Cygames"], categories: ["エンタメ", "IT"], lifestyleTags: ["ゲーム好き", "動画視聴"], minShares: 100, approxInvestment: 95000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [9], dataQuality: V, lastVerified: D },
  { id: "9684", code: "9684", name: "スクウェア・エニックスHD", brands: ["スクウェア・エニックス", "FF", "ドラクエ", "ファイナルファンタジー"], categories: ["エンタメ"], lifestyleTags: ["ゲーム好き"], minShares: 100, approxInvestment: 470000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- ホテル拡充 ----
  { id: "9722", code: "9722", name: "藤田観光", brands: ["椿山荘", "ワシントンホテル", "藤田観光"], categories: ["ホテル", "旅行"], lifestyleTags: ["国内旅行派", "出張多い"], minShares: 100, approxInvestment: 240000, annualValue: 4000, yieldPercent: 1.7, description: "ホテル椿山荘やワシントンホテルで使える優待割引券", rightsMonths: [6, 12], dataQuality: A, lastVerified: D },
  { id: "9708", code: "9708", name: "帝国ホテル", brands: ["帝国ホテル"], categories: ["ホテル"], lifestyleTags: ["記念日外食", "高級ホテル"], minShares: 100, approxInvestment: 500000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9713", code: "9713", name: "ロイヤルホテル", brands: ["リーガロイヤルホテル", "Royal Hotel"], categories: ["ホテル"], lifestyleTags: ["国内旅行派", "出張多い"], minShares: 100, approxInvestment: 70000, annualValue: 3000, yieldPercent: 4.3, description: "リーガロイヤルホテルで使える3,000円相当の優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "9621", code: "9621", name: "建設技術研究所", brands: ["CTI"], categories: ["建設"], lifestyleTags: [], minShares: 100, approxInvestment: 480000, annualValue: 1500, yieldPercent: 0.3, description: "クオカード1,500円", rightsMonths: [12], dataQuality: A, lastVerified: D },

  // ---- 教育 ----
  { id: "9783", code: "9783", name: "ベネッセHD", brands: ["進研ゼミ", "こどもチャレンジ", "しまじろう", "ベネッセ"], categories: ["教育", "エンタメ"], lifestyleTags: ["子育て中", "教育熱心", "ファミリー"], minShares: 100, approxInvestment: 250000, annualValue: 2000, yieldPercent: 0.8, description: "ベネッセグループ商品2,000円相当(進研ゼミ教材、しまじろう関連等)", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9733", code: "9733", name: "ナガセ", brands: ["東進ハイスクール", "ナガセ"], categories: ["教育"], lifestyleTags: ["子育て中", "教育熱心"], minShares: 100, approxInvestment: 250000, annualValue: 2500, yieldPercent: 1.0, description: "ハーゲンダッツアイス引換券+お米", rightsMonths: [9], dataQuality: A, lastVerified: D },
  { id: "4714", code: "4714", name: "リソー教育", brands: ["TOMAS", "リソー教育"], categories: ["教育"], lifestyleTags: ["子育て中", "教育熱心"], minShares: 100, approxInvestment: 30000, annualValue: 1000, yieldPercent: 3.3, description: "リソー教育グループの優待+クオカード", rightsMonths: [2, 8], dataQuality: A, lastVerified: D },
  { id: "4668", code: "4668", name: "明光ネットワークジャパン", brands: ["明光義塾"], categories: ["教育"], lifestyleTags: ["子育て中", "教育熱心"], minShares: 100, approxInvestment: 90000, annualValue: 2000, yieldPercent: 2.2, description: "クオカード+明光義塾受講料割引", rightsMonths: [8], dataQuality: A, lastVerified: D },

  // ---- 食品追加 ----
  { id: "2226", code: "2226", name: "カルビー", brands: ["カルビー", "じゃがりこ", "ポテトチップス", "Calbee"], categories: ["食品"], lifestyleTags: ["子育て中", "ファミリー"], minShares: 100, approxInvestment: 320000, annualValue: 2000, yieldPercent: 0.6, description: "自社製品(ポテチ・じゃがりこ等)2,000円相当", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "2207", code: "2207", name: "名糖産業", brands: ["名糖産業", "ホームランバー"], categories: ["食品"], lifestyleTags: ["子育て中"], minShares: 100, approxInvestment: 200000, annualValue: 1500, yieldPercent: 0.8, description: "自社製品(アイス等)1,500円相当", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "2206", code: "2206", name: "江崎グリコ", brands: ["Glico", "ポッキー", "プリッツ", "アイスの実", "牧場しぼり"], categories: ["食品"], lifestyleTags: ["子育て中", "ファミリー"], minShares: 100, approxInvestment: 480000, annualValue: 2000, yieldPercent: 0.4, description: "自社商品2,000円相当(ポッキー・プリッツ等)", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "2730_b", code: "2734", name: "サーラコーポレーション", brands: ["サーラ"], categories: ["公益"], lifestyleTags: ["東海住み"], minShares: 100, approxInvestment: 80000, annualValue: 1500, yieldPercent: 1.9, description: "クオカード1,500円分", rightsMonths: [11], dataQuality: A, lastVerified: D },
  { id: "2222", code: "2222", name: "寿スピリッツ", brands: ["寿スピリッツ", "ルタオ", "鎌倉五郎"], categories: ["食品"], lifestyleTags: ["お菓子好き", "プレゼント購入", "おみやげ"], minShares: 100, approxInvestment: 220000, annualValue: 3000, yieldPercent: 1.4, description: "自社菓子3,000円相当(ルタオ等のお菓子セット)", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "2217", code: "2217", name: "モロゾフ", brands: ["モロゾフ", "Morozoff"], categories: ["食品"], lifestyleTags: ["お菓子好き", "プレゼント購入", "デート"], minShares: 100, approxInvestment: 380000, annualValue: 3000, yieldPercent: 0.8, description: "モロゾフのお菓子セット3,000円相当", rightsMonths: [1, 7], dataQuality: A, lastVerified: D },
  { id: "2209", code: "2209", name: "井村屋グループ", brands: ["井村屋", "あずきバー", "肉まん", "あんまん"], categories: ["食品"], lifestyleTags: ["子育て中", "ファミリー"], minShares: 100, approxInvestment: 180000, annualValue: 2000, yieldPercent: 1.1, description: "自社製品(あずきバー・肉まん等)2,000円相当", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "2918", code: "2918", name: "わらべや日洋HD", brands: ["わらべや日洋"], categories: ["食品"], lifestyleTags: [], minShares: 100, approxInvestment: 200000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし", rightsMonths: [2], dataQuality: A, lastVerified: D },
  { id: "2882", code: "2882", name: "イートアンドHD", brands: ["大阪王将", "イートアンド"], categories: ["外食"], lifestyleTags: ["外食月3回以上"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "大阪王将で使える2,000円相当の優待券", rightsMonths: [2, 8], dataQuality: A, lastVerified: D },
  { id: "2899", code: "2899", name: "永谷園HD", brands: ["永谷園", "お茶漬け海苔", "ふりかけ"], categories: ["食品"], lifestyleTags: ["自炊する", "ファミリー"], minShares: 100, approxInvestment: 230000, annualValue: 1500, yieldPercent: 0.7, description: "自社製品1,500円相当(お茶漬け・ふりかけ等)", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "2918_b", code: "2914", name: "JT(日本たばこ産業)", brands: ["JT", "メビウス", "セブンスター"], categories: ["食品"], lifestyleTags: ["喫煙者"], minShares: 100, approxInvestment: 350000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし(2024年廃止)、高配当銘柄", rightsMonths: [6, 12], dataQuality: V, lastVerified: D },

  // ---- 通信追加 ----
  { id: "3774", code: "3774", name: "インターネットイニシアティブ", brands: ["IIJmio", "IIJ"], categories: ["通信"], lifestyleTags: ["通信費を抑えたい", "ガジェット好き"], minShares: 100, approxInvestment: 230000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "3623", code: "3623", name: "ビリングシステム", brands: ["ビリングシステム"], categories: ["IT"], lifestyleTags: [], minShares: 100, approxInvestment: 50000, annualValue: 1000, yieldPercent: 2.0, description: "クオカード1,000円分", rightsMonths: [3], dataQuality: A, lastVerified: D },

  // ---- 雑貨・趣味 ----
  { id: "7846", code: "7846", name: "パイロットコーポレーション", brands: ["パイロット", "PILOT", "フリクション", "ハイテックC", "ドクターグリップ"], categories: ["雑貨"], lifestyleTags: ["文具好き", "在宅勤務多め"], minShares: 100, approxInvestment: 480000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "7906", code: "7906", name: "ヨネックス", brands: ["YONEX", "ヨネックス"], categories: ["スポーツ"], lifestyleTags: ["スポーツする", "テニス好き", "バドミントン好き"], minShares: 100, approxInvestment: 110000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "8014", code: "8014", name: "蝶理", brands: ["蝶理"], categories: ["商社"], lifestyleTags: [], minShares: 100, approxInvestment: 380000, annualValue: 1500, yieldPercent: 0.4, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "8086", code: "8086", name: "ニプロ", brands: ["ニプロ"], categories: ["医療"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 110000, annualValue: 1000, yieldPercent: 0.9, description: "クオカード1,000円分", rightsMonths: [3], dataQuality: A, lastVerified: D },

  // ---- IT・サブスク系 ----
  { id: "4751_b", code: "3756", name: "豆蔵HD", brands: ["豆蔵"], categories: ["IT"], lifestyleTags: [], minShares: 100, approxInvestment: 230000, annualValue: 1500, yieldPercent: 0.7, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "3970", code: "3970", name: "イノベーション", brands: ["List Finder"], categories: ["IT"], lifestyleTags: [], minShares: 100, approxInvestment: 100000, annualValue: 1500, yieldPercent: 1.5, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "3978", code: "3978", name: "マクロミル", brands: ["マクロミル", "Questant"], categories: ["IT"], lifestyleTags: [], minShares: 100, approxInvestment: 100000, annualValue: 1500, yieldPercent: 1.5, description: "クオカード1,500円分", rightsMonths: [6], dataQuality: A, lastVerified: D },
  { id: "4344", code: "4344", name: "ソースネクスト", brands: ["ソースネクスト", "POCKETALK"], categories: ["IT"], lifestyleTags: ["ガジェット好き"], minShares: 100, approxInvestment: 30000, annualValue: 1000, yieldPercent: 3.3, description: "自社ソフト製品1,000円相当", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "3635", code: "3635", name: "コーエーテクモHD", brands: ["コーエーテクモ", "信長の野望", "三國志", "無双"], categories: ["エンタメ"], lifestyleTags: ["ゲーム好き"], minShares: 100, approxInvestment: 180000, annualValue: 2000, yieldPercent: 1.1, description: "コーエーテクモゲームスでの優待+自社商品", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "3851", code: "3851", name: "日本一ソフトウェア", brands: ["日本一ソフトウェア"], categories: ["エンタメ"], lifestyleTags: ["ゲーム好き"], minShares: 100, approxInvestment: 80000, annualValue: 2000, yieldPercent: 2.5, description: "自社ゲーム製品2,000円相当", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "4385", code: "4385", name: "メルカリ", brands: ["メルカリ", "メルペイ", "メルカード"], categories: ["EC"], lifestyleTags: ["ネットショッピング多用", "コスパ志向"], minShares: 100, approxInvestment: 200000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし", rightsMonths: [6], dataQuality: V, lastVerified: D },
  { id: "4385_b", code: "6098", name: "リクルートHD", brands: ["リクルート", "Indeed", "じゃらん", "ホットペッパー", "SUUMO", "ゼクシィ", "タウンワーク"], categories: ["サービス"], lifestyleTags: ["ネットサービス多用"], minShares: 100, approxInvestment: 950000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- フィットネス・ジム ----
  { id: "4801", code: "4801", name: "セントラルスポーツ", brands: ["セントラルスポーツ", "セントラルフィットネスクラブ"], categories: ["スポーツ", "サービス"], lifestyleTags: ["スポーツする", "健康意識高い", "ジム通い"], minShares: 100, approxInvestment: 280000, annualValue: 4000, yieldPercent: 1.4, description: "施設利用券(年4枚・各)", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "4801_b", code: "2429", name: "ワールドHD", brands: ["ワールド", "TAKEO KIKUCHI", "UNTITLED", "INDIVI"], categories: ["ファッション"], lifestyleTags: ["ファッション好き", "ビジネスカジュアル"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "ワールドの自社ECで使える20%割引券", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "2733", code: "2733", name: "あらた", brands: ["あらた"], categories: ["商社"], lifestyleTags: [], minShares: 100, approxInvestment: 350000, annualValue: 1500, yieldPercent: 0.4, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },

  // ---- 自動車・関連追加 ----
  { id: "9869_b", code: "7203", name: "トヨタ自動車", brands: ["トヨタ", "TOYOTA", "LEXUS", "ヤリス", "プリウス", "アクア"], categories: ["自動車"], lifestyleTags: ["車所有", "高配当狙い"], minShares: 100, approxInvestment: 320000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "7267", code: "7267", name: "ホンダ", brands: ["Honda", "ホンダ", "ヴェゼル", "フィット", "シビック"], categories: ["自動車"], lifestyleTags: ["車所有"], minShares: 100, approxInvestment: 150000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "7201", code: "7201", name: "日産自動車", brands: ["日産", "Nissan", "リーフ", "アリア", "セレナ", "ノート", "エクストレイル"], categories: ["自動車"], lifestyleTags: ["車所有", "EV所有"], minShares: 100, approxInvestment: 50000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "7211", code: "7211", name: "三菱自動車", brands: ["三菱自動車", "アウトランダー", "デリカ"], categories: ["自動車"], lifestyleTags: ["車所有"], minShares: 100, approxInvestment: 50000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- 金融追加 ----
  { id: "8698", code: "8698", name: "マネックスグループ", brands: ["マネックス証券", "Monex", "TradeStation"], categories: ["金融"], lifestyleTags: ["投資する", "ネット証券利用"], minShares: 100, approxInvestment: 65000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし(廃止)、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "8628", code: "8628", name: "松井証券", brands: ["松井証券"], categories: ["金融"], lifestyleTags: ["投資する", "ネット証券利用"], minShares: 100, approxInvestment: 80000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "8316", code: "8316", name: "三井住友フィナンシャルG", brands: ["三井住友銀行", "SMBC", "Vpass"], categories: ["金融"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 1200000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8306", code: "8306", name: "三菱UFJフィナンシャルG", brands: ["三菱UFJ銀行", "UFJ", "MUFG"], categories: ["金融"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 200000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8411", code: "8411", name: "みずほフィナンシャルG", brands: ["みずほ銀行"], categories: ["金融"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 380000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8331", code: "8331", name: "千葉銀行", brands: ["千葉銀行"], categories: ["金融"], lifestyleTags: ["千葉住み"], minShares: 1000, approxInvestment: 1200000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、高配当銘柄", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "8377", code: "8377", name: "ほくほくフィナンシャルG", brands: ["北陸銀行", "北海道銀行"], categories: ["金融"], lifestyleTags: ["北陸住み", "北海道住み"], minShares: 100, approxInvestment: 130000, annualValue: 2500, yieldPercent: 1.9, description: "地元特産品2,500円相当", rightsMonths: [3], dataQuality: A, lastVerified: D },

  // ---- 不動産 ----
  { id: "8801", code: "8801", name: "三井不動産", brands: ["ららぽーと", "三井アウトレットパーク", "三井ガーデンホテル", "東京ミッドタウン"], categories: ["不動産"], lifestyleTags: ["ショッピング好き", "ファミリー"], minShares: 100, approxInvestment: 350000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8830", code: "8830", name: "住友不動産", brands: ["住友不動産", "ラ・トゥール"], categories: ["不動産"], lifestyleTags: [], minShares: 100, approxInvestment: 550000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8804", code: "8804", name: "東京建物", brands: ["東京建物", "Brillia"], categories: ["不動産"], lifestyleTags: ["持ち家"], minShares: 100, approxInvestment: 230000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "3289", code: "3289", name: "東急不動産HD", brands: ["東急不動産", "東急ハーヴェスト", "東急ステイ"], categories: ["不動産"], lifestyleTags: ["国内旅行派", "持ち家"], minShares: 100, approxInvestment: 110000, annualValue: 2000, yieldPercent: 1.8, description: "東急ハーヴェストクラブ等の優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },

  // ---- 公益 ----
  { id: "9531", code: "9531", name: "東京ガス", brands: ["東京ガス"], categories: ["公益"], lifestyleTags: ["東京住み"], minShares: 100, approxInvestment: 380000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9532", code: "9532", name: "大阪ガス", brands: ["大阪ガス", "Daigasグループ"], categories: ["公益"], lifestyleTags: ["関西住み"], minShares: 100, approxInvestment: 320000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9501", code: "9501", name: "東京電力HD", brands: ["TEPCO", "東京電力"], categories: ["公益"], lifestyleTags: ["東京住み"], minShares: 100, approxInvestment: 50000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9503", code: "9503", name: "関西電力", brands: ["関西電力", "KEPCO"], categories: ["公益"], lifestyleTags: ["関西住み"], minShares: 100, approxInvestment: 220000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- 建設 ----
  { id: "1928", code: "1928", name: "積水ハウス", brands: ["積水ハウス", "シャーウッド"], categories: ["建設"], lifestyleTags: ["持ち家"], minShares: 100, approxInvestment: 380000, annualValue: 3000, yieldPercent: 0.8, description: "3,000円相当の自社米(魚沼産コシヒカリ等)", rightsMonths: [1], dataQuality: V, lastVerified: D },
  { id: "1925", code: "1925", name: "大和ハウス工業", brands: ["大和ハウス", "ダイワロイヤルゴルフ", "ダイワロイネット"], categories: ["建設"], lifestyleTags: ["持ち家", "ゴルフ好き"], minShares: 100, approxInvestment: 480000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "1808", code: "1808", name: "長谷工コーポレーション", brands: ["長谷工"], categories: ["建設"], lifestyleTags: ["持ち家"], minShares: 1000, approxInvestment: 1800000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 商社 ----
  { id: "8002", code: "8002", name: "丸紅", brands: ["丸紅"], categories: ["商社"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 320000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "8053", code: "8053", name: "住友商事", brands: ["住友商事", "ジュピターショップチャンネル"], categories: ["商社"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 320000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- 海運 ----
  { id: "9101", code: "9101", name: "日本郵船", brands: ["日本郵船", "NYK"], categories: ["海運"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 480000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、高配当銘柄として人気", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "9104", code: "9104", name: "商船三井", brands: ["商船三井", "MOL"], categories: ["海運"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 480000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、高配当銘柄として人気", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- 製造業・部品 ----
  { id: "8035", code: "8035", name: "東京エレクトロン", brands: ["TEL", "東京エレクトロン"], categories: ["製造業"], lifestyleTags: ["高配当狙い"], minShares: 100, approxInvestment: 2400000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },

  // ---- 医薬 ----
  { id: "4502", code: "4502", name: "武田薬品工業", brands: ["タケダ", "Takeda"], categories: ["医薬"], lifestyleTags: ["健康意識高い", "高配当狙い"], minShares: 100, approxInvestment: 450000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、高配当銘柄", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "4503", code: "4503", name: "アステラス製薬", brands: ["アステラス製薬"], categories: ["医薬"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 160000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3, 9], dataQuality: V, lastVerified: D },
  { id: "4519", code: "4519", name: "中外製薬", brands: ["中外製薬"], categories: ["医薬"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 700000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "4517", code: "4517", name: "ビオフェルミン製薬", brands: ["ビオフェルミン"], categories: ["医薬"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 200000, annualValue: 2000, yieldPercent: 1.0, description: "自社製品2,000円相当", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "4536", code: "4536", name: "参天製薬", brands: ["参天製薬", "サンテ目薬"], categories: ["医薬"], lifestyleTags: ["健康意識高い", "視力ケア"], minShares: 100, approxInvestment: 150000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "4528", code: "4528", name: "小野薬品工業", brands: ["小野薬品"], categories: ["医薬"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 170000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "4534", code: "4534", name: "持田製薬", brands: ["持田製薬"], categories: ["医薬"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 280000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [3], dataQuality: V, lastVerified: D },

  // ---- 日用品・家電製造 ----
  { id: "4452", code: "4452", name: "花王", brands: ["花王", "メリーズ", "アタック", "ビオレ", "ニベア", "エッセンシャル", "ソフィーナ"], categories: ["日用品", "美容"], lifestyleTags: ["日用品まとめ買い", "子育て中", "美容ケア"], minShares: 100, approxInvestment: 580000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "8060", code: "8060", name: "キヤノンマーケティングジャパン", brands: ["キヤノン", "Canon"], categories: ["家電", "IT"], lifestyleTags: ["カメラ好き", "ガジェット好き"], minShares: 100, approxInvestment: 320000, annualValue: 0, yieldPercent: 0.0, description: "現在は優待なし、配当狙い", rightsMonths: [12], dataQuality: V, lastVerified: D },
  { id: "7972", code: "7972", name: "イトーキ", brands: ["イトーキ", "ITOKI", "オフィスチェア"], categories: ["家具"], lifestyleTags: ["在宅勤務多め", "持ち家"], minShares: 100, approxInvestment: 200000, annualValue: 1500, yieldPercent: 0.8, description: "1,500円相当のクオカード", rightsMonths: [12], dataQuality: V, lastVerified: D },

  // ---- クオカード系(株主優待初心者向け) ----
  { id: "4659", code: "4659", name: "エイジス", brands: ["エイジス"], categories: ["サービス"], lifestyleTags: [], minShares: 100, approxInvestment: 200000, annualValue: 1000, yieldPercent: 0.5, description: "クオカード1,000円分", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "7575", code: "7575", name: "日本ライフライン", brands: ["日本ライフライン"], categories: ["医療"], lifestyleTags: ["健康意識高い"], minShares: 100, approxInvestment: 140000, annualValue: 1500, yieldPercent: 1.1, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: V, lastVerified: D },
  { id: "9384_b", code: "8133", name: "伊藤忠エネクス", brands: ["伊藤忠エネクス"], categories: ["商社", "エネルギー"], lifestyleTags: [], minShares: 100, approxInvestment: 130000, annualValue: 1500, yieldPercent: 1.2, description: "クオカード1,500円分", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "9268", code: "9268", name: "オプティマスグループ", brands: ["オプティマス"], categories: ["商社"], lifestyleTags: [], minShares: 100, approxInvestment: 130000, annualValue: 1000, yieldPercent: 0.8, description: "1,000円相当のクオカード", rightsMonths: [3], dataQuality: A, lastVerified: D },
  { id: "8014_b", code: "8045", name: "横浜丸魚", brands: ["横浜丸魚"], categories: ["卸売"], lifestyleTags: [], minShares: 100, approxInvestment: 30000, annualValue: 1500, yieldPercent: 5.0, description: "クオカード1,500円分", rightsMonths: [9], dataQuality: A, lastVerified: D },
  { id: "9869", code: "9869", name: "加藤産業", brands: ["加藤産業"], categories: ["卸売"], lifestyleTags: [], minShares: 100, approxInvestment: 500000, annualValue: 3000, yieldPercent: 0.6, description: "3,000円相当の自社取扱商品", rightsMonths: [3], dataQuality: A, lastVerified: D },

  // ---- 趣味・カメラ・自転車 ----
  { id: "7867_b", code: "7240", name: "NOK", brands: ["NOK"], categories: ["製造業"], lifestyleTags: [], minShares: 100, approxInvestment: 250000, annualValue: 1000, yieldPercent: 0.4, description: "クオカード1,000円分", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },

  // ---- スーパー追加(関東) ----

  // ---- 物流・運輸 ----
  { id: "9020_b", code: "9008", name: "京王電鉄", brands: ["京王電鉄", "京王百貨店"], categories: ["交通", "小売"], lifestyleTags: ["電車通勤", "東京西部住み"], minShares: 100, approxInvestment: 470000, annualValue: 2000, yieldPercent: 0.4, description: "京王線乗車券+京王グループ優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "9006", code: "9006", name: "京浜急行電鉄", brands: ["京急電鉄", "京急百貨店"], categories: ["交通"], lifestyleTags: ["電車通勤", "神奈川住み"], minShares: 100, approxInvestment: 130000, annualValue: 1500, yieldPercent: 1.2, description: "京急線乗車券+羽田空港の優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "9024", code: "9024", name: "西武HD", brands: ["西武鉄道", "西武ライオンズ", "西武園ゆうえんち", "プリンスホテル"], categories: ["交通", "エンタメ"], lifestyleTags: ["電車通勤", "テーマパーク好き"], minShares: 100, approxInvestment: 350000, annualValue: 2000, yieldPercent: 0.6, description: "西武線乗車券+プリンスホテル・西武園優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "9042", code: "9042", name: "阪急阪神HD", brands: ["阪急電車", "阪神電車", "阪神タイガース"], categories: ["交通"], lifestyleTags: ["関西住み"], minShares: 100, approxInvestment: 480000, annualValue: 2000, yieldPercent: 0.4, description: "阪急阪神電車乗車券+グループ施設優待", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },

  // ---- 雑貨・ライフスタイル ----
  { id: "2730_c", code: "8160", name: "木曽路", brands: ["木曽路", "ふぐ料理"], categories: ["外食"], lifestyleTags: ["記念日外食", "和食好き"], minShares: 100, approxInvestment: 250000, annualValue: 1600, yieldPercent: 0.6, description: "1,600円相当の食事優待券", rightsMonths: [3, 9], dataQuality: A, lastVerified: D },
  { id: "8194_b", code: "8267_b2", name: "イオン九州", brands: ["イオン", "マックスバリュ九州"], categories: ["小売"], lifestyleTags: ["日用品まとめ買い", "九州住み"], minShares: 100, approxInvestment: 250000, annualValue: 2000, yieldPercent: 0.8, description: "2,000円相当のイオングループ商品券", rightsMonths: [2], dataQuality: A, lastVerified: D },

  // ---- IT・金融サービス ----
  { id: "3994", code: "3994", name: "マネーフォワード", brands: ["マネーフォワード", "マネーフォワードME", "MoneyForward", "Money Forward", "マネフォ", "マネーフォワード クラウド"], categories: ["IT", "金融", "サービス"], lifestyleTags: ["家計簿", "投資する", "ガジェット好き", "資産管理", "確定申告"], minShares: 100, approxInvestment: 430000, annualValue: 6000, yieldPercent: 1.4, description: "100株でマネーフォワードMEプレミアムサービス半年分クーポン×2(年間6,000円相当)。200株以上で資産形成アドバンスコース、300株以上でクラウド確定申告も追加(半年以上継続保有が条件、2026年11月基準日以降)", rightsMonths: [5, 11], dataQuality: V, lastVerified: D },

  // 注: J-Quants/TDnet 自動取得基盤構築後にさらに拡張予定
];

export type { Yutai };

// 最終データ更新日(UI表示用)
export const DATA_LAST_UPDATED = "2026-05-27";

// 検証済み銘柄数 / 全銘柄数
export const VERIFIED_COUNT = YUTAI_LIST.filter(y => y.dataQuality === "verified").length;
export const TOTAL_COUNT = YUTAI_LIST.length;
