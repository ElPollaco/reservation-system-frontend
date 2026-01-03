import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar/Navbar.jsx';
import DashboardOverview from '../../components/DashboardOverview/DashboardOverview.jsx';
import StaffMemberList from '../../components/StaffMemberList/StaffMemberList.jsx';
import ReservationList from '../../components/ReservationList/ReservationList.jsx';
import EventCalendar from '../../components/EventCalendar/index.js';
import EventTypeList from '../../components/EventTypeList/EventTypeList.jsx';
import ParticipantList from '../../components/ParticipantList/ParticipantList.jsx';
import SpecializationList from '../../components/SpecializationList/SpecializationList.jsx';
import CompanySettings from '../../components/CompanySettings/CompanySettings.jsx';
import './DashboardPage.css';

const DashboardPage = () => {
  const { isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const managerTabs = [
    {
      id: 'overview',
      label: 'Panel główny',
      icon: 'dashboard',
      component: DashboardOverview
    },
    {
      id: 'reservations',
      label: 'Rezerwacje',
      icon: 'calendar',
      component: ReservationList
    },
    {
      id: 'schedules',
      label: 'Harmonogram',
      icon: 'clock',
      component: EventCalendar
    },
    {
      id: 'eventTypes',
      label: 'Typy wydarzeń',
      icon: 'layers',
      component: EventTypeList
    },
    {
      id: 'participants',
      label: 'Uczestnicy',
      icon: 'users',
      component: ParticipantList
    },
    {
      id: 'staff',
      label: 'Personel',
      icon: 'user-plus',
      component: StaffMemberList
    },
    {
      id: 'specializations',
      label: 'Specjalizacje',
      icon: 'check-circle',
      component: SpecializationList
    },
    {
      id: 'settings',
      label: 'Ustawienia',
      icon: 'settings',
      component: CompanySettings
    },
  ];

  // ... reszta kodu bez zmian
  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
      calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      layers: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
      ),
      users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      'user-plus': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
      'check-circle': (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      settings: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    };
    return icons[iconName] || icons.dashboard;
  };

  const availableTabs = isManager() ? managerTabs : [];
  const ActiveComponent = availableTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-container">
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!sidebarCollapsed && <span className="sidebar-title">Menu</span>}
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Rozwiń menu' : 'Zwiń menu'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarCollapsed ? (
                  <polyline points="9 18 15 12 9 6"/>
                ) : (
                  <polyline points="15 18 9 12 15 6"/>
                )}
              </svg>
            </button>
          </div>

          <nav className="sidebar-nav">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                title={sidebarCollapsed ? tab.label : undefined}
              >
                <span className="nav-icon">{getIcon(tab.icon)}</span>
                {!sidebarCollapsed && <span className="nav-label">{tab.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <div className="dashboard-empty">
                <h2>Witaj w panelu!</h2>
                <p>Wybierz opcję z menu, aby rozpocząć.</p>
                {!isManager() && (
                  <p>Twoja rola nie ma jeszcze dostępu do funkcji zarządzania.</p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;