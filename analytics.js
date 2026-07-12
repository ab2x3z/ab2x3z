// This will hold the unique ID for the entire page session.
let visitId = null;
let initialVisitData = null;
let fullDeviceInfo = null; // Keeps a persistent copy for the final webhook
let pageLoadTime = null;
let sessionHistory = []; // Array to store every event during the session

/**
 * Helper function to turn a messy User-Agent into a clean "Browser on OS" string.
 */
function getShortUserAgent(ua) {
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  // Detect Browser (Order is important here!)
  if (/OPR\/|Opera\//.test(ua)) browser = "Opera";
  else if (/Edg\//.test(ua)) browser = "Edge";
  else if (/SamsungBrowser\//.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";
  else if (/Trident\/|MSIE /.test(ua)) browser = "Internet Explorer";

  // Detect OS
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/(iPhone|iPad|iPod)/.test(ua)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}

/**
 * Sends an analytics event to the backend and logs it in session history.
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

  // Log the event locally for the end-of-session webhook
  sessionHistory.push({
    time: new Date().toISOString(),
    type: eventType,
    details: eventDetails
  });

  const payload = {
    visitId,
    eventType,
    eventDetails: JSON.stringify(eventDetails),
    // Only include the detailed visit data for the very first event to Oracle
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
    // After the first successful send, clear the initial data so it's not sent again to Oracle.
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

  // Store a permanent copy to send to Macrodroid later
  fullDeviceInfo = { ...initialVisitData };

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

      // --- MACRODROID WEBHOOK TRIGGER ---
      if (window.location.hostname !== 'localhost') {

        // 1. Format the history into a neat list
        let historyText = "";
        sessionHistory.forEach((event) => {
          // Get just the time using local time format
          const timeString = new Date(event.time).toLocaleTimeString('fr-CA');

          // Format details (if any)
          let detailStr = "";
          if (Object.keys(event.details).length > 0) {
            // E.g., convert {"to":"fr"} to "to: fr"
            detailStr = " -> " + Object.entries(event.details).map(([k, v]) => `${k}: ${v}`).join(', ');
          }

          historyText += `\n  [${timeString}] ${event.type}${detailStr}`;
        });

        // Parse the user agent for the notification
        const shortUserAgent = getShortUserAgent(fullDeviceInfo.userAgent);

        // 2. Build the final nicely formatted string
        const formattedMessage = `🌐 New Website Visit!
⏱ Duration: ${durationSeconds} seconds
🖥️ System: ${shortUserAgent}
📱 Screen: ${fullDeviceInfo.screenWidth}x${fullDeviceInfo.screenHeight}
🗣 Lang: ${fullDeviceInfo.browserLang}

👣 Event History (${sessionHistory.length} actions):${historyText}`;

        // 3. Send it as a single parameter called "message"
        const sessionData = {
          message: formattedMessage
        };

        // Forward to the Netlify function
        fetch('/.netlify/functions/macrodroid-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData),
          keepalive: true
        }).catch(err => console.error('Macrodroid webhook proxy failed:', err));
      }
    }
  });
}

export { init, sendEvent };