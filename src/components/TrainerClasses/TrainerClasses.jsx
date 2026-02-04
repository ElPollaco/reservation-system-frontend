// WYPADA DODAĆ JESZCZE POLA EDYCJI I USUWANIA, ALE CHYBA NIE ZDĄŻĘ

import { useEffect, useState } from "react";
import { staffMemberApi } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./TrainerClasses.module.css";

const TrainerClasses = () => {
  const { selectedCompany, staffMember } = useAuth();

  const [eventSchedules, setEventSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = selectedCompany?.id;
  const staffMemberId = staffMember?.id;

  const fetchData = async () => {
    if (!companyId || !staffMemberId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const schedulesRes = await staffMemberApi.getEventSchedules(
        companyId,
        staffMemberId
      );

      setEventSchedules(schedulesRes.data?.items || schedulesRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, staffMemberId]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading classes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h4 className={styles.emptyTitle}>Error</h4>
          <p className={styles.emptyMessage}>{error}</p>
          <button className={styles.emptyAction} onClick={fetchData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Trainer Classes</h3>

          {eventSchedules.length > 0 && (
            <span className={styles.specCount}>
              {eventSchedules.length}{" "}
              {eventSchedules.length === 1 ? "class" : "classes"}
            </span>
          )}
        </div>
      </div>

      <div className={styles.contentArea}>
        {eventSchedules.length === 0 ? (
          <div className={styles.emptyState}>
            <h4 className={styles.emptyTitle}>No classes scheduled</h4>
            <p className={styles.emptyMessage}>
              You currently have no assigned event schedules.
            </p>
          </div>
        ) : (
          <div className={styles.specGrid}>
            {eventSchedules.map((ev) => (
              <div key={ev.id} className={styles.specCard}>
                <div className={styles.specCardHeader}>
                  <div className={styles.specIcon}>📅</div>
                </div>

                <h4 className={styles.specName}>
                  {ev.eventType?.name || "Class"}
                </h4>

                <p className={styles.specDescription}>
                  <strong>Start:</strong> {formatDateTime(ev.startTime)}
                </p>

                <p className={styles.specDescription}>
                  <strong>End:</strong> {formatDateTime(ev.endTime)}
                </p>

                <p className={styles.specDescription}>
                  <strong>Place:</strong> {ev.placeName || "-"}
                </p>

                <p className={styles.specDescription}>
                  <strong>Status:</strong> {ev.status || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerClasses;