import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { Segmented } from 'antd'
import { getMonthStatsByCategory, loadCategories } from '../db'
import { getCategory1Name } from '../data/categories'
import type { Category1 } from '../types'
import dayjs from 'dayjs'

function Statistics() {
  const [period, setPeriod] = useState<string>('本月')
  const [categories, setCategories] = useState<Category1[]>([])
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([])
  const [rankData, setRankData] = useState<{ key: string; total: number; pct: string }[]>([])
  const [totalExpense, setTotalExpense] = useState(0)

  useEffect(() => {
    loadCategories().then(setCategories)
  }, [])

  useEffect(() => {
    loadData()
  }, [period, categories])

  const loadData = async () => {
    const now = dayjs()
    let year = now.year()
    let month = now.month() + 1

    if (period === '上月') {
      const last = now.subtract(1, 'month')
      year = last.year()
      month = last.month() + 1
    }

    const stats = await getMonthStatsByCategory(year, month)
    const total = stats.reduce((s, i) => s + i.total, 0)
    setTotalExpense(total)

    const data = stats
      .filter((s) => s.total > 0)
      .map((s) => ({
        name: getCategory1Name(s.key, categories),
        value: Math.round(s.total * 100) / 100,
      }))
    setPieData(data)

    setRankData(
      stats.map((s) => ({
        key: s.key,
        total: s.total,
        pct: total > 0 ? ((s.total / total) * 100).toFixed(1) : '0',
      }))
    )
  }

  const pieOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: ¥{c}<br/>占比: {d}%',
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: pieData,
      },
    ],
    color: [
      '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7',
      '#da77f2', '#20c997', '#f06595', '#74c0fc', '#fcc419',
      '#845ef7', '#5c7cfa',
    ],
  }

  // 为每个一级分类获取对应颜色
  const getColor = (idx: number) => {
    const colors = [
      '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7',
      '#da77f2', '#20c997', '#f06595', '#74c0fc', '#fcc419',
      '#845ef7', '#5c7cfa',
    ]
    return colors[idx % colors.length]
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>📊 统计</h2>
      </div>

      <div className="period-switch">
        <Segmented
          options={['本月', '上月']}
          value={period}
          onChange={(val) => setPeriod(val as string)}
          block
        />
      </div>

      {totalExpense > 0 ? (
        <>
          <div className="total-expense-label">
            {period}总支出 <strong>¥{totalExpense.toFixed(2)}</strong>
          </div>

          {/* 饼图 */}
          <div className="chart-container">
            <ReactECharts option={pieOption} style={{ height: 260 }} />
          </div>

          {/* 分类排行 */}
          <div className="section">
            <div className="section-header">
              <span>分类排行榜</span>
            </div>
            <div className="rank-list">
              {rankData.map((item, idx) => (
                <div key={item.key} className="rank-list-item">
                  <span
                    className="rank-dot"
                    style={{ background: getColor(idx) }}
                  />
                  <span className="rank-list-name">{getCategory1Name(item.key, categories)}</span>
                  <span className="rank-list-pct">{item.pct}%</span>
                  <span className="rank-list-amount">¥{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-page">
          <div className="empty-icon">📊</div>
          <p>{period}暂无支出记录</p>
        </div>
      )}
    </div>
  )
}

export default Statistics
