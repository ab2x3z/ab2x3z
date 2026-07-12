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

  // Detect Browser
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
 * Helper function to guess the exact device model based on UserAgent and Screen Size.
 */
function getLikelyDevice(ua, width, height, touchPoints) {
  // Sort dimensions so orientation (portrait/landscape) doesn't break the match
  const w = Math.min(width, height);
  const h = Math.max(width, height);
  const res = `${w}x${h}`;

  // 1. Detect Apple Devices
  const isIOS = /(iPhone|iPad|iPod)/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1);
  
  if (isIOS) {
    const appleDevices = {
      // Latest 2024-2026 models
      "440x956": "iPhone 16/17 Pro Max",
      "402x874": "iPhone 16/17 Pro",
      "420x912": "iPhone 17 Air",
      "430x932": "iPhone 14/15/16 Pro Max, 14/15/16 Plus",
      "393x852": "iPhone 14/15/16 Pro, 15/16",
      "390x844": "iPhone 12/13/14/16e, 12/13 Pro",
      "1032x1376": "iPad Pro 13\" (M4+)",
      "834x1210": "iPad Pro 11\" (M4+)",
      "1024x1366": "iPad Pro 12.9\", iPad Air 13\"",
      "820x1180": "iPad Air 11\" (Gen 4+), iPad (10th Gen)",
      "744x1133": "iPad Mini (Gen 6, A17 Pro)",
      // Legacy Models
      "428x926": "iPhone 12/13 Pro Max, 14 Plus",
      "414x896": "iPhone XR, 11, XS Max, 11 Pro Max",
      "375x812": "iPhone X, XS, 11 Pro, 12/13 Mini",
      "414x736": "iPhone 6/7/8 Plus",
      "375x667": "iPhone 6/7/8, SE (Gen 2/3)",
      "320x568": "iPhone 5/5S, SE (Gen 1)",
      "834x1194": "iPad Pro 11\" (Older)",
      "810x1080": "iPad (Gen 7/8/9)",
      "768x1024": "iPad Mini (1-5), iPad Air (1-2)"
    };
    if (appleDevices[res]) return appleDevices[res];
    if (ua.includes("iPad") || touchPoints > 1) return "iPad (Unknown Model)";
    return "iPhone (Unknown Model)";
  }

  // 2. Detect Android Devices
  const isAndroid = /Android/.test(ua);
  if (isAndroid) {
    const androidDevices = {
      // Latest 2024-2026 models
      "414x921": "Google Pixel 9/10 Pro XL",
      "410x914": "Google Pixel 9/10 Pro",
      "412x923": "Google Pixel 10",
      "412x891": "Samsung Galaxy S24/S25 Ultra / Plus",
      "360x780": "Samsung Galaxy S24/S25",
      "393x960": "Samsung Galaxy Z Flip6",
      // Legacy Models
      "412x915": "Google Pixel 6/7/8 Pro",
      "393x873": "Google Pixel 6/7/8",
      "360x800": "Samsung Galaxy S20/S21/S22/S23",
      "384x854": "Samsung Galaxy (Various)",
      "412x914": "Samsung Galaxy S Ultra / Note (Older)"
    };
    if (androidDevices[res]) return `${androidDevices[res]} (or similar)`;
    
    if (/Tablet/i.test(ua) || !/Mobile/i.test(ua)) return "Android Tablet";
    return "Android Smartphone";
  }

  // 3. Detect Mac/PC
  const isMac = /Mac OS X|Macintosh/.test(ua);
  if (isMac) {
    return h >= 1440 ? "iMac / Mac Studio" : "MacBook";
  }

  // Generic PC fallback based on screen length
  if (h >= 1920) return "Desktop PC";
  if (h >= 1200) return "Laptop PC";
  return "Small PC / Unknown";
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (initialVisitData) {
      initialVisitData = null;
    }
  } catch (error) {
    console.error('Failed to send analytics event:', error);
  }
}

/**
 * Initializes the analytics tracker for the current page session.
 */
function init() {
  visitId = crypto.randomUUID();
  pageLoadTime = Date.now(); 

  // Collect non-personal device information for the visit.
  initialVisitData = {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    browserLang: navigator.language,
    touchPoints: navigator.maxTouchPoints || 0
  };

  fullDeviceInfo = { ...initialVisitData };

  sendEvent('page_load', { path: window.location.pathname });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const durationSeconds = Math.round((Date.now() - pageLoadTime) / 1000);

      sendEvent('page_leave', {
        path: window.location.pathname,
        duration: durationSeconds
      });

      // --- MACRODROID WEBHOOK TRIGGER ---
      if (window.location.hostname !== 'localhost') {

        let historyText = "";
        sessionHistory.forEach((event) => {
          const timeString = new Date(event.time).toLocaleTimeString('fr-CA');
          let detailStr = "";
          if (Object.keys(event.details).length > 0) {
            detailStr = " -> " + Object.entries(event.details).map(([k, v]) => `${k}: ${v}`).join(', ');
          }
          historyText += `\n  [${timeString}] ${event.type}${detailStr}`;
        });

        // Parse the Helpers
        const shortUserAgent = getShortUserAgent(fullDeviceInfo.userAgent);
        const likelyDevice = getLikelyDevice(
          fullDeviceInfo.userAgent, 
          fullDeviceInfo.screenWidth, 
          fullDeviceInfo.screenHeight,
          fullDeviceInfo.touchPoints
        );

        // Build the final nicely formatted string
        const formattedMessage = `🌐 New Website Visit!
⏱ Duration: ${durationSeconds} seconds
🖥️ System: ${shortUserAgent}
💻 Device: ${likelyDevice}
📺 Screen: ${fullDeviceInfo.screenWidth}x${fullDeviceInfo.screenHeight}
🗣 Lang: ${fullDeviceInfo.browserLang}

👣 Event History (${sessionHistory.length} actions):${historyText}`;

        const sessionData = { message: formattedMessage };

        // Forward to the Netlify function
        fetch('/.netlify/functions/macrodroid-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
          keepalive: true
        }).catch(err => console.error('Macrodroid webhook proxy failed:', err));
      }
    }
  });
}

export { init, sendEvent };