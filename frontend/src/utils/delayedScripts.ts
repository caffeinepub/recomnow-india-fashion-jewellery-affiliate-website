/**
 * Utility to delay loading of third-party scripts until after page load
 * to improve initial page render performance and Core Web Vitals
 */

let scriptsLoaded = false;

export function initDelayedScripts() {
  if (scriptsLoaded) return;

  // Wait for page load event, then delay an additional 3 seconds
  if (document.readyState === 'complete') {
    scheduleScriptInjection();
  } else {
    window.addEventListener('load', scheduleScriptInjection, { once: true });
  }
}

function scheduleScriptInjection() {
  setTimeout(() => {
    injectThirdPartyScripts();
  }, 3000);
}

function injectThirdPartyScripts() {
  if (scriptsLoaded) return;
  scriptsLoaded = true;

  // Example: Inject analytics script (uncomment and configure as needed)
  // const analyticsScript = document.createElement('script');
  // analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID';
  // analyticsScript.async = true;
  // document.body.appendChild(analyticsScript);

  // Example: Inject chat widget (uncomment and configure as needed)
  // const chatScript = document.createElement('script');
  // chatScript.src = 'https://your-chat-provider.com/widget.js';
  // chatScript.async = true;
  // document.body.appendChild(chatScript);

  console.log('Third-party scripts loaded after 3-second delay');
}
