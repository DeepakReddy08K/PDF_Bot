import express from "express";
import multer from "multer";
import fs from "fs";
import { PDFParse } from 'pdf-parse';
import chunkText from "./chunk.js";

const app=express();
const port=3000;
const upload = multer({ dest: 'uploads/' })
let fileName;
app.get("/",(req,res)=>{
    console.log("Got a get request");
    res.send("<h1>Hello</h1>");
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