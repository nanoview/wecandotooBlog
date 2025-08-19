import { useEffect, useState } from 'react';

interface DeferredComponentProps {
  children: React.ReactNode;
  delay?: number;
  priority?: 'high' | 'low' | 'idle';
}

const DeferredComponent = ({ 
  children, 
  delay = 100, 
  priority = 'low' 
}: DeferredComponentProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const loadComponent = () => {
      setShouldRender(true);
    };

    switch (priority) {
      case 'high':
        // Load immediately after main thread is free
        setTimeout(loadComponent, 0);
        break;
      case 'idle':
        // Use requestIdleCallback if available, fallback to setTimeout
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadComponent);
        } else {
          setTimeout(loadComponent, delay * 2);
        }
        break;
      default:
        // Default delay
        setTimeout(loadComponent, delay);
    }
  }, [delay, priority]);

  return shouldRender ? <>{children}</> : null;
};

export default DeferredComponent;
