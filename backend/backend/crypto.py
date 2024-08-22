from typing import Dict
from Crypto.Cipher import AES


def encrypt_blob(plain_blob: bytes, password: str) -> Dict[str, bytes]:
    cipher = AES.new(password, AES.MODE_EAX)
    nonce = cipher.nonce
    cipher_blob, tag = cipher.encrypt_and_digest(plain_blob)
    return {
        'cipher_blob': cipher_blob,
        'nonce': nonce,
        'tag': tag
    }


def decrypt_blob(decrypt_data: Dict[str, bytes], password: str) -> bytes:
    cipher = AES.new(password, AES.MODE_EAX, nonce=decrypt_data['nonce'])
    plain_blob = cipher.decrypt(decrypt_data['cipher_blob'])
    try:
        cipher.verify(decrypt_data['tag'])
        return plain_blob
    except ValueError:
        raise ValueError('Key incorrect or message corrupted')