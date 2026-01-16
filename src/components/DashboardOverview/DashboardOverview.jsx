import {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import {reservationApi, participantApi, eventScheduleApi} from '../../services/api';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const {selectedCompany} = useAuth();
  const companyId = selectedCompany?.id;

  const [stats, setStats] = useState({
    currentMonthReservations: 0,
    previousMonthReservations: 0,
    currentMonthRevenue: 0,
    previousMonthRevenue: 0,
    totalParticipants: 0,
    upcomingEvents: 0,
    paidReservations: 0,
    unpaidReservations: 0,
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (companyId) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [companyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      let reservations = [];
      let participants = [];
      let schedules = [];

      try {
        const reservationsRes = await reservationApi.getAll(companyId, {pageSize: 1000});
        reservations = reservationsRes.data?.items || reservationsRes.data || [];
      } catch (err) {
        console.error('Error fetching reservations:', err);
      }

      try {
        const participantsRes = await participantApi.getAll(companyId, {pageSize: 1000});
        participants = participantsRes.data?.items || participantsRes.data || [];
      } catch (err) {
        console.error('Error fetching participants:', err);
      }

      try {
        const schedulesRes = await eventScheduleApi.getAll(companyId, {pageSize: 1000});
        schedules = schedulesRes.data?.items || schedulesRes.data || [];
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }

      if (!Array.isArray(reservations)) reservations = [];
      if (!Array.isArray(participants)) participants = [];
      if (!Array.isArray(schedules)) schedules = [];

      const currentMonthReservations = reservations.filter(r => {
        if (!r.createdAt) return false;
        const createdAt = new Date(r.createdAt);
        return createdAt >= currentMonthStart && createdAt <= now;
      });

      const previousMonthReservations = reservations.filter(r => {
        if (!r.createdAt) return false;
        const createdAt = new Date(r.createdAt);
        return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
      });

      const currentMonthRevenue = currentMonthReservations.reduce((sum, r) => {
        const price = r.eventSchedule?.eventType?.price || 0;
        const participantCount = r.participants?.length || 1;
        return sum + (price * participantCount);
      }, 0);

      const previousMonthRevenue = previousMonthReservations.reduce((sum, r) => {
        const price = r.eventSchedule?.eventType?.price || 0;
        const participantCount = r.participants?.length || 1;
        return sum + (price * participantCount);
      }, 0);

      const upcomingEvents = schedules.filter(s => {
        if (!s.startTime) return false;
        const startTime = new Date(s.startTime);
        return startTime >= now && s.status !== 'Cancelled';
      });

      const paidReservations = reservations.filter(r => r.isPaid).length;
      const unpaidReservations = reservations.filter(r => !r.isPaid && r.status !== 'Cancelled').length;

      setStats({
        currentMonthReservations: currentMonthReservations.length,
        previousMonthReservations: previousMonthReservations.length,
        currentMonthRevenue,
        previousMonthRevenue,
        totalParticipants: participants.length,
        upcomingEvents: upcomingEvents.length,
        paidReservations,
        unpaidReservations,
      });

      const sortedReservations = [...reservations]
        .filter(r => r.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentReservations(sortedReservations);

      const sortedSchedules = upcomingEvents
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 5);
      setUpcomingSchedules(sortedSchedules);

      setLoading(false);

    } catch (err) {
      console.error('Error in fetchDashboardData:', err);
      setError(`Błąd: ${err.response?.data?.message || err.message || 'Nieznany błąd'}`);
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMonthName = (offset = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toLocaleDateString('pl-PL', {month: 'long'});
  };

  // Ikony SVG w tym samym stylu co menu
  const icons = {
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    money: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    creditCard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    list: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    mapPin: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    alertCircle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
        <path d="M10 6h4"/>
        <path d="M10 10h4"/>
        <path d="M10 14h4"/>
        <path d="M10 18h4"/>
      </svg>
    ),
  };

  if (!companyId) {
    return (
      <div className="dashboard-overview">
        <div className="overview-empty">
          <div className="empty-icon">{icons.building}</div>
          <h2>Brak wybranej firmy</h2>
          <p>Wybierz firmę, aby zobaczyć statystyki.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-overview">
        <div className="overview-loading">
          <div className="spinner"></div>
          <p>Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-overview">
        <div className="overview-error">
          <div className="error-icon">{icons.alertCircle}</div>
          <h2>Wystąpił problem</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn-retry">
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  const reservationChange = calculatePercentageChange(
    stats.currentMonthReservations,
    stats.previousMonthReservations
  );

  const revenueChange = calculatePercentageChange(
    stats.currentMonthRevenue,
    stats.previousMonthRevenue
  );

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h1>Panel Główny</h1>
        <p className="overview-subtitle">
          Podsumowanie aktywności firmy <strong>{selectedCompany?.name}</strong> w obecnym miesiącu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            {icons.calendar}
          </div>
          <div className="stat-content">
            <span className="stat-label">Rezerwacje ({getMonthName()})</span>
            <span className="stat-value">{stats.currentMonthReservations}</span>
            <div className={`stat-change ${parseFloat(reservationChange) >= 0 ? 'positive' : 'negative'}`}>
              <span>{parseFloat(reservationChange) >= 0 ? '↑' : '↓'} {Math.abs(reservationChange)}%</span>
              <span className="vs-text">vs {getMonthName(-1)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            {icons.money}
          </div>
          <div className="stat-content">
            <span className="stat-label">Przychód ({getMonthName()})</span>
            <span className="stat-value">{formatCurrency(stats.currentMonthRevenue)}</span>
            <div className={`stat-change ${parseFloat(revenueChange) >= 0 ? 'positive' : 'negative'}`}>
              <span>{parseFloat(revenueChange) >= 0 ? '↑' : '↓'} {Math.abs(revenueChange)}%</span>
              <span className="vs-text">vs {getMonthName(-1)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            {icons.users}
          </div>
          <div className="stat-content">
            <span className="stat-label">Wszyscy uczestnicy</span>
            <span className="stat-value">{stats.totalParticipants}</span>
            <div className="stat-info">Zarejestrowani w systemie</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">
            {icons.clock}
          </div>
          <div className="stat-content">
            <span className="stat-label">Nadchodzące wydarzenia</span>
            <span className="stat-value">{stats.upcomingEvents}</span>
            <div className="stat-info">Zaplanowanych</div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="payment-section">
        <div className="section-title">
          <span className="section-icon">{icons.creditCard}</span>
          <h3>Status płatności</h3>
        </div>
        <div className="payment-bars">
          <div className="payment-bar">
            <div className="payment-label">
              <span className="dot dot-green"></span>
              <span>Opłacone</span>
            </div>
            <div className="payment-progress">
              <div
                className="progress-fill progress-green"
                style={{
                  width: `${stats.paidReservations + stats.unpaidReservations > 0
                    ? (stats.paidReservations / (stats.paidReservations + stats.unpaidReservations)) * 100
                    : 0}%`
                }}
              />
            </div>
            <span className="payment-count">{stats.paidReservations}</span>
          </div>
          <div className="payment-bar">
            <div className="payment-label">
              <span className="dot dot-orange"></span>
              <span>Nieopłacone</span>
            </div>
            <div className="payment-progress">
              <div
                className="progress-fill progress-orange"
                style={{
                  width: `${stats.paidReservations + stats.unpaidReservations > 0
                    ? (stats.unpaidReservations / (stats.paidReservations + stats.unpaidReservations)) * 100
                    : 0}%`
                }}
              />
            </div>
            <span className="payment-count">{stats.unpaidReservations}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="overview-columns">
        <div className="overview-card">
          <div className="section-title">
            <span className="section-icon">{icons.list}</span>
            <h3>Ostatnie rezerwacje</h3>
          </div>
          {recentReservations.length > 0 ? (
            <ul className="item-list">
              {recentReservations.map((reservation) => (
                <li key={reservation.id} className="item-row">
                  <div className="item-info">
                    <span className="item-title">
                      {reservation.eventSchedule?.eventType?.name || 'Wydarzenie'}
                    </span>
                    <span className="item-subtitle">
                      {reservation.participants?.length || 0} uczestnik(ów)
                    </span>
                  </div>
                  <div className="item-meta">
                    <span className={`badge badge-${(reservation.status || 'pending').toLowerCase()}`}>
                      {reservation.status || 'Pending'}
                    </span>
                    <span className="item-date">{formatDate(reservation.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Brak rezerwacji do wyświetlenia</p>
          )}
        </div>

        <div className="overview-card">
          <div className="section-title">
            <span className="section-icon">{icons.clock}</span>
            <h3>Nadchodzące wydarzenia</h3>
          </div>
          {upcomingSchedules.length > 0 ? (
            <ul className="item-list">
              {upcomingSchedules.map((schedule) => (
                <li key={schedule.id} className="item-row">
                  <div className="item-info">
                    <span className="item-title">
                      {schedule.eventType?.name || 'Wydarzenie'}
                    </span>
                    <span className="item-subtitle">
                      <span className="location-icon">{icons.mapPin}</span>
                      {schedule.placeName}
                    </span>
                  </div>
                  <div className="item-meta">
                    <span className={`badge badge-${(schedule.status || 'active').toLowerCase()}`}>
                      {schedule.status || 'Active'}
                    </span>
                    <span className="item-date">{formatDate(schedule.startTime)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Brak nadchodzących wydarzeń</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;