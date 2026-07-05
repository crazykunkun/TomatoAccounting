import { useState, useEffect } from 'react'
import { Modal, message } from 'antd'
import { getExpenses, deleteExpense } from '../db'
import { getCategory1Name, getCategory2Name } from '../data/categories'
import type { Expense } from '../types'
import dayjs from 'dayjs'

function Bills() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const data = await getExpenses()
    setExpenses(data)
  }

  // 按日期分组
  const grouped = expenses.reduce(
    (acc, e) => {
      if (!acc[e.date]) acc[e.date] = []
      acc[e.date].push(e)
      return acc
    },
    {} as Record<string, Expense[]>
  )

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  // 每月合计
  const monthTotal = expenses.reduce((s, e) => s + e.amount, 0)

  const handleDelete = async () => {
    if (!deleteTarget?.id) return
    try {
      await deleteExpense(deleteTarget.id)
      message.success('已删除')
      setDeleteTarget(null)
      loadData()
    } catch {
      message.error('删除失败')
    }
  }

  // 格式化日期显示
  const formatDateLabel = (dateStr: string) => {
    const d = dayjs(dateStr)
    const now = dayjs()
    const diff = now.diff(d, 'day')
    if (diff === 0) return '今天'
    if (diff === 1) return '昨天'
    if (diff === 2) return '前天'
    return `${d.month() + 1}月${d.date()}日 周${['日', '一', '二', '三', '四', '五', '六'][d.day()]}`
  }

  // 当天合计
  const getDateTotal = (dateStr: string) => {
    return grouped[dateStr].reduce((s, e) => s + e.amount, 0)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>📋 账单</h2>
        <span className="header-month">
          本月合计 ¥{monthTotal.toFixed(2)}
        </span>
      </div>

      {dates.length > 0 ? (
        <div className="bill-list">
          {dates.map((date) => (
            <div key={date} className="bill-group">
              <div className="bill-date-header">
                <span>{formatDateLabel(date)}</span>
                <span className="date-total">¥{getDateTotal(date).toFixed(2)}</span>
              </div>
              {grouped[date].map((e) => (
                <div
                  key={e.id}
                  className="bill-item"
                  onLongPress={() => setDeleteTarget(e)}
                  onClick={() => setDeleteTarget(e)}
                >
                  <div className="bill-info">
                    <div className="bill-cat">
                      {getCategory1Name(e.category1)} / {getCategory2Name(e.category1, e.category2)}
                    </div>
                    {e.note && <div className="bill-note">{e.note}</div>}
                  </div>
                  <div className="bill-amount">¥{e.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-page">
          <div className="empty-icon">📭</div>
          <p>还没有记账记录</p>
        </div>
      )}

      {/* 删除确认 */}
      <Modal
        title="确认删除"
        open={!!deleteTarget}
        onOk={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        centered
      >
        {deleteTarget && (
          <p>
            确定要删除这笔记录吗？
            <br />
            <strong>
              {getCategory1Name(deleteTarget.category1)} ¥{deleteTarget.amount.toFixed(2)}
            </strong>
          </p>
        )}
      </Modal>
    </div>
  )
}

export default Bills
