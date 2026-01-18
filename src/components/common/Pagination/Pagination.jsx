import styles from './Pagination.module.css';

const Pagination = ({
                      currentPage = 0,
                      totalPages = 1,
                      totalCount = 0,
                      pageSize = 10,
                      onPageChange,
                      maxVisiblePages = 5,
                      showInfo = true,
                      infoTemplate = 'Showing {start} - {end} of {total}'
                    }) => {
  if (totalCount === 0) return null;

  const getDisplayRange = () => {
    const start = currentPage * pageSize + 1;
    const end = Math.min((currentPage + 1) * pageSize, totalCount);
    return {start, end};
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(0, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      onPageChange?.(newPage);
    }
  };

  const {start, end} = getDisplayRange();
  const pageNumbers = getPageNumbers();

  const formatInfo = () => {
    return infoTemplate
      .replace('{start}', start)
      .replace('{end}', end)
      .replace('{total}', totalCount);
  };

  return (
    <div className={styles.footer}>
      {showInfo && (
        <div className={styles.info}>
          {formatInfo()}
        </div>
      )}

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.navBtn}`}
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0}
          title="First page"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="11 17 6 12 11 7"></polyline>
            <polyline points="18 17 13 12 18 7"></polyline>
          </svg>
        </button>

        <button
          className={`${styles.btn} ${styles.navBtn}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          title="Previous page"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className={styles.pages}>
          {pageNumbers[0] > 0 && (
            <>
              <button
                className={styles.btn}
                onClick={() => handlePageChange(0)}
                type="button"
              >
                1
              </button>
              {pageNumbers[0] > 1 && (
                <span className={styles.ellipsis}>...</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              className={`${styles.btn} ${currentPage === pageNum ? styles.active : ''}`}
              onClick={() => handlePageChange(pageNum)}
              type="button"
            >
              {pageNum + 1}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                <span className={styles.ellipsis}>...</span>
              )}
              <button
                className={styles.btn}
                onClick={() => handlePageChange(totalPages - 1)}
                type="button"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className={`${styles.btn} ${styles.navBtn}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          title="Next page"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <button
          className={`${styles.btn} ${styles.navBtn}`}
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          title="Last page"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
          </svg>
        </button>
      </div>

      {showInfo && <div className={styles.spacer}></div>}
    </div>
  );
};

export default Pagination;