const { Schema, model } = require("mongoose")

//create a document in our database: it stores the contents of our google doc
const Document = new Schema({
  _id: String,
  data: Object,
})

module.exports = model("Document", Document)