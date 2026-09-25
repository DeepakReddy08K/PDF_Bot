async function createEmbeddings(chunks) {
    const BATCH_SIZE = 20;
    const allEmbeddings = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);

        const requests = batch.map(chunk => ({
            model: "models/gemini-embedding-001",
            content: {
                parts: [{ text: chunk }]
            }
        }));

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({ requests })
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        const embeddings = data.embeddings.map(e => e.values);

        allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
}

export default createEmbeddings;