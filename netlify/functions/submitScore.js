const oracledb = require('oracledb');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { playerName, score, level } = JSON.parse(event.body);

    // Validate input
    if (!playerName || !score || !level) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Initialize Oracle connection
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });

    // Insert score
    const result = await connection.execute(
      `INSERT INTO highscores (player_name, score, level, created_at) 
       VALUES (:1, :2, :3, CURRENT_TIMESTAMP)`,
      [playerName, score, level],
      { autoCommit: true }
    );

    await connection.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Score submitted successfully' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit score' })
    };
  }
};
