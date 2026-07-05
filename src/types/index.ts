// 一级分类
export interface Category1 {
  key: string
  name: string
  icon: string
  children: Category2[]
}

// 二级分类
export interface Category2 {
  key: string
  name: string
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
