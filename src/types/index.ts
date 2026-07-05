// 一级分类
export interface Category1 {
  key: string
  name: string
  icon: string
  children: Category2[]
  isPreset?: boolean    // 是否为预设分类，预设分类不可删除
}

// 二级分类
export interface Category2 {
  key: string
  name: string
  isPreset?: boolean    // 是否为预设子分类
}

// 支出记录
export interface Expense {
  id?: number
  amount: number          // 金额（元）
  category1: string       // 一级分类 key
  category2: string       // 二级分类 key
  date: string            // 日期 YYYY-MM-DD
  note: string            // 备注
  createdAt: number       // 创建时间戳
}

// 分类存储（数据库 settings 表用）
export interface CategoryStore {
  key: string             // 固定为 'categories'
  value: Category1[]      // 完整分类数组
}
