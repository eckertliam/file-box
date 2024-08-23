import pako from 'pako';
import React, {JSX, useRef} from "react";
import './Upload.css';

// take a file and returns a compressed blob
async function compressFile(file: File): Promise<Blob> {
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
    const fileInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        // reset the file input
        const file = fileInput.current;
        if (file) {
            file.value = '';
        }
        // reset the password input
        const password = passwordInput.current;
        if (password) {
            password.value = '';
        }
        // reset the file name
        const fileName = document.getElementById('file-name');
        if (fileName) {
            fileName.textContent = '';
        }
    }

    const handleFileChange = () => {
        const file = fileInput.current?.files?.[0];
        const fileName = document.getElementById('file-name');
        if (file && fileName) {
            fileName.textContent = file.name;
        }
    }

    const handleUserKey = (userKey: string) => {
        resetForm();
        console.log(userKey);
        const userKeyElement = document.getElementById('user-key');
        if (userKeyElement) {
            userKeyElement.textContent = `Your file has been uploaded successfully. The user key is: ${userKey}.\nCopy this key and keep it safe. You will need it to retrieve your file.`;
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
        const compressed = await compressFile(file);
        const password = passwordInput.current?.value;
        const formData = new FormData();
        formData.append('file', compressed);
        if (password) {
            formData.append('password', password);
        }
        // TODO: place the actual api endpoint here
        const response = await fetch('/api/upload_file/', {
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
            <p id='user-key'></p>
        </div>
    )
}

export default Upload;