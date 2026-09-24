function chunkText(text, maxChars = 1000, overlapSentences = 1) {
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    const chunks = [];
    let current = [];

    for (const sentence of sentences) {
        const test = [...current, sentence].join(". ");

        if (test.length > maxChars && current.length > 0) {
            chunks.push(current.join(". ") + ".");

            current = current.slice(-overlapSentences);
        }

        current.push(sentence);
    }

    if (current.length > 0) {
        chunks.push(current.join(". ") + ".");
    }

    return chunks;
}
export default chunkText;