const express = require("express");
const router = express.Router();
const Image = require("../schemas/Image");

router.get("/", (req, res) => {
  res.send({ msg: "Test" });
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
      }
    });
});

router.post("/upload", (req, res) => {
  let image = new Image(req.body);
  image
    .save()
    .then(new_image => res.status(200).json(new_image))
    .catch(err => res.status(404).send(err));
});

router.post("/", (req, res) => {});

module.exports = router;
