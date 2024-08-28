import pako from "pako";
import {JSX, useRef} from "react";
import './Retrieve.css';
import LinkButton from "../buttons/LinkButton.tsx";
import Heading from "../Heading/Heading.tsx";
import PrimaryButton from "../buttons/PrimaryButton.tsx";

// convert base64 string to a blob
function base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray]);
}

// decompresses a binary blob and return the decompressed blob
async function decompress(blob: Blob): Promise<Blob> {
    const array: Uint8Array = new Uint8Array(await blob.arrayBuffer());
    const decompressed = pako.inflate(array);
    return new Blob([decompressed]);
}

// takes a binary blob, file name, and mime type. First decompresses the blob, then returns the file
async function buildFile(blob: Blob, fileName: string, mimeType: string): Promise<File> {
    const decompressed: Blob = await decompress(blob);
    return new File([decompressed], fileName, {type: mimeType});
}

function Retrieve(): JSX.Element {
    const userKeyInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        // reset the user key input
        const userKey = userKeyInput.current;
        if (userKey) {
            userKey.value = '';
        }
        // reset the password input
        const password = passwordInput.current;
        if (password) {
            password.value = '';
        }
    }

    const handleSubmit = async () => {
        const userKey = userKeyInput.current?.value;
        const password = passwordInput.current?.value;
        if (!userKey) {
            alert('User key is required');
            return;
        }
        const formData = new FormData();
        formData.append('user_key', userKey);
        if (password) {
            formData.append('password', password);
        }
        fetch('/api/retrieve_file/', {
            method: 'POST',
            body: formData,
        }).then(response => response.json()).then(async data => {
            const binary = base64ToBlob(data.file);
            const file = await buildFile(binary, data.file_name, data.mime_type);
            // create a URL for downloading the file then click the link to download
            const fileUrl = URL.createObjectURL(file);
            const downloadLink = document.createElement('a');
            downloadLink.href = fileUrl;
            downloadLink.download = file.name;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            // cleanup
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(fileUrl);
            resetForm();
        }).catch(error => {
            console.error('Failed to retrieve file:', error);
            alert('Failed to retrieve file');
        });
    }

    return (
        <div className='container'>
            <Heading text='Retrieve'/>
            <LinkButton text='Home' to='/' />
            <p>Retrieve a file using a user key</p>
            <form id='retrieve-form' onSubmit={e => e.preventDefault()}>
                <label htmlFor='user-key'>User Key: </label>
                <input type='text' id='user-key' required={true} ref={userKeyInput}/>
                <br/>
                <input type='password' id='password' placeholder='Password' ref={passwordInput}/>
                <PrimaryButton text='Retrieve' fn={handleSubmit}/>
            </form>
        </div>
    );
}

export default Retrieve;