export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. Parse the incoming data from analytics.js
    const sessionData = JSON.parse(event.body);
    const webhookUrl = process.env.MACRODROID_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('MacroDroid Webhook URL environment variable is missing.');
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'Webhook not configured on server' }) 
      };
    }

    // 2. Safely URL-encode the formatted message (handles emojis, newlines, etc.)
    const queryParams = new URLSearchParams({
      message: sessionData.message || "Empty message received"
    }).toString();

    // 3. Send to MacroDroid using a GET request with the parameter in the URL
    // This guarantees MacroDroid will map it directly to your 'message' local variable
    const response = await fetch(`${webhookUrl}?${queryParams}`, {
      method: 'GET'
    });

    return {
      statusCode: response.status,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error forwarding to MacroDroid:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to forward event' })
    };
  }
};