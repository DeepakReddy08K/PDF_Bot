import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { PDFParse } from 'pdf-parse';
import chunkText from "./chunk.js";
import createEmbeddings from "./embeddings.js";
import chromaClient from "./chroma.js"
import { randomUUID } from "crypto";
import generateAnswer from "./generateAnswer.js";

console.log("API key loaded:", !!process.env.GEMINI_API_KEY);

const app=express();
app.use(cors());
app.use(express.json());
const port=3000;
const upload = multer({ dest: 'uploads/' })
app.get("/",(req,res)=>{
    console.log("Got a get request");
    res.send("<h1>Hello</h1>");
});
app.post('/upload', upload.single('pdf'),  async(req, res)=> {
    let fileName;
  try{
    if (!req.file) {
        return res.status(400).json({
            error: "PDF file is required"
        });
    }
    const documentId = randomUUID();
    fileName = req.file.path;
    
    const parser = new PDFParse({url:fileName});

	const pdfData = await parser.getText();
    const chunks = chunkText(pdfData.text);
    console.log("Number of chunks=",chunks.length);
    const embeddings = await createEmbeddings(chunks);

    console.log("Number of embeddings:", embeddings.length);
    console.log("Vector size:", embeddings[0].length);
    const collection = await chromaClient.getOrCreateCollection({
        name: "pdf_documents",
        embeddingFunction: null
    });
    const ids = chunks.map(
      (_, index) => `${documentId}_chunk_${index}`
    );
    await collection.add({
        ids: ids,
        embeddings: embeddings,
        documents: chunks,
        metadatas: chunks.map(() => ({
            documentId: documentId
        }))
    });
    console.log("Data stored in chroma database");
    res.json({
        message: "PDF processed successfully",
        documentId: documentId,
        filename: req.file.originalname,
        pages: pdfData.numpages
    });
    await parser.destroy();
  }catch(error){
    console.error(error);
    res.status(500).json({ error: "Failed to process PDF" });
  }finally{
    //Delete the file after extracting data
    if(fileName && fs.existsSync(fileName)){
        fs.unlinkSync(fileName);
    }
  }
});
app.post("/ask", async (req, res) => {
    try {
        const { question, documentId } = req.body;

        if (!question || !documentId) {
            return res.status(400).json({
                error: "question and documentId are required"
            });
        }

        // Convert question to embedding
        const questionEmbedding = await createEmbeddings([question]);

        // Get collection
        const collection = await chromaClient.getOrCreateCollection({
            name: "pdf_documents",
            embeddingFunction: null
        });

        // Search only inside this document
        const results = await collection.query({
            queryEmbeddings: questionEmbedding,
            nResults: 3,
            where: {
                documentId: documentId
            }
        });

        console.log("Retrieved IDs:", results.ids);
        const answer = await generateAnswer(
            question,
            results.documents[0]
        );
        console.log("got an ans of length",answer.length)
        res.json({
            question,
            answer
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to search document"
        });
    }
});
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});