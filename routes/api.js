const express = require("express");
const router = express.Router();
const path = require('path'); 
router.get("/", async (req, res) => {
  
   //TODO,
   // Call local image
   //GCP 
   // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

// Creates a client
  const client = new vision.ImageAnnotatorClient();
try{
  const fileName = path.join(__dirname, 'test.jpg');
  
    //Read a local image as a text document
    const [result] = await client.documentTextDetection(fileName);
    const fullTextAnnotation = result.fullTextAnnotation;
    console.log(`Full text: ${fullTextAnnotation.text}`);
    fullTextAnnotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        console.log(`Block confidence: ${block.confidence}`);
        block.paragraphs.forEach(paragraph => {
          console.log(`Paragraph confidence: ${paragraph.confidence}`);
          paragraph.words.forEach(word => {
            const wordText = word.symbols.map(s => s.text).join('');
            console.log(`Word text: ${wordText}`);
            console.log(`Word confidence: ${word.confidence}`);
              word.symbols.forEach(symbol => {
                console.log(`Symbol text: ${symbol.text}`);
              console.log(`Symbol confidence: ${symbol.confidence}`);
              });
          });
        });
      });
    });
  }
  catch(error){
    console.log(error);
  }


   // Send the output
   // print 1
  res.send({ msg: "1" });
});

router.post("/", (req, res) => {});

module.exports = router;
