import {HashRouter, Route, Routes} from "react-router-dom";
import Upload from "./upload/Upload.tsx";
import Retrieve from "./retrieve/Retrieve.tsx";
import Home from "./home/Home.tsx";
import './App.css';
import {JSX} from "react";

function App(): JSX.Element {

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/retrieve" element={<Retrieve />}/>
                <Route path="/upload" element={<Upload />}/>
            </Routes>
        </HashRouter>
    );
}

export default App;