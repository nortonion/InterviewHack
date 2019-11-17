const express = require("express");
const router = express.Router();
const Image = require("../schemas/Image");
const path = require("path");
var sleep = require("sleep");
var request = require("request");

// define access parameters
var accessToken = "d96a94cccee522eb3029f3d330dbee22";
var endpoint = "user_cff470e914.compilers.sphere-engine.com";

// define request parameters

router.get("/", async (req, res) => {
  const vision = require("@google-cloud/vision");
  const client = new vision.ImageAnnotatorClient();
  var stream = "output";
  const fileName = path.join(__dirname, "test.jpg");
  const [result] = await client.documentTextDetection(fileName);
  const fullTextAnnotation = result.fullTextAnnotation;
  console.log(`Full text: ${fullTextAnnotation.text}`);

  var submissionData = {
    compilerId: 1,
    source: fullTextAnnotation.text
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
                  console.log(response.body); // raw data from selected stream
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
  res.send({ msg: "1" });
});

router.get("/get_image", (req, res) => {
  Image.findOne()
    .sort({ date: -1 })
    .limit(1)
    .exec(function(err, data) {
      if (err) {
        res.status(200).send(err);
      }
      if (data) {
        res.status(200).send(data);
        console.log(data);
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
        require("fs").writeFile("out.jpg", req.body, "base64", function(err) {
          console.log("error ?");
        });

        res.status(200).json({ msg: "success" });
      })
      .catch(err => res.status(404).send(err));
  });
});

router.post("/", (req, res) => {});

module.exports = router;
