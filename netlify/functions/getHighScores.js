const oracledb = require('oracledb');

exports.handler = async (event, context) => {
  console.log('getHighScores function invoked');

  if (event.httpMethod !== 'GET') {
    console.log('Method Not Allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log('Initializing Oracle connection');
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });
    console.log('Oracle connection established');

    console.log('Executing query to fetch high scores');
    const result = await connection.execute(
      `SELECT player_name, score, lastLevel, created_at 
       FROM highscores 
       ORDER BY score DESC 
       FETCH FIRST 10 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Query executed successfully', result);

    await connection.close();
    console.log('Oracle connection closed');

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
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
