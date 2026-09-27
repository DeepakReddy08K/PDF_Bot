const API_URL = "http://localhost:3000";

const pdfInput = document.getElementById("pdfInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");

const questionInput = document.getElementById("questionInput");
const askBtn = document.getElementById("askBtn");
const answer = document.getElementById("answer");

let documentId = null;



uploadBtn.addEventListener("click", async () => {

    const file = pdfInput.files[0];

    if (!file) {
        uploadStatus.textContent = "Please select a PDF.";
        return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Processing...";
        uploadStatus.textContent = "Uploading and processing...";

        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload failed");
        }

        // Store document ID for future questions
        documentId = data.documentId;

        uploadStatus.innerHTML = `
            <div class="alert alert-success">
                ✅ <strong>${data.filename}</strong> uploaded successfully.
                <br>
                You can now ask questions about the PDF.
            </div>
        `;
        questionInput.disabled = false;
        askBtn.disabled = false;

        questionInput.focus();

    } catch (error) {

        console.error(error);

        uploadStatus.innerHTML = `
            <div class="alert alert-danger">
                ❌ ${error.message}
            </div>
        `;

    } finally {

        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload PDF";
    }
});


askBtn.addEventListener("click", async () => {

    const question = questionInput.value.trim();

    if (!question) {
        answer.textContent = "Please enter a question.";
        return;
    }

    if (!documentId) {
        answer.textContent = "Please upload a PDF first.";
        return;
    }

    try {

        askBtn.disabled = true;
        askBtn.textContent = "Thinking...";
        answer.textContent = "Generating answer...";

        const response = await fetch(`${API_URL}/ask`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                documentId: documentId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to get answer");
        }

        answer.textContent = data.answer;

    } catch (error) {

        console.error(error);

        answer.textContent = `❌ ${error.message}`;

    } finally {

        askBtn.disabled = false;
        askBtn.textContent = "Ask";
    }
});


questionInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        askBtn.click();
    }
});