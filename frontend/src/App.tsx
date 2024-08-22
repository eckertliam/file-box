import { BrowserRouter, Route }  from "react-router-dom";
import Upload from "./upload/Upload.tsx";
import './App.css';
import {JSX} from "react";

function App(): JSX.Element {
    return (
        <BrowserRouter>
            <h1>File Box</h1>
            <Route path="/upload" Component={Upload}/>
        </BrowserRouter>
    );
}

export default App;