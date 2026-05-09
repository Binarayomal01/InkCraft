import React from 'react';

const Alert = ({
  type = 'info',
  title = null,
  children,
  onClose = null,
  className = ''
}) => {
  const typeClasses = {
    success: {
      container: 'bg-green-900/20 border border-green-700/50 backdrop-blur-sm',
      icon: 'text-green-400',
      title: 'text-green-300',
      text: 'text-green-200',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    error: {
      container: 'bg-red-900/20 border border-red-700/50 backdrop-blur-sm',
      icon: 'text-red-400',
      title: 'text-red-300',
      text: 'text-red-200',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    warning: {
      container: 'bg-yellow-900/20 border border-yellow-700/50 backdrop-blur-sm',
      icon: 'text-yellow-400',
      title: 'text-yellow-300',
      text: 'text-yellow-200',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z'
    },
    info: {
      container: 'bg-neon-900/20 border border-neon-700/50 backdrop-blur-sm',
      icon: 'text-neon-400',
      title: 'text-neon-300',
      text: 'text-neon-200',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  const styles = typeClasses[type];

  return (
    <div className={`rounded-md p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className={`h-5 w-5 ${styles.icon}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={styles.iconPath} 
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          
          <div className={`${title ? 'mt-2' : ''} text-sm ${styles.text}`}>
            {children}
          </div>
        </div>
        
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`
                  inline-flex rounded-md p-1.5 
                  ${styles.icon} 
                  hover:bg-opacity-20 
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${type === 'success' ? 'hover:bg-green-200 focus:ring-green-600' : ''}
                  ${type === 'error' ? 'hover:bg-red-200 focus:ring-red-600' : ''}
                  ${type === 'warning' ? 'hover:bg-yellow-200 focus:ring-yellow-600' : ''}
                  ${type === 'info' ? 'hover:bg-blue-200 focus:ring-blue-600' : ''}
                `}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;