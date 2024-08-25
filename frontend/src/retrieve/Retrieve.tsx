import pako from "pako";
import React, {JSX, useRef} from "react";
import './Retrieve.css';

// decompresses a binary blob
async function decompress(blob: Blob): Promise<File> {
    const array: Uint8Array = new Uint8Array(await blob.arrayBuffer());
    const decompressed = pako.inflate(array);
    return new File([decompressed], "decompressed");
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
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
        const response = await fetch('api/retrieve_file/', {
            method: 'POST',
            body: formData
        });
        if (response.status !== 200) {
            alert(`Error: ${response.status} ${response.statusText}`);
            return;
        }
        resetForm();
        // get the binary file from the response
        // the file comes as a base64 encoded string
        // so first decode the string to a blob
        const bin64 = await response.text();
        const bin = atob(bin64);
        const array = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
            array[i] = bin.charCodeAt(i);
        }
        const fileBlob = new Blob([array]);
        // decompress the file
        const file = await decompress(fileBlob);
        // create a URL for the file
        const url = URL.createObjectURL(file);
        console.log(url);
    }

    return (
        <div className='container'>
            <div className='title'>
                <h2>Retrieve</h2>
            </div>
            <p>Retrieve a file using a user key</p>
            <form id='retrieve-form' onSubmit={handleSubmit}>
                <label htmlFor='user-key'>User Key: </label>
                <input type='text' id='user-key' required={true} ref={userKeyInput}/>
                <br/>
                <input type='password' id='password' placeholder='Password' ref={passwordInput}/>
                <button type='submit'>Retrieve</button>
            </form>
        </div>
    );
}

export default Retrieve;