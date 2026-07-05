type TabKey = 'dashboard' | 'add' | 'statistics' | 'bills' | 'settings'

export function useNavigate(onNavigate: (tab: TabKey) => void) {
  return (tab: TabKey) => onNavigate(tab)
}
