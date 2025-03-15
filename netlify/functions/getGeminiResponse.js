export const handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    const { geminiModel, input, origin } = JSON.parse(event.body); // Extract origin from body

    try {
        const result = await generateContent(geminiModel, input, origin); // Pass origin to generateContent
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate content' }),
        };
    }
};

async function generateContent(geminiModel, inputText, origin) {  // Origin is now an argument
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI}`;
    console.log("Calling Gemini from origin:", origin); // Log the origin
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: inputText
                    }]
                }]
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}