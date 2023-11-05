import {useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import {io} from 'socket.io-client'
import { useParams } from "react-router-dom"

//save our doc after every 2 sec
const SAVE_INTERVAL_MS = 2000

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]

function TextEditor() {

    const { id: documentId } = useParams()
    const [socket,setSocket] = useState();
    const [quill,setQuill] = useState();

    //client connects to the server using this function by making an io
    //request on server port 3001, at the end we disconnect
    //useEffect is creating our socket for us & 
    //disconnecting it when we no longer need it
    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s)

        return () => {
          s.disconnect()
        }
    }, []
    )
    
    //to fetch the contents of our doc with doc Id
    useEffect(() => {
        if (socket == null || quill == null) return
    
        socket.once("load-document", document => {
          quill.setContents(document)
          quill.enable()
        })
    
        socket.emit("get-document", documentId)
      }, [socket, quill, documentId]
    )

    //to save our doc after every 2 sec
    useEffect(() => {
        if (socket == null || quill == null) return
    
        const interval = setInterval(() => {
          socket.emit("save-document", quill.getContents())
        }, SAVE_INTERVAL_MS)
    
        return () => {
          clearInterval(interval)
        }
      }, [socket, quill]
    )
    
    
    /*
    update changes in document from other clients
    multiple client can make changes to doc at the same time
    and it will be visible to all clients.
    */
    useEffect(() => {
        if (socket == null || quill == null) return
    
        const handler = delta => {
          quill.updateContents(delta)
        }
        socket.on("receive-changes", handler)
    
        return () => {
          socket.off("receive-changes", handler)
        }
      }, [socket, quill]
    )
    
    
    /*
    below useEffect uses quill.on("text change") method to detect changes made
    by user in document. This chage is rep as delta.

    The event handler fun then sends the user changes from client to server
    using emit() method.

    turn off the quill.on() method.
    */
    useEffect(() => {
        if (socket == null || quill == null) return
    
        const handler = (delta, oldDelta, source) => {
          if (source !== "user") return
          //send changes to server 
          socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)
    
        return () => {
          quill.off("text-change", handler)
        }
      }, [socket, quill]
    )

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return
    
        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)

        const q = new Quill(editor, {
          theme: "snow",
          modules: { toolbar: TOOLBAR_OPTIONS }
        })
        q.disable()
        q.setText("Loading...")
        setQuill(q)
        }, []
    )

    return <div className="container" ref={wrapperRef}></div>
}

export default TextEditor;
