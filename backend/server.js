import express from "express";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import { PDFParse } from 'pdf-parse';
import chunkText from "./chunk.js";
import createEmbedding from "./embeddings.js";
console.log("API key loaded:", !!process.env.GEMINI_API_KEY);

const app=express();
const port=3000;
const upload = multer({ dest: 'uploads/' })
let fileName;
app.get("/",(req,res)=>{
    console.log("Got a get request");
    res.send("<h1>Hello</h1>");
});
app.get("/test-embedding", async (req, res) => {
    try {
        const vector = await createEmbedding("This is a test sentence.");

        console.log("Embedding size:", vector.length);

        res.json({
            size: vector.length,
            firstValues: vector.slice(0, 5)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Embedding failed" });
    }
});
app.post('/upload', upload.single('pdf'),  async(req, res)=> {
  try{
    fileName=req.file.path;
    const parser = new PDFParse({url:fileName});

	const pdfData = await parser.getText();
	console.log(pdfData.text);
    const chunks = chunkText(pdfData.text);
    console.log("Number of chunks=",chunks.length);
    res.json({
        message: "PDF processed successfully",
        filename: req.file.originalname,
        pages: pdfData.numpages,
        text: pdfData.text
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
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});