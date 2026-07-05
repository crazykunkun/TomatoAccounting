import { useState, useEffect } from 'react'
import { useNavigate } from './useNavigate'
import { getExpensesByMonth, getMonthStatsByCategory, loadCategories } from '../db'
import { getCategory1Name } from '../data/categories'
import type { Expense, Category1 } from '../types'
import dayjs from 'dayjs'

interface Props {
  onNavigate: (tab: any) => void
}

function Dashboard({ onNavigate }: Props) {
  const navigate = useNavigate(onNavigate)
  const [categories, setCategories] = useState<Category1[]>([])
  const [monthTotal, setMonthTotal] = useState(0)
  const [recordCount, setRecordCount] = useState(0)
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [topCategories, setTopCategories] = useState<{ key: string; total: number }[]>([])
  const [lastMonthTotal, setLastMonthTotal] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const cats = await loadCategories()
    setCategories(cats)
    const now = dayjs()
    const year = now.year()
    const month = now.month() + 1

    // 本月数据
    const expenses = await getExpensesByMonth(year, month)
    const total = expenses.reduce((s, e) => s + e.amount, 0)
    setMonthTotal(total)
    setRecordCount(expenses.length)
    setRecentExpenses(expenses.slice(0, 5))

    // 分类统计
    const stats = await getMonthStatsByCategory(year, month)
    setTopCategories(stats.slice(0, 5))

    // 上月数据（用于环比）
    const lastMonth = now.subtract(1, 'month')
    const lastExpenses = await getExpensesByMonth(lastMonth.year(), lastMonth.month() + 1)
    setLastMonthTotal(lastExpenses.reduce((s, e) => s + e.amount, 0))
  }

  // 月环比变化
  const monthChange = lastMonthTotal > 0
    ? ((monthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(0)
    : null

  // 日均支出
  const today = dayjs().date()
  const avgDaily = today > 0 ? (monthTotal / today).toFixed(0) : '0'

  return (
    <div className="page">
      <div className="page-header">
        <h2>💰 总览</h2>
        <span className="header-month">{dayjs().format('YYYY年M月')}</span>
      </div>

      {/* 数据卡片 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-label">本月支出</div>
          <div className="stat-value primary">¥{monthTotal.toFixed(2)}</div>
          {monthChange !== null && (
            <div className={`stat-sub ${parseInt(monthChange) > 0 ? 'up' : 'down'}`}>
              较上月 {parseInt(monthChange) >= 0 ? '↑' : '↓'} {Math.abs(parseInt(monthChange))}%
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">日均支出</div>
          <div className="stat-value">¥{avgDaily}</div>
          <div className="stat-sub">共 {recordCount} 笔</div>
        </div>
      </div>

      {/* 分类排行 */}
      {topCategories.length > 0 && (
        <div className="section">
          <div className="section-header">
            <span>支出分类排行</span>
            <span className="section-more" onClick={() => navigate('statistics')}>查看更多 ›</span>
          </div>
          <div className="category-rank">
            {topCategories.map((item, idx) => {
              const maxTotal = topCategories[0]?.total || 1
              const pct = Math.round((item.total / maxTotal) * 100)
              return (
                <div key={item.key} className="rank-item">
                  <span className="rank-num">{idx + 1}</span>
                  <span className="rank-name">{getCategory1Name(item.key, categories)}</span>
                  <span className="rank-bar-wrap">
                    <span className="rank-bar" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="rank-amount">¥{item.total.toFixed(0)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 最近账单 */}
      <div className="section">
        <div className="section-header">
          <span>最近账单</span>
          <span className="section-more" onClick={() => navigate('bills')}>全部 ›</span>
        </div>
        {recentExpenses.length > 0 ? (
          <div className="recent-list">
            {recentExpenses.map((e) => (
              <div key={e.id} className="recent-item">
                <span className="recent-cat">{getCategory1Name(e.category1, categories)}</span>
                <span className="recent-date">{e.date.slice(5)}</span>
                <span className="recent-amount">¥{e.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-hint" onClick={() => navigate('add')}>
            还没有记录，去记一笔 →
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
