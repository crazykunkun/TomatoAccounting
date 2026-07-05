import type { Category1 } from '../types'

export const categories: Category1[] = [
  {
    key: 'food',
    name: '食品餐饮',
    icon: '🍜',
    children: [
      { key: 'meal', name: '早午晚餐' },
      { key: 'takeout', name: '外卖' },
      { key: 'snack', name: '水果零食' },
      { key: 'drink', name: '烟酒茶咖' },
      { key: 'party', name: '聚餐请客' },
      { key: 'grocery', name: '食材调料' },
    ],
  },
  {
    key: 'transport',
    name: '交通出行',
    icon: '🚗',
    children: [
      { key: 'transit', name: '公交地铁' },
      { key: 'taxi', name: '打车/网约车' },
      { key: 'fuel', name: '加油充电' },
      { key: 'parking', name: '停车过路费' },
      { key: 'car_maintain', name: '车辆养护' },
      { key: 'bike', name: '共享单车' },
    ],
  },
  {
    key: 'housing',
    name: '居家生活',
    icon: '🏠',
    children: [
      { key: 'rent', name: '房租/房贷' },
      { key: 'utility', name: '水电燃气' },
      { key: 'property', name: '物业费' },
      { key: 'furniture', name: '家居家装' },
      { key: 'daily', name: '日用百货' },
      { key: 'housekeeping', name: '家政服务' },
    ],
  },
  {
    key: 'shopping',
    name: '购物消费',
    icon: '🛒',
    children: [
      { key: 'clothing', name: '服饰鞋包' },
      { key: 'beauty', name: '美妆护肤' },
      { key: 'digital', name: '数码电子' },
      { key: 'sports', name: '运动户外' },
      { key: 'baby', name: '母婴用品' },
      { key: 'pet', name: '宠物用品' },
      { key: 'other_shopping', name: '其他购物' },
    ],
  },
  {
    key: 'entertainment',
    name: '休闲娱乐',
    icon: '🎮',
    children: [
      { key: 'movie', name: '电影演出' },
      { key: 'game', name: '游戏充值' },
      { key: 'fitness', name: '运动健身' },
      { key: 'travel', name: '旅行出游' },
      { key: 'play', name: '休闲玩乐' },
      { key: 'subscription', name: '会员订阅' },
    ],
  },
  {
    key: 'health',
    name: '医疗健康',
    icon: '💊',
    children: [
      { key: 'clinic', name: '门诊挂号' },
      { key: 'medicine', name: '药品费' },
      { key: 'hospital', name: '住院手术' },
      { key: 'dental', name: '牙科眼科' },
      { key: 'checkup', name: '体检保健' },
    ],
  },
  {
    key: 'study',
    name: '学习进修',
    icon: '📚',
    children: [
      { key: 'books', name: '书籍阅读' },
      { key: 'course', name: '课程培训' },
      { key: 'exam', name: '考试报名' },
      { key: 'stationery', name: '文具办公' },
    ],
  },
  {
    key: 'social',
    name: '人情往来',
    icon: '🎁',
    children: [
      { key: 'red_packet', name: '红包礼金' },
      { key: 'gift', name: '礼物馈赠' },
      { key: 'parents', name: '赡养孝敬' },
      { key: 'donation', name: '捐赠公益' },
    ],
  },
  {
    key: 'communication',
    name: '通讯网络',
    icon: '📱',
    children: [
      { key: 'phone', name: '手机话费' },
      { key: 'internet', name: '宽带网络' },
      { key: 'delivery', name: '快递物流' },
    ],
  },
  {
    key: 'finance',
    name: '金融保险',
    icon: '💰',
    children: [
      { key: 'insurance', name: '保险费' },
      { key: 'loan_interest', name: '贷款利息' },
      { key: 'bank_fee', name: '银行手续费' },
    ],
  },
  {
    key: 'children',
    name: '育儿教育',
    icon: '👶',
    children: [
      { key: 'tuition', name: '学费杂费' },
      { key: 'interest_class', name: '兴趣班' },
      { key: 'toys', name: '玩具绘本' },
      { key: 'daycare', name: '托管看护' },
    ],
  },
  {
    key: 'other',
    name: '其他支出',
    icon: '📦',
    children: [
      { key: 'documents', name: '证件办理' },
      { key: 'fine', name: '罚款损失' },
      { key: 'misc', name: '其他杂项' },
    ],
  },
]

// 根据 key 查找一级分类
export function getCategory1(key: string): Category1 | undefined {
  return categories.find((c) => c.key === key)
}

// 根据 key 查找分类名称
export function getCategoryName(cat1Key: string, cat2Key: string): string {
  const cat1 = getCategory1(cat1Key)
  if (!cat1) return '未知分类'
  const cat2 = cat1.children.find((c) => c.key === cat2Key)
  return cat2 ? `${cat1.icon} ${cat1.name}/${cat2.name}` : `${cat1.icon} ${cat1.name}`
}

// 获取一级分类名称（含图标）
export function getCategory1Name(key: string): string {
  const cat = getCategory1(key)
  return cat ? `${cat.icon} ${cat.name}` : '未知分类'
}

// 获取二级分类名称
export function getCategory2Name(cat1Key: string, cat2Key: string): string {
  const cat1 = getCategory1(cat1Key)
  if (!cat1) return '未知'
  const cat2 = cat1.children.find((c) => c.key === cat2Key)
  return cat2 ? cat2.name : '未知'
}
