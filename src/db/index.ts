import Dexie, { type Table } from 'dexie'
import type { Expense, CategoryStore, Category1 } from '../types'
import { defaultCategories } from '../data/categories'

class TomatoDB extends Dexie {
  expenses!: Table<Expense, number>
  settings!: Table<CategoryStore, string>

  constructor() {
    super('tomato-accounting')
    this.version(1).stores({
      expenses: '++id, amount, category1, category2, date, createdAt',
    })
    this.version(2).stores({
      expenses: '++id, amount, category1, category2, date, createdAt',
      settings: 'key',
    })
  }
}

export const db = new TomatoDB()

// ========== 分类管理 ==========

// 加载分类（首次自动用预设数据初始化）
export async function loadCategories(): Promise<Category1[]> {
  const record = await db.settings.get('categories')
  if (!record) {
    // 首次使用，写入预设分类（标记为预设，不可删除）
    const seeded = markPreset(defaultCategories)
    await db.settings.put({ key: 'categories', value: seeded })
    return seeded
  }
  // 迁移旧数据：没有 isPreset 标记的版本，自动补上
  const needsMigration = record.value.some(
    (cat: Category1) => cat.isPreset === undefined
  )
  if (needsMigration) {
    const migrated = record.value.map((cat: Category1) => {
      const isPresetCat = defaultCategories.some((d) => d.key === cat.key)
      return {
        ...cat,
        isPreset: isPresetCat,
        children: cat.children.map((child) => {
          const isPresetChild = isPresetCat && defaultCategories
            .find((d) => d.key === cat.key)
            ?.children.some((c) => c.key === child.key)
          return { ...child, isPreset: child.isPreset ?? isPresetChild }
        }),
      }
    })
    await db.settings.put({ key: 'categories', value: migrated })
    return migrated
  }
  return record.value
}

// 给默认分类打上预设标记
function markPreset(cats: Category1[]): Category1[] {
  return cats.map((cat) => ({
    ...cat,
    isPreset: true,
    children: cat.children.map((child) => ({ ...child, isPreset: true })),
  }))
}

// 保存分类
export async function saveCategories(categories: Category1[]): Promise<void> {
  await db.settings.put({ key: 'categories', value: categories })
}

// ========== 支出记录 ==========

// 添加一笔支出
export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
  return db.expenses.add({
    ...expense,
    createdAt: Date.now(),
  })
}

// 获取所有支出（按日期降序）
export async function getExpenses() {
  return db.expenses.orderBy('date').reverse().toArray()
}

// 获取指定月份的支出
export async function getExpensesByMonth(year: number, month: number) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return db.expenses
    .where('date')
    .startsWith(prefix)
    .reverse()
    .sortBy('date')
}

// 获取指定日期的支出
export async function getExpensesByDate(date: string) {
  return db.expenses.where('date').equals(date).toArray()
}

// 更新一笔支出
export async function updateExpense(id: number, data: Partial<Expense>) {
  return db.expenses.update(id, data)
}

// 删除一笔支出
export async function deleteExpense(id: number) {
  return db.expenses.delete(id)
}

// 获取某月总支出
export async function getMonthTotal(year: number, month: number) {
  const expenses = await getExpensesByMonth(year, month)
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

// 获取某月按一级分类汇总
export async function getMonthStatsByCategory(year: number, month: number) {
  const expenses = await getExpensesByMonth(year, month)
  const map = new Map<string, number>()
  expenses.forEach((e) => {
    map.set(e.category1, (map.get(e.category1) || 0) + e.amount)
  })
  return Array.from(map.entries())
    .map(([key, total]) => ({ key, total }))
    .sort((a, b) => b.total - a.total)
}

// 统计某一级分类下的支出记录数
export async function countExpensesByCategory1(cat1Key: string): Promise<number> {
  return db.expenses.where('category1').equals(cat1Key).count()
}

// 统计某二级分类下的支出记录数
export async function countExpensesByCategory2(cat1Key: string, cat2Key: string): Promise<number> {
  return db.expenses
    .where('category1')
    .equals(cat1Key)
    .and((e) => e.category2 === cat2Key)
    .count()
}
