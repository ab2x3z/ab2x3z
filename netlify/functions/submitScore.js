const oracledb = require('oracledb');

exports.handler = async (event, context) => {
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

    // Initialize Oracle connection
    console.log('Initializing Oracle connection');
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });
    console.log('Oracle connection established');

    // Insert score
    console.log('Inserting score into database');
    const result = await connection.execute(
      `INSERT INTO highscores (player_name, score, lastLevel, created_at) 
       VALUES (:1, :2, :3, CURRENT_TIMESTAMP)`,
      [playerName, score, level],
      { autoCommit: true }
    );
    console.log('Score inserted successfully', result);

    await connection.close();
    console.log('Oracle connection closed');

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
