import {useState, useEffect} from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({
                     value = '',
                     onChange,
                     onClear,
                     placeholder = 'Search...',
                     debounceMs = 300,
                     maxLength = 100,
                     loading = false,
                     resultCount = null,
                     resultLabel = 'result'
                   }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedInput = inputValue.trim();
      const trimmedValue = value.trim();

      if (trimmedInput !== trimmedValue) {
        onChange?.(trimmedInput);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, value, onChange, debounceMs]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    onClear?.();
  };

  const showResultCount = resultCount !== null && value.trim() && !loading;

  return (
    <div className={styles.searchBar}>
      <div className={styles.inputWrapper}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          maxLength={maxLength}
        />
        {inputValue && (
          <button className={styles.clearBtn} onClick={handleClear} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {showResultCount && (
        <span className={styles.results}>
          {resultCount} {resultCount === 1 ? resultLabel : `${resultLabel}s`} for "{value}"
        </span>
      )}
    </div>
  );
};

export default SearchBar;