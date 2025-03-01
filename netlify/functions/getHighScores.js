const oracledb = require('oracledb');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });

    const result = await connection.execute(
      `SELECT player_name, score, level, created_at 
       FROM highscores 
       ORDER BY score DESC 
       FETCH FIRST 10 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve high scores' })
    };
  }
};
