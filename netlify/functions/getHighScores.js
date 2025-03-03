export const handler = async (event, context) => {
  console.log('getHighScores function invoked');

  if (event.httpMethod !== 'GET') {
    console.log('Method Not Allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const response = await fetch(process.env.ORACLE);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('High scores retrieved successfully');

    return {
      statusCode: 200,
      body: JSON.stringify(data.items)
    };

  } catch (error) {
    console.error('Error retrieving high scores:', error);
    console.error('Error details:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve high scores', details: error.message })
    };
  }
};
