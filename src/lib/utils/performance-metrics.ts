// lib/utils/performance-metrics.ts
/**
 * Utility to measure and log key performance metrics
 * Helps ensure we meet P95 API < 200ms and FMP < 1s requirements
 */
export function measurePerformance() {
    if (typeof window === 'undefined') return;
    
    // Only run in production and only if the browser supports the Performance API
    if (process.env.NODE_ENV !== 'production' || !('PerformanceObserver' in window)) return;
  
    try {
      // Measure LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Log LCP for monitoring
        console.log('LCP:', lastEntry.startTime);
        
        // Check if we meet the performance target (under 1s)
        const lcpMet = lastEntry.startTime < 1000;
        
        // You can send this to your analytics service
        if (!lcpMet) {
          console.warn('Performance target not met: LCP > 1000ms');
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // Measure FID (First Input Delay)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          console.log('FID:', (entry as PerformanceEventTiming).processingStart - entry.startTime);
        });
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
      
      // Return cleanup function
      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
      };
    } catch (e) {
      console.error('Error measuring performance:', e);
    }
  }