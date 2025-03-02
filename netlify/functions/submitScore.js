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
    
    if (!playerName || typeof playerName !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const payload = {
      player_name: playerName,
      score: Number(score).toString(),
      lastlevel: level
    };

    const response = await fetch(process.env.ORACLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    let result;
    try {
      result = await response.json();
      console.log('Response parsed successfully:', result);
    } catch (parseError) {
        throw parseError;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Score submitted successfully' })
    };

  } catch (error) {
    console.error('Error details:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit score', details: error.message })
    };
  }
};
