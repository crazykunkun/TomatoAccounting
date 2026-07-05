import { useState } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import Statistics from './pages/Statistics'
import Bills from './pages/Bills'
import Settings from './pages/Settings'
import './App.css'

type TabKey = 'dashboard' | 'add' | 'statistics' | 'bills' | 'settings'

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: '总览', icon: '💰' },
  { key: 'add', label: '记账', icon: '💸' },
  { key: 'statistics', label: '统计', icon: '📊' },
  { key: 'bills', label: '账单', icon: '📋' },
  { key: 'settings', label: '我的', icon: '👤' },
]

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />
      case 'add':
        return <AddExpense onSuccess={() => setActiveTab('dashboard')} />
      case 'statistics':
        return <Statistics />
      case 'bills':
        return <Bills />
      case 'settings':
        return <Settings />
    }
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="app">
        <div className="app-content">{renderPage()}</div>
        <div className="bottom-nav">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ConfigProvider>
  )
}

export default App
