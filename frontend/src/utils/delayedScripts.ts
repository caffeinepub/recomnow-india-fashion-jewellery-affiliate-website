/**
 * Utility to delay loading of third-party scripts (Google Analytics, etc.)
 * until 3 seconds after the window 'load' event fires.
 * This prevents render-blocking and improves Core Web Vitals (LCP, TBT, TTI).
 */

let scriptsLoaded = false;

/** Google Analytics Measurement ID */
const GA_MEASUREMENT_ID = 'G-RF54G5Z39K';

export function initDelayedScripts(): void {
  if (scriptsLoaded) return;

  // If page is already fully loaded, schedule immediately
  if (document.readyState === 'complete') {
    scheduleScriptInjection();
  } else {
    // Wait for the window load event, then schedule the 3-second delay
    window.addEventListener('load', scheduleScriptInjection, { once: true });
  }
}

function scheduleScriptInjection(): void {
  // Delay 3 seconds after window.load to prioritize main content
  setTimeout(injectThirdPartyScripts, 3000);
}

function injectThirdPartyScripts(): void {
  if (scriptsLoaded) return;
  scriptsLoaded = true;

  injectGoogleAnalytics(GA_MEASUREMENT_ID);
}

/**
 * Dynamically injects Google Analytics (gtag.js) after the delay.
 * This avoids render-blocking during initial page load.
 */
function injectGoogleAnalytics(measurementId: string): void {
  // Inject the gtag.js loader script
  const gtagScript = document.createElement('script');
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  gtagScript.async = true;
  document.body.appendChild(gtagScript);

  // Initialize dataLayer and gtag config once the script loads
  gtagScript.onload = () => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', measurementId);
  };
}

/**
 * Inject an arbitrary external script after the delay.
 * Useful for chat widgets, heatmaps, etc.
 */
export function injectDelayedScript(src: string, async = true): void {
  if (document.readyState === 'complete') {
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      document.body.appendChild(script);
    }, 3000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        document.body.appendChild(script);
      }, 3000);
    }, { once: true });
  }
}
