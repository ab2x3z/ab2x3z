export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const sessionData = JSON.parse(event.body);
    const webhookUrl = process.env.MACRODROID_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('MacroDroid Webhook URL environment variable is missing.');
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'Webhook not configured on server' }) 
      };
    }

    // Forward the payload to MacroDroid
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    return {
      statusCode: response.status,
      body: JSON.stringify({ message: 'Webhook forwarded successfully' })
    };
  } catch (error) {
    console.error('Error forwarding to MacroDroid:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to forward event' })
    };
  }
};