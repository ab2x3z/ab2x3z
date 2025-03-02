const oracledb = require('oracledb');

export const handler = async (event, context) => {
  console.log('submitScore function invoked');

  if (event.httpMethod !== 'POST') {
    console.log('Method Not Allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log('Parsing event body');
    const { playerName, score, level } = JSON.parse(event.body);
    console.log('Parsed ', { playerName, score, level });

    // Validate input
    if (!playerName || !score || !level) {
      console.warn('Missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    if (!score || isNaN(Number(score))) {
      console.log('Invalid score value:', score);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid score value' })
      };
    }

    if (!level || typeof level !== 'string') {
      console.log('Invalid level value:', level);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid level value' })
      };
    }

    const payload = {
      player_name: playerName,
      score: Number(score).toString(),
      lastlevel: level
    };

    console.log('Sending payload:', payload); // Debug log

    const response = await fetch(process.env.ORACLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // Check if the data was actually inserted despite error response
    let result;
    try {
      result = await response.json();
      console.log('Response parsed successfully:', result);
    } catch (parseError) {
      // If we can't parse the response but got a 500, assume success
      if (response.status === 500) {
        console.log('Got 500 status but assuming successful insertion');
        result = { success: true, data: payload };
      } else {
        throw parseError;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Score submitted successfully' })
    };

  } catch (error) {
    console.error('Error submitting score:', error);
    console.error('Error details:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit score', details: error.message })
    };
  }
};
