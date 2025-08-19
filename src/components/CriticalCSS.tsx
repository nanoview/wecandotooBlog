import { useEffect } from 'react';

interface CriticalCSSProps {
  children: React.ReactNode;
}

const CriticalCSS = ({ children }: CriticalCSSProps) => {
  useEffect(() => {
    // Defer non-critical CSS loading
    const deferStyles = () => {
      const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
      styleSheets.forEach((sheet) => {
        const link = sheet as HTMLLinkElement;
        if (link.href && !link.href.includes('critical')) {
          // Add media="print" to defer loading, then change to "all"
          link.media = 'print';
          link.onload = () => {
            link.media = 'all';
          };
        }
      });
    };

    // Run after initial render
    setTimeout(deferStyles, 0);
  }, []);

  return <>{children}</>;
};

export default CriticalCSS;
