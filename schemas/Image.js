const moongoose = require("mongoose");
const Schema = moongoose.Schema;

const Image = new Schema({
  data: { type: String }
});

module.exports = moongoose.model("Image", Image);
