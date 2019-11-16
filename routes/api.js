const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ msg: "Test" });
});

router.post("/", (req, res) => {});

module.exports = router;
