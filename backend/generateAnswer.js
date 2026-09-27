import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function generateAnswer(question, chunks) {
    const context = chunks.join("\n\n");

    const prompt = `
You are answering questions about a document.

Use the context below to answer the question.
The answer does NOT need to use the exact wording from the context.
If the context contains enough information to answer, answer it.
Only say "I couldn't find the answer in the document." if the context truly does not contain the answer.

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error(data);
        throw new Error("Gemini API failed");
    }

    return data.candidates[0].content.parts[0].text;
}