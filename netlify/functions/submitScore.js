// Simple in-memory store for rate limiting
const requestStore = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 5; // max requests per window

  const requests = requestStore.get(ip) || [];
  const recentRequests = requests.filter(time => time > now - windowMs);
  
  requestStore.set(ip, [...recentRequests, now]);
  return recentRequests.length >= maxRequests;
}

export const handler = async (event, context) => {
  console.log('submitScore function invoked');

  // Check method
  if (event.httpMethod !== 'POST') {
    console.log('Method Not Allowed:', event.httpMethod);
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  // Rate limiting
  const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'];
  if (isRateLimited(clientIP)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many requests' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    console.log('Parsing event body');
    // Parse and validate input
    const { playerName, score, level } = JSON.parse(event.body);

    // Validate playerName
    if (!playerName || typeof playerName !== 'string' || 
        playerName.length > 50 || 
        !/^[a-zA-Z0-9-_. ]+$/.test(playerName)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid player name' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Validate score
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 9999) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid score' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Validate level
    const validLevels = ['AGround', 'Wood', 'Brick', 'Sand', 'Marble', 'Obsidian', 'Sleep'];
    if (!validLevels.includes(level)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid level' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Sanitize playerName for XSS prevention
    const sanitizedName = playerName
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Prepare payload
    const payload = {
      player_name: sanitizedName,
      score: numScore.toString(),
      lastlevel: level
    };

    // Make request to backend
    const response = await fetch(process.env.ORACLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-IP': clientIP
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
      console.log('Response parsed successfully:', result);
    } catch (parseError) {
        throw parseError;
    }

    // Return success
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Score submitted successfully' }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    };

  } catch (error) {
    console.error('Error details:', error);
    // Return generic error to client
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
