import {useState, useEffect, useCallback, useMemo} from 'react';
import {useAuth} from '../../context/AuthContext';
import {reservationApi, participantApi, eventScheduleApi} from '../../services/api';
import styles from './DashboardOverview.module.css';

const DashboardOverview = () => {
  const {selectedCompany} = useAuth();
  const companyId = selectedCompany?.id;

  const [data, setData] = useState({
    reservations: [],
    participants: [],
    schedules: [],
  });

  const [loading, setLoading] = useState({
    initial: true,
    refreshing: false,
  });

  const [errors, setErrors] = useState({
    reservations: null,
    participants: null,
    schedules: null,
  });

  const [lastUpdated, setLastUpdated] = useState(null);

  const parseApiResponse = useCallback((response) => {
    if (!response?.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (response.data.items && Array.isArray(response.data.items)) return response.data.items;
    if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  }, []);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!companyId) return;

    try {
      setLoading(prev => ({
        ...prev,
        [isRefresh ? 'refreshing' : 'initial']: true,
      }));

      setErrors({reservations: null, participants: null, schedules: null});

      const results = await Promise.allSettled([
        reservationApi.getAll(companyId, {pageSize: 500}),
        participantApi.getAll(companyId, {pageSize: 500}),
        eventScheduleApi.getAll(companyId, {pageSize: 500}),
      ]);

      const newData = {reservations: [], participants: [], schedules: []};
      const newErrors = {reservations: null, participants: null, schedules: null};

      if (results[0].status === 'fulfilled') {
        newData.reservations = parseApiResponse(results[0].value);
      } else {
        newErrors.reservations = results[0].reason?.message || 'Failed to fetch reservations';
      }

      if (results[1].status === 'fulfilled') {
        newData.participants = parseApiResponse(results[1].value);
      } else {
        newErrors.participants = results[1].reason?.message || 'Failed to fetch participants';
      }

      if (results[2].status === 'fulfilled') {
        newData.schedules = parseApiResponse(results[2].value);
      } else {
        newErrors.schedules = results[2].reason?.message || 'Failed to fetch events';
      }

      setData(newData);
      setErrors(newErrors);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading({initial: false, refreshing: false});
    }
  }, [companyId, parseApiResponse]);

  useEffect(() => {
    if (companyId) {
      fetchDashboardData();
    } else {
      setLoading({initial: false, refreshing: false});
    }
  }, [companyId, fetchDashboardData]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const {reservations, participants, schedules} = data;

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

    const calculateRevenue = (reservationList) => {
      return reservationList.reduce((sum, r) => {
        const price = r.eventSchedule?.eventType?.price || r.eventType?.price || r.price || r.totalPrice || 0;
        const participantCount = r.participants?.length || r.participantCount || 1;
        return sum + (Number(price) * participantCount);
      }, 0);
    };

    const upcomingEvents = schedules.filter(s => {
      if (!s.startTime) return false;
      const startTime = new Date(s.startTime);
      return startTime >= now && s.status !== 'Cancelled';
    });

    const activeReservations = reservations.filter(r => r.status !== 'Cancelled');
    const paidReservations = activeReservations.filter(r => r.isPaid).length;
    const unpaidReservations = activeReservations.filter(r => !r.isPaid).length;

    return {
      currentMonthReservations: currentMonthReservations.length,
      previousMonthReservations: previousMonthReservations.length,
      currentMonthRevenue: calculateRevenue(currentMonthReservations),
      previousMonthRevenue: calculateRevenue(previousMonthReservations),
      totalParticipants: participants.length,
      upcomingEvents: upcomingEvents.length,
      paidReservations,
      unpaidReservations,
      upcomingSchedules: upcomingEvents
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 5),
      recentReservations: [...reservations]
        .filter(r => r.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    };
  }, [data]);

  const calculatePercentageChange = useCallback((current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  }, []);

  const formatTime = useCallback((date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getMonthName = useCallback((offset = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toLocaleDateString('en-US', {month: 'long'});
  }, []);

  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  const icons = useMemo(() => ({
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
    refresh: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    ),
    trendUp: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    trendDown: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
        <polyline points="17 18 23 18 23 12"/>
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
           strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  }), []);

  if (!companyId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{icons.building}</div>
          <h2 className={styles.emptyTitle}>No Company Selected</h2>
          <p className={styles.emptyMessage}>Please select a company to view dashboard statistics.</p>
        </div>
      </div>
    );
  }

  if (loading.initial) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  const hasAllErrors = errors.reservations && errors.participants && errors.schedules;
  if (hasAllErrors) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.errorIcon}>{icons.alertCircle}</div>
          <h2 className={styles.emptyTitle}>Something went wrong</h2>
          <p className={styles.emptyMessage}>Failed to load dashboard data. Please try again.</p>
          <button onClick={handleRefresh} className={styles.addBtn}>
            Try Again
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

  const totalPayments = stats.paidReservations + stats.unpaidReservations;
  const paidPercentage = totalPayments > 0 ? (stats.paidReservations / totalPayments) * 100 : 0;
  const unpaidPercentage = totalPayments > 0 ? (stats.unpaidReservations / totalPayments) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Dashboard</h1>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Updated at {formatTime(lastUpdated)}
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className={`${styles.refreshBtn} ${loading.refreshing ? styles.spinning : ''}`}
          disabled={loading.refreshing}
          title="Refresh data"
        >
          {icons.refresh}
        </button>
      </div>

      <div className={styles.content}>
        {(errors.reservations || errors.participants || errors.schedules) && (
          <div className={styles.errorNotices}>
            {errors.reservations && (
              <div className={styles.errorNotice}>
                <span className={styles.errorNoticeIcon}>{icons.alertCircle}</span>
                <span>Reservations: {errors.reservations}</span>
                <button onClick={() => setErrors(e => ({...e, reservations: null}))} className={styles.dismissBtn}>
                  Dismiss
                </button>
              </div>
            )}
            {errors.participants && (
              <div className={styles.errorNotice}>
                <span className={styles.errorNoticeIcon}>{icons.alertCircle}</span>
                <span>Participants: {errors.participants}</span>
                <button onClick={() => setErrors(e => ({...e, participants: null}))} className={styles.dismissBtn}>
                  Dismiss
                </button>
              </div>
            )}
            {errors.schedules && (
              <div className={styles.errorNotice}>
                <span className={styles.errorNoticeIcon}>{icons.alertCircle}</span>
                <span>Events: {errors.schedules}</span>
                <button onClick={() => setErrors(e => ({...e, schedules: null}))} className={styles.dismissBtn}>
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              {icons.calendar}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Reservations ({getMonthName()})</span>
              <span className={styles.statValue}>{stats.currentMonthReservations}</span>
              <div
                className={`${styles.statChange} ${parseFloat(reservationChange) >= 0 ? styles.positive : styles.negative}`}>
                <span className={styles.changeIcon}>
                  {parseFloat(reservationChange) >= 0 ? icons.trendUp : icons.trendDown}
                </span>
                <span>{Math.abs(reservationChange)}%</span>
                <span className={styles.vsText}>vs {getMonthName(-1)}</span>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              {icons.money}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Revenue ({getMonthName()})</span>
              <span className={styles.statValue}>{formatCurrency(stats.currentMonthRevenue)}</span>
              <div
                className={`${styles.statChange} ${parseFloat(revenueChange) >= 0 ? styles.positive : styles.negative}`}>
                <span className={styles.changeIcon}>
                  {parseFloat(revenueChange) >= 0 ? icons.trendUp : icons.trendDown}
                </span>
                <span>{Math.abs(revenueChange)}%</span>
                <span className={styles.vsText}>vs {getMonthName(-1)}</span>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
              {icons.users}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Participants</span>
              <span className={styles.statValue}>{stats.totalParticipants}</span>
              <span className={styles.statInfo}>Registered in system</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              {icons.clock}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Upcoming Events</span>
              <span className={styles.statValue}>{stats.upcomingEvents}</span>
              <span className={styles.statInfo}>Scheduled</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>{icons.creditCard}</div>
            <h3 className={styles.sectionTitle}>Payment Status</h3>
          </div>
          <div className={styles.paymentBars}>
            <div className={styles.paymentBar}>
              <div className={styles.paymentLabel}>
                <span className={`${styles.dot} ${styles.dotGreen}`}></span>
                <span>Paid</span>
              </div>
              <div className={styles.paymentProgress}>
                <div
                  className={`${styles.progressFill} ${styles.progressGreen}`}
                  style={{width: `${paidPercentage}%`}}
                />
              </div>
              <span className={styles.paymentCount}>{stats.paidReservations}</span>
            </div>
            <div className={styles.paymentBar}>
              <div className={styles.paymentLabel}>
                <span className={`${styles.dot} ${styles.dotOrange}`}></span>
                <span>Unpaid</span>
              </div>
              <div className={styles.paymentProgress}>
                <div
                  className={`${styles.progressFill} ${styles.progressOrange}`}
                  style={{width: `${unpaidPercentage}%`}}
                />
              </div>
              <span className={styles.paymentCount}>{stats.unpaidReservations}</span>
            </div>
          </div>
        </div>

        <div className={styles.columnsGrid}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>{icons.list}</div>
              <h3 className={styles.sectionTitle}>Recent Reservations</h3>
            </div>
            {stats.recentReservations.length > 0 ? (
              <ul className={styles.itemList}>
                {stats.recentReservations.map((reservation) => (
                  <li key={reservation.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>
                        {reservation.eventSchedule?.eventType?.name
                          || reservation.eventType?.name
                          || 'Event'}
                      </span>
                      <span className={styles.itemSubtitle}>
                        {reservation.participants?.length || reservation.participantCount || 0} participant(s)
                      </span>
                    </div>
                    <div className={styles.itemMeta}>
                      <span className={`${styles.statusBadge} ${styles[`status${(reservation.status || 'Pending')}`]}`}>
                        {reservation.status || 'Pending'}
                      </span>
                      <span className={styles.itemDate}>{formatDate(reservation.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noData}>
                <span>No reservations to display</span>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>{icons.clock}</div>
              <h3 className={styles.sectionTitle}>Upcoming Events</h3>
            </div>
            {stats.upcomingSchedules.length > 0 ? (
              <ul className={styles.itemList}>
                {stats.upcomingSchedules.map((schedule) => (
                  <li key={schedule.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>
                        {schedule.eventType?.name || schedule.name || 'Event'}
                      </span>
                      <span className={styles.itemSubtitle}>
                        <span className={styles.locationIcon}>{icons.mapPin}</span>
                        {schedule.placeName || schedule.location || 'No location'}
                      </span>
                    </div>
                    <div className={styles.itemMeta}>
                      <span className={`${styles.statusBadge} ${styles[`status${(schedule.status || 'Active')}`]}`}>
                        {schedule.status || 'Active'}
                      </span>
                      <span className={styles.itemDate}>{formatDate(schedule.startTime)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noData}>
                <span>No upcoming events</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;