import {BrowserRouter, Route, Routes} from "react-router-dom";
import Upload from "./upload/Upload.tsx";
import Retrieve from "./retrieve/Retrieve.tsx";
import Home from "./home/Home.tsx";
import './App.css';
import {JSX} from "react";

function App(): JSX.Element {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" Component={Home}/>
                <Route path="/retrieve" Component={Retrieve}/>
                <Route path="/upload" Component={Upload}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;