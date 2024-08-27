import {JSX} from "react";
import LinkButton from "../buttons/LinkButton.tsx";
import './Home.css';

function Home(): JSX.Element {
    return (
        <div className='container'>
            <div className='title'>
                <h1>File Box</h1>
            </div>
            <div id='home-content'>
                <p>
                    File box is a simple, secure, and private file storage service.
                    You can upload files to the server and retrieve them later using a 64-character user key.
                    You can also choose to encrypt your files with a password.
                </p>
                <div id='home-options'>
                    <LinkButton to='/upload' text='Upload'/>
                    <LinkButton to='/retrieve' text='Retrieve'/>
                </div>
            </div>
        </div>
    );
}

export default Home;