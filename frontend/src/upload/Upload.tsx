import pako from 'pako';
import React, {JSX, useRef} from "react";
import './Upload.css';

// take a file and returns a compressed blob
async function compress_file(file: File): Promise<Blob> {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    return new Promise<Blob>((resolve, reject) => {
        reader.onload = function() {
            const data = new Uint8Array(reader.result as ArrayBuffer);
            const compressed = pako.deflate(data);
            resolve(new Blob([compressed]));
        }
        reader.onerror = reject;
    })
}

function Upload(): JSX.Element {
    const upload_container = document.getElementById('upload-container');
    const user_key_container = document.getElementById('user-key-container');
    user_key_container?.style.setProperty('display', 'none');

    const fileInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const handleFileChange = () => {
        const file = fileInput.current?.files?.[0];
        const file_name = document.getElementById('file-name');
        if (file && file_name) {
            file_name.textContent = file.name;
        }
    }

    const handleUserKey = (user_key: string) => {
        upload_container?.style.setProperty('display', 'none');
        user_key_container?.style.setProperty('display', 'block');
        const user_key_element = document.getElementById('user-key');
        if (user_key_element) {
            user_key_element.textContent = user_key;
        } else {
            alert('Failed to display user key');
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!fileInput.current?.files?.length) {
            alert('No file selected');
            return;
        }
        const file = fileInput.current.files[0];
        const compressed = await compress_file(file);
        const password = passwordInput.current?.value;
        const formData = new FormData();
        formData.append('file', compressed);
        if (password) {
            formData.append('password', password);
        }
        // TODO: place the actual api endpoint here
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            alert(`Error: ${response.status} ${response.statusText}`);
            return;
        }
        const data = await response.json();
        if (!data.user_key) {
            alert('Failed to upload file no user key');
            return;
        }
        handleUserKey(data.user_key);
    }

    return (
        <div className='container'>
            <div className='title'>
                <h2>Upload</h2>
            </div>
            <div id='upload-container'>
                <p>
                    The file will be compressed before being uploaded.
                    <br/>
                    Optionally, you can provide a password to encrypt the file.
                </p>
                <form onSubmit={handleSubmit}>
                    <div id='file-input'>
                        <input type="file" id='file' ref={fileInput} required={true} onChange={handleFileChange}/>
                        <label htmlFor='file'>
                            Select file <p id='file-name'></p>
                        </label>
                    </div>
                    <br/>
                    <div id='password-input'>
                        <input id='password' type="password" ref={passwordInput} placeholder='Password'/>
                    </div>
                    <br/>
                    <button id='upload-btn' type="submit">Upload</button>
                </form>
            </div>
            <div id='user-key-container'>
                <p>
                    Your file has been uploaded. Here is your user key:
                </p>
                <p id='user-key'></p>
                <p>
                    Keep this key safe. You will need it to retrieve your file.
                    This is the only chance you will have to see this key.
                </p>
            </div>
        </div>
    )
}

export default Upload;