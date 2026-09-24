import express from "express";
import multer from "multer";
const app=express();
const port=3000;
const upload = multer({ dest: 'uploads/' })
app.get("/",(req,res)=>{
    console.log("Got a get request");
    res.send("<h1>Hello</h1>");
});
app.post('/upload', upload.single('pdf'),  (req, res)=> {
  console.log(req.file);
  res.json({
    message:"PDF uploaded successfully",
    filename:req.file.originalname
  });
});
app.listen(port,()=>{
    console.log("Server running on port $",{port});
});