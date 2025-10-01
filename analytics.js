// This will hold the unique ID for the entire page session.
let visitId = null;
let initialVisitData = null;

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

  // Collect non-personal device information for the visit.
  initialVisitData = {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    browserLang: navigator.language,
  };

  // Send the initial 'page_load' event.
  sendEvent('page_load', { path: window.location.pathname });
}

export { init, sendEvent };