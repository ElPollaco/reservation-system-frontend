import {useState} from 'react';
import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar/Navbar.jsx';
import DashboardOverview from '../../components/DashboardOverview/DashboardOverview.jsx';
import StaffMemberList from '../../components/StaffMemberList/StaffMemberList.jsx';
import ReservationList from '../../components/ReservationList/ReservationList.jsx';
import EventCalendar from '../../components/EventCalendar/EventCalendar.jsx';
import TrainerClassesCalendar from '../../components/TrainerClassesCalendar/TrainerClassesCalendar.jsx';
import AvailabilityCalendar from '../../components/AvailabilityCalendar/AvailabilityCalendar.jsx';
import EventTypeList from '../../components/EventTypeList/EventTypeList.jsx';
import ParticipantList from '../../components/ParticipantList/ParticipantList.jsx';
import SpecializationList from '../../components/SpecializationList/SpecializationList.jsx';
import CompanySettings from '../../components/CompanySettings/CompanySettings.jsx';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const {isManager, isTrainer, isReceptionEmployee} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const managerTabs = [
    {
      id: 'overview',
      path: '/dashboard/overview',
      label: 'Dashboard',
      icon: 'dashboard',
      component: DashboardOverview
    },
    {
      id: 'reservations',
      path: '/dashboard/reservations',
      label: 'Reservations',
      icon: 'calendar',
      component: ReservationList
    },
    {
      id: 'schedules',
      path: '/dashboard/schedules',
      label: 'Schedule',
      icon: 'clock',
      component: EventCalendar
    },
    {
      id: 'eventTypes',
      path: '/dashboard/eventTypes',
      label: 'Event Types',
      icon: 'layers',
      component: EventTypeList
    },
    {
      id: 'participants',
      path: '/dashboard/participants',
      label: 'Participants',
      icon: 'users',
      component: ParticipantList
    },
    {
      id: 'staff',
      path: '/dashboard/staff',
      label: 'Staff',
      icon: 'user-plus',
      component: StaffMemberList
    },
    {
      id: 'specializations',
      path: '/dashboard/specializations',
      label: 'Specializations',
      icon: 'check-circle',
      component: SpecializationList
    },
    {
      id: 'settings',
      path: '/dashboard/settings',
      label: 'Settings',
      icon: 'settings',
      component: CompanySettings
    },
  ];

  const trainerTabs = [
    {
      id: 'classes',
      path: '/dashboard/classes',
      label: 'Classes',
      icon: 'calendar',
      component: TrainerClassesCalendar
    },
    {
      id: 'availability',
      path: '/dashboard/availability',
      label: 'Availability',
      icon: 'availability',
      component: AvailabilityCalendar
    },
    {
      id: 'eventTypes',
      path: '/dashboard/eventTypes',
      label: 'Event Types',
      icon: 'layers',
      component: EventTypeList
    },
    {
      id: 'specializations',
      path: '/dashboard/specializations',
      label: 'Specializations',
      icon: 'check-circle',
      component: SpecializationList
    },
    {
      id: 'settings',
      path: '/dashboard/settings',
      label: 'Settings',
      icon: 'settings',
      component: CompanySettings
    },
  ];

  const receptionEmployeeTabs = [
    {
      id: 'reservations',
      path: '/dashboard/reservations',
      label: 'Reservations',
      icon: 'calendar',
      component: ReservationList
    },
    {
      id: 'schedules',
      path: '/dashboard/schedules',
      label: 'Schedule',
      icon: 'clock',
      component: EventCalendar
    },
    {
      id: 'eventTypes',
      path: '/dashboard/eventTypes',
      label: 'Event Types',
      icon: 'layers',
      component: EventTypeList
    },
    {
      id: 'participants',
      path: '/dashboard/participants',
      label: 'Participants',
      icon: 'users',
      component: ParticipantList
    },
    {
      id: 'specializations',
      path: '/dashboard/specializations',
      label: 'Specializations',
      icon: 'check-circle',
      component: SpecializationList
    },
    {
      id: 'settings',
      path: '/dashboard/settings',
      label: 'Settings',
      icon: 'settings',
      component: CompanySettings
    },
  ];

  const getCurrentRole = () => {
    if (isManager() === true) return managerTabs;
    if (isTrainer() === true) return trainerTabs;
    if (isReceptionEmployee() === true) return receptionEmployeeTabs;
    return [];
  };

  const availableTabs = getCurrentRole();

  const getActiveTab = () => {
    const currentPath = location.pathname;

    const exactMatch = availableTabs.find(tab => tab.path === currentPath);
    if (exactMatch)
      return exactMatch.id;

    const partialMatch = availableTabs.find(tab =>
      tab.path !== '/dashboard' && currentPath.startsWith(tab.path)
    );

    if (partialMatch)
      return partialMatch.id;

    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

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
      availability: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6,2 Q12,4 18,2 L20,2 Q22,4 16,12 Q22,22 20,22 L18,22 12,20 Q6,22 4,22, Q4,20 8,12 Q2,2  6,2 Z" />
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
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    };
    return icons[iconName] || icons.dashboard;
  };

  const NonManagerView = () => (
    <div className={styles['dashboard-empty']}>
      <h2>Welcome to the panel!</h2>
      <p>Select an option from the menu to get started</p>
      <p>Your role does not yet have access to management features</p>
    </div>
  );

  return (
    <div className={styles['dashboard-layout']}>
      <Navbar/>

      <div className={styles['dashboard-container']}>
        <aside className={`${styles['dashboard-sidebar']} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          <div className={styles['sidebar-header']}>
            {!sidebarCollapsed && <span className={styles['sidebar-title']}>Menu</span>}
            <button
              className={styles['sidebar-toggle']}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarCollapsed ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
          </div>

          <nav className={styles['sidebar-nav']}>
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`${styles['sidebar-nav-item']} ${activeTab === tab.id ? styles.active : ''}`}
                title={sidebarCollapsed ? tab.label : undefined}
              >
                <span className={styles['nav-icon']}>{getIcon(tab.icon)}</span>
                {!sidebarCollapsed && <span className={styles['nav-label']}>{tab.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles['dashboard-main']}>
          <div className={styles['dashboard-content']}>
            {isManager() ? (
              <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="overview" element={<DashboardOverview />} />
                <Route path="reservations" element={<ReservationList />} />
                <Route path="schedules" element={<EventCalendar />} />
                <Route path="eventTypes" element={<EventTypeList />} />
                <Route path="participants" element={<ParticipantList />} />
                <Route path="staff" element={<StaffMemberList />} />
                <Route path="specializations" element={<SpecializationList />} />
                <Route path="settings" element={<CompanySettings />} />
                <Route
                  path="*"
                  element={
                    <div className={styles['dashboard-empty']}>
                      <h2>Page Not Found</h2>
                      <p>Please choose an option from the menu</p>
                    </div>
                  }
                />
              </Routes>
            ) : isTrainer() ? (
              <Routes>
                <Route index element={<TrainerClassesCalendar />} />
                <Route path="classes" element={<TrainerClassesCalendar />}/>
                <Route path="availability" element={<AvailabilityCalendar />}/>
                <Route path="eventTypes" element={<EventTypeList />} />
                <Route path="specializations" element={<SpecializationList />} />
                <Route path="settings" element={<CompanySettings />} />
                <Route
                  path="*"
                  element={
                    <div className={styles['dashboard-empty']}>
                      <h2>Page Not Found</h2>
                      <p>Please choose an option from the menu</p>
                    </div>
                  }
                />
              </Routes>
            ): isReceptionEmployee() ? (
              <Routes>
                <Route index element={<ReservationList />} />
                <Route path="reservations" element={<ReservationList />} />
                <Route path="schedules" element={<EventCalendar />} />
                <Route path="eventTypes" element={<EventTypeList />} />
                <Route path="participants" element={<ParticipantList />} />
                <Route path="specializations" element={<SpecializationList />} />
                <Route path="settings" element={<CompanySettings />} />
              </Routes>
            ) : (
              // eslint-disable-next-line react-hooks/static-components
              <NonManagerView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;