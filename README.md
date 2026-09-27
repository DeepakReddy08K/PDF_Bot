# PDF RAG

A simple RAG application that lets users upload a PDF and ask questions about its content.

The application:

- Extracts text from the PDF
- Splits the text into chunks
- Generates embeddings using Gemini
- Stores embeddings in ChromaDB
- Retrieves relevant chunks for each question
- Uses Gemini to generate the final answer

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **Backend:** Node.js, Express.js
- **AI:** Google Gemini
- **Vector Database:** ChromaDB

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/DeepakReddy08K/PDF_Bot.git
cd PDF_Bot
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create `.env`

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
CHROMA_HOST=your_chroma_host
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database
CHROMA_API_KEY=your_chroma_api_key
```

Do not upload the `.env` file to GitHub.

### 4. Start the backend

```bash
node server.js
```

The backend will run on:

```text
http://localhost:3000
```

### 5. Start the frontend

Open another terminal:

```bash
cd fronted
npx serve . -l 5500
```

Open:

```text
http://localhost:5500
```

Upload a PDF and start asking questions.
