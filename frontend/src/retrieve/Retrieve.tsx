import pako from "pako";
import './Retrieve.css';

// takes a user key and attempts to do the following:
// 1. fetch the compressed and encrypted file from the server
// 2. decrypt the file
// 3. decompress the file
// 4. provide a download link to the user



// decompresses a binary blob
async function decompress(blob: Blob): Promise<File> {
    const array: Uint8Array = new Uint8Array(await blob.arrayBuffer());
    const decompressed = pako.inflate(array);
    return new File([decompressed], "decompressed");
}

