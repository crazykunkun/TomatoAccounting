import Dexie, { type Table } from 'dexie'
import type { Expense } from '../types'

class TomatoDB extends Dexie {
  expenses!: Table<Expense, number>

  constructor() {
    super('tomato-accounting')
    this.version(1).stores({
      expenses: '++id, amount, category1, category2, date, createdAt',
    })
  }
}

export const db = new TomatoDB()

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
