import pako from 'pako';
import React, {JSX, useRef} from "react";
import './Upload.css';

// take a file and returns a compressed blob
async function compressFile(file: File): Promise<Blob> {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    return new Promise((resolve, reject) => {
        reader.onload = () => {
            const arrayBuffer = reader.result;
            if (arrayBuffer instanceof ArrayBuffer) {
                const compressed = pako.deflate(arrayBuffer);
                resolve(new Blob([compressed]));
            } else {
                reject('Failed to read file');
            }
        }
        reader.onerror = () => {
            reject(reader.error);
        }
    });
}

async function buildFormData(file: File, password?: string): Promise<FormData> {
    // first compress the file
    const compressedFile: Blob = await compressFile(file);
    // get file mime type
    const mimeType: string = file.type;
    // get file name
    const fileName: string = file.name;
    // create a new FormData object
    const formData = new FormData();
    // append the compressed file
    formData.append('file', compressedFile);
    // append the file name
    formData.append('file_name', fileName);
    // append the file mime type
    formData.append('mime_type', mimeType);
    // if a password was provided, append it
    if (password) {
        formData.append('password', password);
    }
    return formData;
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
        const file: File = fileInput.current.files[0];
        const password: string | undefined = passwordInput.current?.value;
        const formData = await buildFormData(file, password);
        fetch('/api/upload_file/', {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
           handleUserKey(data.user_key);
        }).catch(error => {
            alert('Failed to upload file ' + error);
        });
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