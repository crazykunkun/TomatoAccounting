import { useState, useEffect } from 'react'
import { List, Modal, message } from 'antd'
import { DeleteOutlined, ExportOutlined } from '@ant-design/icons'
import { db } from '../db'
import { categories as defaultCategories } from '../data/categories'
import type { Category1 } from '../types'

function Settings() {
  const [count, setCount] = useState(0)
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => {
    db.expenses.count().then(setCount)
  }, [])

  // 导出数据为 JSON
  const handleExport = async () => {
    const data = await db.expenses.toArray()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `番茄记账_备份_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    message.success('数据已导出')
  }

  // 清除所有数据
  const handleClear = () => {
    Modal.confirm({
      title: '确认清除',
      content: '此操作将删除所有记账数据，且无法恢复。建议先导出备份。',
      okText: '确认清除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await db.expenses.clear()
        setCount(0)
        message.success('数据已清除')
      },
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>👤 我的</h2>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <span>数据管理</span>
        </div>
        <List>
          <List.Item
            extra={<span style={{ color: '#999' }}>共 {count} 条</span>}
          >
            <List.Item.Meta
              title="记账记录"
              description="当前数据库中的记录总数"
            />
          </List.Item>
          <List.Item
            onClick={handleExport}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              avatar={<ExportOutlined style={{ fontSize: 18, color: '#4dabf7' }} />}
              title="导出数据"
              description="导出为 JSON 文件备份"
            />
          </List.Item>
          <List.Item
            onClick={handleClear}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              avatar={<DeleteOutlined style={{ fontSize: 18, color: '#ff6b6b' }} />}
              title={<span style={{ color: '#ff6b6b' }}>清除所有数据</span>}
              description="删除所有记账记录（不可恢复）"
            />
          </List.Item>
        </List>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <span>预设分类</span>
        </div>
        <List size="small">
          {defaultCategories.map((cat: Category1) => (
            <List.Item key={cat.key}>
              <span>{cat.icon} {cat.name}</span>
              <span style={{ color: '#999', fontSize: 12 }}>
                {cat.children.map(c => c.name).join(' · ')}
              </span>
            </List.Item>
          ))}
        </List>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <span>关于</span>
        </div>
        <List>
          <List.Item onClick={() => setShowAbout(true)} style={{ cursor: 'pointer' }}>
            <List.Item.Meta
              title="关于番茄记账"
              description="版本 1.0.0"
            />
          </List.Item>
        </List>
      </div>

      <Modal
        title="关于番茄记账"
        open={showAbout}
        onCancel={() => setShowAbout(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍅</div>
          <h3>番茄记账</h3>
          <p style={{ color: '#999' }}>版本 1.0.0</p>
          <p style={{ color: '#666', marginTop: 8 }}>
            简洁好用的个人记账工具
          </p>
          <p style={{ color: '#999', fontSize: 12, marginTop: 16 }}>
            技术栈：Electron + React + TypeScript + Ant Design
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
