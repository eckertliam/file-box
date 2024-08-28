import pako from 'pako';
import {JSX, useRef} from "react";
import './Upload.css';
import LinkButton from "../buttons/LinkButton.tsx";
import PrimaryButton from "../buttons/PrimaryButton.tsx";
import Heading from "../Heading/Heading.tsx";

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
    const keyElement = useRef<HTMLDivElement>(null);
    const userKeyText = useRef<HTMLParagraphElement>(null);
    const fileBtn = document.getElementById('file-btn');

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
        if (fileBtn) {
            fileBtn.textContent = 'Select File';
        }
    }

    const handleFileChange = () => {
        const file = fileInput.current?.files?.[0];
        if (file && fileBtn) {
            fileBtn.textContent = file.name;
        }
    }

    const handleUserKey = (userKey: string) => {
        resetForm();
        const keyContainer = keyElement.current;
        // display key element
        if (keyContainer) {
            keyContainer.style.display = 'block';
        }
        const keyText = userKeyText.current;
        if (keyText) {
            keyText.textContent = userKey;
        }
    }

    const handleSubmit = async () => {
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
            <Heading text='Upload'/>
            <LinkButton text='Home' to='/'/>
            <p>
                The file will be compressed before being uploaded.
                <br/>
                Optionally, you can provide a password to encrypt the file.
            </p>
            <form onSubmit={e => {e.preventDefault();}}>
                <input type="file" id='file' ref={fileInput} required={true} onChange={handleFileChange}/>
                <PrimaryButton id='file-btn' text='Select File' fn={() => fileInput.current?.click()}/>
                <br/>
                <div id='password-input'>
                    <input id='password' type="password" ref={passwordInput} placeholder='Password'/>
                </div>
                <br/>
                <PrimaryButton text='Upload' fn={handleSubmit}/>
            </form>
            <div id='user-key' ref={keyElement}>
                <h2>User Key:</h2>
                <p ref={userKeyText}></p>
                <p>Keep this key safe and be sure to copy it down now, this is your one chance.</p>
            </div>
        </div>
    )
}

export default Upload;