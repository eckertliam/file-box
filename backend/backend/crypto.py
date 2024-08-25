import secrets
from typing import Dict
from Crypto.Cipher import AES


def encrypt_blob(plain_blob: bytes, password: str) -> Dict[str, bytes]:
    # convert password to bytes
    pwd_bytes: bytes = password.encode('utf-8')
    # salt and password combined must be 32 bytes
    # but passwords are variable length
    # so the salt is 32 - len(password) bytes
    salt_len: int = 32 - len(pwd_bytes)
    salt: bytes = secrets.token_bytes(salt_len)
    # combine the password and salt
    pwd_bytes += salt
    cipher = AES.new(pwd_bytes, AES.MODE_EAX)
    nonce: bytes = cipher.nonce
    cipher_blob, tag = cipher.encrypt_and_digest(plain_blob)
    return {
        'cipher_blob': cipher_blob,
        'nonce': nonce,
        'tag': tag,
        'salt': salt
    }


def decrypt_blob(decrypt_data: Dict[str, bytes], password: str) -> bytes:
    # convert password to bytes
    pwd_bytes: bytes = password.encode('utf-8')
    # combine the password and salt
    password += decrypt_data['salt']
    cipher = AES.new(password, AES.MODE_EAX, nonce=decrypt_data['nonce'])
    plain_blob: bytes = cipher.decrypt(decrypt_data['cipher_blob'])
    try:
        cipher.verify(decrypt_data['tag'])
        return plain_blob
    except ValueError:
        raise ValueError('Key incorrect or message corrupted')


# generates a 256-bit key for the user
def generate_user_key() -> str:
    return secrets.token_hex(32)

__all__ = ['encrypt_blob', 'decrypt_blob', 'generate_user_key']