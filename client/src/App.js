import TextEditor from './TextEditor';
import {
  BrowserRouter as Router,
  Routes,//instead of switch in react-router-dom 6 and above
  Route,
  Navigate, //instead of Redirect in v6
} from "react-router-dom"
import { v4 as uuidV4 } from "uuid"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  )
}

export default App;
