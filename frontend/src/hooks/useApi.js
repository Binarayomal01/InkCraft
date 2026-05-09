import { useState, useEffect } from 'react';
import { handleApiError } from '../utils/api';

// Hook for API calls with loading, error, and success states
export const useApi = (apiFunction, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const execute = async (...args) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // If first arg is a function and apiFunction is not set, use first arg as apiFunction
      const fn = typeof args[0] === 'function' && !apiFunction ? args[0] : apiFunction;
      const fnArgs = typeof args[0] === 'function' && !apiFunction ? args.slice(1) : args;
      
      if (!fn || typeof fn !== 'function') {
        throw new Error('No API function provided');
      }
      
      const response = await fn(...fnArgs);
      setData(response.data);
      setSuccess(true);
      return { success: true, data: response.data };
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message); // Extract just the message string
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (immediate && apiFunction) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    success,
    execute,
    request: execute, // alias for backward compatibility
    reset,
    clearError
  };
};

// Hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialPage = 1, initialLimit = 10) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (page = initialPage, limit = initialLimit, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction({
        page,
        limit,
        ...params
      });

      setData(response.data.data || response.data);
      setPagination(response.data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: response.data.data?.length || 0,
        hasNext: false,
        hasPrev: false
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message); // Extract just the message string
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    fetchData(page);
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrev) {
      goToPage(pagination.currentPage - 1);
    }
  };

  const reset = () => {
    setData([]);
    setPagination({
      currentPage: initialPage,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false
    });
    setError(null);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    fetchData,
    goToPage,
    nextPage,
    prevPage,
    reset
  };
};

// Hook for search functionality with debounce
export const useSearch = (apiFunction, delay = 500) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction({ search: query });
        setResults(response.data.data || response.data);
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message); // Extract just the message string
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, apiFunction, delay]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([])
  };
};

// Hook for local storage state management
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Hook for managing async operations
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      setValue(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    execute,
    status,
    value,
    error,
    pending: status === 'pending',
    success: status === 'success',
    failed: status === 'error'
  };
};

// Hook for handling click outside
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Hook for scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};