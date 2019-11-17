const express = require("express");
const router = express.Router();
const Image = require("../schemas/Image");
var sleep = require("sleep");
var request = require("request");
var fs = require("fs");
// define access parameters
var accessToken = "d96a94cccee522eb3029f3d330dbee22";
var endpoint = "user_cff470e914.compilers.sphere-engine.com";

const stringlength = require("string-length");

// define request parameters

router.get("/:language", async (req, res) => {
  var language = req.params.language;
  var ID;
  if (language == "C++") {
    ID = 1;
  } else if (language == "C") {
    ID = 11;
  } else if (language == "Javascript") {
    ID = 56;
  } else if (language == "Python") {
    ID = 99;
  }
  Image.findOne()
    .sort({ date: -1 })
    .limit(1)
    .exec(async (err, saved_image) => {
      if (err) {
        res.status(200).send(err);
      }
      // IF there is image in DB
      if (saved_image) {
        // Create empty out.jpg
        var fd = fs.openSync("out.jpg", "w");
        // Write to that empty out.jpg the image stored in DB
        fs.writeFile("out.jpg", saved_image.data, "base64", async err => {
          // After writting, use GCP
          const path = require("path");
          let sleep = require("sleep");
          let request = require("request");
          let accessToken = "d96a94cccee522eb3029f3d330dbee22";
          let endpoint = "user_cff470e914.compilers.sphere-engine.com";

          const vision = require("@google-cloud/vision");
          const client = new vision.ImageAnnotatorClient();
          var stream = "output";
          const fileName = "out.jpg";

          const [result] = await client.documentTextDetection(fileName);
          const fullTextAnnotation = result.fullTextAnnotation;
          console.log(`Full text: ${fullTextAnnotation.text}`);

          //python
          var codes;
          codes = fullTextAnnotation.text;
          var i;
          for (i = 0; i < codes.length; i++) {
            if (code[i] == "_") {
              code[i] = "\t";
            }
          }

          // Submission/Compile
          var submissionData = {
            compilerId: ID,
            source: codes //fullTextAnnotation.text
          };

          // send request
          request(
            {
              url:
                "https://" +
                endpoint +
                "/api/v4/submissions?access_token=" +
                accessToken,
              method: "POST",
              form: submissionData
            },
            function(error, response, body) {
              if (error) {
                console.log("Connection problem");
              }

              // process response
              if (response) {
                if (response.statusCode === 201) {
                  var submissionId = JSON.parse(response.body).id; // submission data in JSON
                  console.log(submissionId);
                  sleep.sleep(5);
                  // send request
                  request(
                    {
                      url:
                        "https://" +
                        endpoint +
                        "/api/v4/submissions/" +
                        submissionId +
                        "/" +
                        stream +
                        "?access_token=" +
                        accessToken,
                      method: "GET"
                    },
                    function(error, response, body) {
                      if (error) {
                        console.log("Connection problem");
                      }

                      // process response
                      if (response) {
                        if (response.statusCode === 200) {
                          res.send({ msg: response.body });
                        } else {
                          if (response.statusCode === 401) {
                            console.log("Invalid access token");
                          } else if (response.statusCode === 403) {
                            console.log("Access denied");
                          } else if (response.statusCode === 404) {
                            var body = JSON.parse(response.body);
                            console.log(
                              "Non existing resource, error code: " +
                                body.error_code +
                                ", details available in the message: " +
                                body.message
                            );
                          } else if (response.statusCode === 400) {
                            var body = JSON.parse(response.body);
                            console.log(
                              "Error code: " +
                                body.error_code +
                                ", details available in the message: " +
                                body.message
                            );
                          }
                          res.status(200).send({ msg: "Compilation error" });
                        }
                      }
                    }
                  );
                } else {
                  if (response.statusCode === 401) {
                    console.log("Invalid access token");
                  } else if (response.statusCode === 402) {
                    console.log("Unable to create submission");
                  } else if (response.statusCode === 400) {
                    var body = JSON.parse(response.body);
                    console.log(
                      "Error code: " +
                        body.error_code +
                        ", details available in the message: " +
                        body.message
                    );
                  }
                }
              }
            }
          );
        });
      } else {
        res.status(200).send({ msg: "empty" });
      }
    });
});

router.get("/get_image", (req, res) => {
  Image.findOne()
    .sort({ date: -1 })
    .limit(1)
    .exec(function(err, saved_image) {
      if (err) {
        res.status(200).send(err);
      }
      if (saved_image) {
        var fd = fs.openSync("out.jpg", "w");

        require("fs").writeFile("out.jpg", saved_image.data, "base64", function(
          err
        ) {
          console.log(err);
          res.status(200).send({ msg: "success" });
        });
      } else {
        res.status(200).send({ msg: "empty" });
      }
    });
});

router.post("/upload", (req, res) => {
  Image.remove({}, () => {
    let image = new Image(req.body);
    image
      .save()
      .then(new_image => {
        res.status(200).json({ msg: "success" });
      })
      .catch(err => res.status(404).send(err));
  });
});

router.post("/", (req, res) => {});

module.exports = router;
