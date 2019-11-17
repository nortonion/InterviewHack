const express = require("express");
const router = express.Router();
const path = require('path'); 
var sleep = require('sleep');
var request = require('request');

// define access parameters
var accessToken = 'd96a94cccee522eb3029f3d330dbee22';
var endpoint = 'user_cff470e914.compilers.sphere-engine.com';

// define request parameters


router.get("/", async (req, res) => {
  
   //TODO,
   // Call local image
   //GCP 
   // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

// Creates a client
  const client = new vision.ImageAnnotatorClient();
var stream = "output"
var idnum = 0;


  const fileName = path.join(__dirname, 'c++.jpg');
  
    //Read a local image as a text document
    const [result] = await client.documentTextDetection(fileName);
    const fullTextAnnotation = result.fullTextAnnotation;
    console.log(`Full text: ${fullTextAnnotation.text}`);/*
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
    });*/
    //config.source= fullTextAnnotation.text;
    
    /*compilerID for the following program langs
    c++ 1
    c   11
    node.js 56*/
  
  var submissionData = {
    compilerId: 1,
    source: fullTextAnnotation.text
  };

// send request
request({
  url: 'https://' + endpoint + '/api/v4/submissions?access_token=' + accessToken,
  method: 'POST',
  form: submissionData
}, function (error, response, body) {
  
  if (error) {
      console.log('Connection problem');
  }
  
  // process response
  if (response) {
      if (response.statusCode === 201) {
          var submissionId = (JSON.parse(response.body)).id; // submission data in JSON
          console.log(submissionId)
          sleep.sleep(5)
          // send request
request({
  url: 'https://' + endpoint + '/api/v4/submissions/' + submissionId + '/' + stream + '?access_token=' + accessToken,
  method: 'GET'
}, function (error, response, body) {
  
  if (error) {
      console.log('Connection problem');
  }
  
  // process response
  if (response) {
      if (response.statusCode === 200) {
          console.log(response.body); // raw data from selected stream
      } else {
          if (response.statusCode === 401) {
              console.log('Invalid access token');
          } else if (response.statusCode === 403) {
              console.log('Access denied');
          } else if (response.statusCode === 404) {
              var body = JSON.parse(response.body);
              console.log('Non existing resource, error code: ' + body.error_code + ', details available in the message: ' + body.message)
          } else if (response.statusCode === 400) {
              var body = JSON.parse(response.body);
              console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
          }
      }
  }
});
      } else {
          if (response.statusCode === 401) {
              console.log('Invalid access token');
          } else if (response.statusCode === 402) {
              console.log('Unable to create submission');
          } else if (response.statusCode === 400) {
              var body = JSON.parse(response.body);
              console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
          }
      }
  }
});
//after you get submission id
// define request parameters
//var submissionId = idnum;

// send request





   // Send the output
   // print 1
  res.send({ msg: "1" });
});

router.post("/", (req, res) => {});

module.exports = router;
