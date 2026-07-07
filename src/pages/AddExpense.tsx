import { useState, useEffect } from 'react'
import { Button, Input, DatePicker, Modal, message, Spin } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { getCategory1Name, getCategory2Name } from '../data/categories'
import { addExpense, loadCategories } from '../db'
import type { Category1, Category2 } from '../types'

interface Props {
  onSuccess: () => void
}

function AddExpense({ onSuccess }: Props) {
  const [amount, setAmount] = useState('')
  const [cat1Key, setCat1Key] = useState<string>('food')
  const [cat2Key, setCat2Key] = useState<string>('meal')
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [note, setNote] = useState('')
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [categories, setCategories] = useState<Category1[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
      .then((cats) => {
        setCategories(cats)
        if (cats.length > 0) {
          setCat1Key(cats[0].key)
          setCat2Key(cats[0].children[0]?.key || '')
        }
      })
      .catch(() => {
        message.error('加载分类失败，请刷新页面重试')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // 数字键盘按键
  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setAmount((prev) => prev.slice(0, -1))
    } else if (key === '.') {
      if (!amount.includes('.') && amount.length > 0) {
        setAmount((prev) => prev + '.')
      }
    } else if (key === 'clear') {
      setAmount('')
    } else {
      // 小数点后最多两位
      if (amount.includes('.')) {
        const decimal = amount.split('.')[1]
        if (decimal && decimal.length >= 2) return
      }
      // 最多8位整数
      const intPart = amount.split('.')[0]
      if (!amount.includes('.') && intPart.length >= 8) return
      setAmount((prev) => prev + key)
    }
  }

  // 确认记账
  const handleSubmit = async () => {
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) {
      message.warning('请输入正确的金额')
      return
    }
    if (num > 99999999) {
      message.warning('金额不能超过 99,999,999 元')
      return
    }

    try {
      await addExpense({
        amount: Math.round(num * 100) / 100, // 保留两位小数
        category1: cat1Key,
        category2: cat2Key,
        date: date.format('YYYY-MM-DD'),
        note: note.trim(),
      })
      message.success('记账成功！')
      // 重置表单
      setAmount('')
      setNote('')
      setDate(dayjs())
      onSuccess()
    } catch {
      message.error('记账失败，请重试')
    }
  }

  const selectedCat1 = categories.find((c) => c.key === cat1Key)
  const cat2List: Category2[] = selectedCat1?.children || []

  // 确保 cat2 在列表中
  const cat2Valid = cat2List.some((c) => c.key === cat2Key)

  const handleCat1Change = (key: string) => {
    setCat1Key(key)
    const cat = categories.find((c) => c.key === key)
    if (cat && cat.children.length > 0) {
      setCat2Key(cat.children[0].key)
    }
  }

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ]

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>💸 记一笔</h2>
      </div>

      {/* 金额显示区域 */}
      <div className="amount-display">
        <span className="currency">¥</span>
        <span className="amount-value">{amount || '0'}</span>
        {amount && <span className="amount-clear" onClick={() => setAmount('')}>✕</span>}
      </div>

      {/* 分类选择 */}
      <div className="form-row" onClick={() => setShowCatPicker(true)}>
        <span className="form-label">分类</span>
        <span className="form-value">
          {getCategory1Name(cat1Key, categories)} / {cat2Valid ? getCategory2Name(cat1Key, cat2Key, categories) : '选择'}
        </span>
        <span className="form-arrow">›</span>
      </div>

      {/* 日期选择 */}
      <div className="form-row">
        <span className="form-label">日期</span>
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          maxDate={dayjs()}
          allowClear={false}
          variant="borderless"
          style={{ flex: 1, textAlign: 'right' }}
          placeholder=""
        />
      </div>

      {/* 备注 */}
      <div className="form-row">
        <span className="form-label">备注</span>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="选填"
          variant="borderless"
          maxLength={50}
          style={{ textAlign: 'right' }}
        />
      </div>

      {/* 确认按钮 */}
      <div className="submit-area">
        <Button
          type="primary"
          size="large"
          block
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
          style={{ height: 48, fontSize: 16, fontWeight: 600 }}
        >
          确认记账
        </Button>
      </div>

      {/* 自定义数字键盘 */}
      <div className="num-keyboard">
        {keys.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map((key) => (
              <div
                key={key}
                className={`key-btn ${key === 'backspace' ? 'key-func' : ''} ${key === '.' ? 'key-func' : ''}`}
                onClick={() => handleKeyPress(key)}
              >
                {key === 'backspace' ? '⌫' : key}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 分类选择弹窗 */}
      <Modal
        title="选择分类"
        open={showCatPicker}
        onCancel={() => setShowCatPicker(false)}
        footer={null}
        width={320}
        centered
      >
        <div className="cat-picker">
          <div className="cat1-list">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className={`cat1-item ${cat1Key === cat.key ? 'active' : ''}`}
                onClick={() => handleCat1Change(cat.key)}
              >
                {cat.icon} {cat.name}
              </div>
            ))}
          </div>
          <div className="cat2-list">
            {cat2List.map((cat) => (
              <div
                key={cat.key}
                className={`cat2-item ${cat2Key === cat.key ? 'active' : ''}`}
                onClick={() => {
                  setCat2Key(cat.key)
                  setShowCatPicker(false)
                }}
              >
                {cat.name}
              </div>
            ))}
            {cat2List.length === 0 && (
              <div className="empty-hint">请选择一级分类</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AddExpense
