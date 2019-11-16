const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  /**
   * TODO,
   * Call local image
   * GCP 
   */

   // Send the output
  res.send({ msg: "Test" });
});

router.post("/", (req, res) => {});

module.exports = router;
