import { useState, useEffect, memo } from 'react'
import { List, Modal, message, Button, Input } from 'antd'
import { DeleteOutlined, ExportOutlined, PlusOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'
import { db, loadCategories, saveCategories, countExpensesByCategory1, countExpensesByCategory2, markPreset } from '../db'
import { defaultCategories, emojiOptions, generateKey } from '../data/categories'
import type { Category1, Category2 } from '../types'

// emoji 图标选择器（memo 避免输入时重新渲染）
const EmojiPicker = memo<{ selected: string; onChange: (emoji: string) => void }>(
  ({ selected, onChange }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8, fontSize: 13, color: '#666' }}>选择图标</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {emojiOptions.map((emoji) => (
          <span
            key={emoji}
            onClick={() => onChange(emoji)}
            style={{
              fontSize: 22,
              padding: 4,
              cursor: 'pointer',
              borderRadius: 6,
              background: selected === emoji ? '#fff2f0' : 'transparent',
              border: selected === emoji ? '2px solid #ff6b6b' : '2px solid transparent',
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  )
)

function Settings() {
  const [count, setCount] = useState(0)
  const [showAbout, setShowAbout] = useState(false)
  const [categories, setCategories] = useState<Category1[]>([])
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{
    type: 'cat1' | 'cat2'
    mode: 'add' | 'edit'
    cat1Key?: string      // 所属一级分类（编辑二级时用）
    oldKey?: string        // 编辑时的原 key
    name: string
    icon: string
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const cats = await loadCategories()
    setCategories(cats)
    db.expenses.count().then(setCount)
  }

  // 打开添加/编辑弹窗
  const openModal = (
    type: 'cat1' | 'cat2',
    mode: 'add' | 'edit',
    opts?: { cat1Key?: string; oldKey?: string; name?: string; icon?: string }
  ) => {
    setEditModal({
      type,
      mode,
      cat1Key: opts?.cat1Key,
      oldKey: opts?.oldKey,
      name: opts?.name || '',
      icon: opts?.icon || '🍜',
    })
  }

  // 保存分类编辑
  const handleSave = async () => {
    if (!editModal) return
    const { type, mode, cat1Key, oldKey, name, icon } = editModal
    if (!name.trim()) {
      message.warning('请输入分类名称')
      return
    }

    const newCats = structuredClone(categories)

    if (type === 'cat1') {
      if (mode === 'add') {
        const key = generateKey()
        newCats.push({ key, name: name.trim(), icon, children: [], isPreset: false })
      } else if (mode === 'edit' && oldKey) {
        const cat = newCats.find((c) => c.key === oldKey)
        if (cat) {
          cat.name = name.trim()
          cat.icon = icon
        }
      }
    } else if (type === 'cat2' && cat1Key) {
      const parent = newCats.find((c) => c.key === cat1Key)
      if (parent) {
        if (mode === 'add') {
          const key = generateKey()
          parent.children.push({ key, name: name.trim(), isPreset: false })
        } else if (mode === 'edit' && oldKey) {
          const child = parent.children.find((c) => c.key === oldKey)
          if (child) {
            child.name = name.trim()
          }
        }
      }
    }

    try {
      await saveCategories(newCats)
      setCategories(newCats)
      setEditModal(null)
      message.success(mode === 'add' ? '已添加' : '已修改')
    } catch {
      message.error('保存失败，请重试')
    }
  }

  // 通用的删除确认 + 执行逻辑
  const confirmDelete = (
    title: string,
    content: string,
    doDelete: () => Promise<Category1[]>
  ) => {
    Modal.confirm({
      title,
      content,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const newCats = await doDelete()
          await saveCategories(newCats)
          setCategories(newCats)
          message.success('已删除')
        } catch {
          message.error('删除失败，请重试')
        }
      },
    })
  }

  // 删除一级分类
  const handleDeleteCat1 = async (cat: Category1) => {
    const refCount = await countExpensesByCategory1(cat.key)
    const title = refCount > 0 ? '该分类下有记账记录' : '确认删除'
    const content = refCount > 0
      ? `"${cat.name}" 下共有 ${refCount} 条记账记录。删除后这些记录的分类将显示为"未知分类"，确定删除吗？`
      : `确定删除一级分类"${cat.name}"及其所有子分类吗？此操作不可撤销。`
    confirmDelete(title, content, async () => {
      const newCats = categories.filter((c) => c.key !== cat.key)
      if (expandedKey === cat.key) setExpandedKey(null)
      return newCats
    })
  }

  // 删除二级分类
  const handleDeleteCat2 = async (parentKey: string, child: Category2) => {
    const refCount = await countExpensesByCategory2(parentKey, child.key)
    const title = refCount > 0 ? '该分类下有记账记录' : '确认删除'
    const content = refCount > 0
      ? `"${child.name}" 下共有 ${refCount} 条记账记录。删除后这些记录的分类将显示为"未知"，确定删除吗？`
      : `确定删除子分类"${child.name}"吗？此操作不可撤销。`
    confirmDelete(title, content, async () => {
      return categories.map((c) => {
        if (c.key === parentKey) {
          return { ...c, children: c.children.filter((s) => s.key !== child.key) }
        }
        return c
      })
    })
  }

  // 恢复默认分类
  const handleRestore = () => {
    Modal.confirm({
      title: '恢复默认分类',
      content: '此操作将用预设分类替换当前所有分类，您自定义的分类将丢失。确定恢复吗？',
      okText: '确认恢复',
      cancelText: '取消',
      onOk: async () => {
        const restored = markPreset(defaultCategories)
        await saveCategories(restored)
        setCategories(restored)
        setExpandedKey(null)
        message.success('已恢复为默认分类')
      },
    })
  }

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

      {/* ===== 分类管理 ===== */}
      <div className="settings-section">
        <div className="section-header">
          <span>分类管理</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRestore}
            >
              恢复默认
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => openModal('cat1', 'add')}
            >
              添加大类
            </Button>
          </span>
        </div>

        <div className="cat-mgmt-list">
          {categories.map((cat) => (
            <div key={cat.key} className="cat-mgmt-group">
              <div
                className="cat-mgmt-cat1"
                onClick={() => setExpandedKey(expandedKey === cat.key ? null : cat.key)}
              >
                <span className="cat-mgmt-icon">{cat.icon}</span>
                <span className="cat-mgmt-name">{cat.name}</span>
                <span className="cat-mgmt-count">{cat.children.length} 个子类</span>
                <span className="cat-mgmt-arrow">{expandedKey === cat.key ? '▾' : '▸'}</span>
                <span className="cat-mgmt-actions" onClick={(e) => e.stopPropagation()}>
                  {!cat.isPreset && (
                    <Button
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openModal('cat1', 'edit', { oldKey: cat.key, name: cat.name, icon: cat.icon })}
                    />
                  )}
                  {!cat.isPreset && (
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteCat1(cat)}
                    />
                  )}
                  <Button
                    size="small"
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => openModal('cat2', 'add', { cat1Key: cat.key })}
                  />
                </span>
              </div>
              {expandedKey === cat.key && (
                <div className="cat-mgmt-cat2-list">
                  {cat.children.length === 0 ? (
                    <div className="cat-mgmt-empty">暂无子类，点击 + 添加</div>
                  ) : (
                    cat.children.map((child) => (
                      <div key={child.key} className="cat-mgmt-cat2">
                        <span className="cat-mgmt-cat2-name">{child.name}</span>
                        <span className="cat-mgmt-actions">
                          {!child.isPreset && (
                            <>
                              <Button
                                size="small"
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() =>
                                  openModal('cat2', 'edit', {
                                    cat1Key: cat.key,
                                    oldKey: child.key,
                                    name: child.name,
                                  })
                                }
                              />
                              <Button
                                size="small"
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteCat2(cat.key, child)}
                              />
                            </>
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
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

      {/* 分类编辑弹窗 */}
      <Modal
        title={
          editModal
            ? `${editModal.mode === 'add' ? '添加' : '编辑'}${editModal.type === 'cat1' ? '一级分类' : '二级分类'}`
            : ''
        }
        open={!!editModal}
        onOk={handleSave}
        onCancel={() => setEditModal(null)}
        okText="保存"
        cancelText="取消"
        centered
      >
        {editModal && (
          <div style={{ padding: '8px 0' }}>
            {editModal.type === 'cat1' && (
              <EmojiPicker
                selected={editModal.icon}
                onChange={(emoji) => setEditModal({ ...editModal, icon: emoji })}
              />
            )}
            <div style={{ marginBottom: 8, fontSize: 13, color: '#666' }}>分类名称</div>
            <Input
              value={editModal.name}
              onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
              placeholder={editModal.type === 'cat1' ? '例如：养车费用' : '例如：洗车'}
              maxLength={10}
              autoFocus
            />
          </div>
        )}
      </Modal>

      {/* 关于弹窗 */}
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
