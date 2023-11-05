const mongoose = require('mongoose')
const Document = require("./Document")

mongoose.connect('mongodb://127.0.0.1/google-docs-db');

const io = require("socket.io")(3001, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
})

const defaultValue = ""

io.on("connection", socket => {

    socket.on("get-document",async documentId => {

        //check if a doc already exists in our db for this docId, else
        //create a new empty document
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit("load-document", document.data)
    
        socket.on("send-changes", delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        //save the document
        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })

    
    console.log("connection success!");
})

})

//fun to check if we already have a doc or not
async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
}

  