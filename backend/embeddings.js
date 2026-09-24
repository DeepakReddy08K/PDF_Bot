async function createEmbedding(text) {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                model: "models/gemini-embedding-001",
                content: {
                    parts: [
                        {
                            text: text
                        }
                    ]
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    const data = await response.json();

    return data.embedding.values;
}

export default createEmbedding;