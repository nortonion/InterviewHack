const express = require("express");
const router = express.Router();
const Image = require("../schemas/Image");

router.post("/upload", (req, res) => {
  let image = new Image(req.body);
  image
    .save()
    .then(new_image => res.status(200).json(new_image))
    .catch(err => res.status(404).send(err));
});

module.exports = router;
