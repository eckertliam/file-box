import pako from 'pako';
import {JSX} from "react";
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
    return (
        <>
            <h2>Upload</h2>
            <form>
                <label>
                    Enter your file:
                    <input type="file"/>
                </label>
                <button type="submit">Upload</button>
            </form>
        </>
    )
}

export default Upload;