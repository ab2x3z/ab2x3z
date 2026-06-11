// This will hold the unique ID for the entire page session.
let visitId = null;
let initialVisitData = null;
let pageLoadTime = null;

/**
 * Sends an analytics event to the backend.
 * @param {string} eventType - The type of event (e.g., 'page_load', 'nav_click').
 * @param {object} eventDetails - An object with additional data about the event.
 */
async function sendEvent(eventType, eventDetails = {}) {
  if (!visitId) {
    console.error("Analytics not initialized.");
    return;
  }
  
  if (window.location.hostname === 'localhost') {
    console.log(`[Dev Analytics] Event blocked: ${eventType}`, eventDetails);
    return;
  }

  const payload = {
    visitId,
    eventType,
    eventDetails: JSON.stringify(eventDetails),
    // Only include the detailed visit data for the very first event
    ...(initialVisitData && {
      userAgent: initialVisitData.userAgent,
      screenWidth: initialVisitData.screenWidth,
      screenHeight: initialVisitData.screenHeight,
      browserLang: initialVisitData.browserLang,
    }),
  };

  try {
    await fetch('/.netlify/functions/record-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true, // IMPORTANT: Ensures the request finishes even if the tab is closing
    });
    // After the first successful send, clear the initial data so it's not sent again.
    if (initialVisitData) {
      initialVisitData = null;
    }
  } catch (error) {
    console.error('Failed to send analytics event:', error);
  }
}

/**
 * Initializes the analytics tracker for the current page session.
 * This should be called once when the page loads.
 */
function init() {
  // Generate a unique visit ID using the browser's built-in crypto API.
  visitId = crypto.randomUUID();
  pageLoadTime = Date.now(); // Record the exact timestamp they loaded the page

  // Collect non-personal device information for the visit.
  initialVisitData = {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    browserLang: navigator.language,
  };

  // Send the initial 'page_load' event.
  sendEvent('page_load', { path: window.location.pathname });

  // Track when the user leaves the tab, closes the window, or switches apps (mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Calculate how many seconds they spent on the page
      const durationSeconds = Math.round((Date.now() - pageLoadTime) / 1000);
      
      sendEvent('page_leave', { 
        path: window.location.pathname,
        duration: durationSeconds
      });
    }
  });
}

export { init, sendEvent };