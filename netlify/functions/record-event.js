async function getAuthToken() {
  try {
    const authString = Buffer.from(`${process.env.ORACLE_CLIENT_ID}:${process.env.ORACLE_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(process.env.AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: 'grant_type=client_credentials'
    });
    if (!response.ok) {
      throw new Error(`Failed to retrieve auth token: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const authToken = await getAuthToken();
    const eventData = JSON.parse(event.body);

    const response = await fetch(process.env.ORACLE_ANALYTICS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Oracle API Error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Failed to record event. Status: ${response.status}`);
    }

    return {
      statusCode: 201, // 201 Created
      body: JSON.stringify({ message: 'Event recorded successfully' })
    };
  } catch (error) {
    console.error('Error recording analytics event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to record event' })
    };
  }
};