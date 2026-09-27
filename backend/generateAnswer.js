import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function generateAnswer(question, chunks) {
    const context = chunks.join("\n\n");

    const prompt = `
Use the document context as the primary source.

You may reason and infer from the information in the context
when the user asks for explanations, implications, interview
questions, preparation advice, or other analysis.

Do not invent facts about the document that are not supported
by the context.

If the question requires information completely unrelated to
the context, say:
"I couldn't find enough information in the document."

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