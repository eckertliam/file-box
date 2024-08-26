import logging
import base64

from django.utils import timezone
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .crypto import *
from .models import FileBlob


@api_view(['POST'])
def retrieve_file(request: Request):
    if request.method == 'POST':
        print(request.data)
        user_key = request.data.get('user_key')
        password = request.data.get('password')
        if user_key is None:
            return Response(status=status.HTTP_400_BAD_REQUEST, data='No user key provided')
        file_blob = FileBlob.objects.filter(user_key=user_key).first()
        if file_blob is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        # update the accessed_at field to the current time
        file_blob.accessed_at = timezone.now()
        response_obj = {
            'file': file_blob.data,
            'mime_type': file_blob.mime_type,
            'file_name': file_blob.name
        }
        if file_blob.is_encrypted:
            # decrypt the file if it is encrypted
            if password is None:
                # return a 400 Bad Request response if the file is encrypted and no password is provided
                # the user can't know that a file exists at this key without providing the password
                return Response(status=status.HTTP_400_BAD_REQUEST)
            # the data from the file_blob needed for decryption
            decrypt_data = {
                'cipher_blob': file_blob.data,
                'nonce': file_blob.nonce,
                'tag': file_blob.tag
            }
            # verify none of the fields are None
            if None in decrypt_data.values():
                logging.error('File %s is missing encryption data', file_blob.user_key)
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            plain_blob = decrypt_blob(decrypt_data, password)
            response_obj['file'] = plain_blob
        # convert the file to base64
        response_obj['file'] = base64.b64encode(response_obj['file']).decode('utf-8')
        return Response(response_obj, status=status.HTTP_200_OK, content_type='application/json')
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def upload_file(request: Request):
    if request.method == 'POST':
        file_blob = FileBlob()
        # get the file data and check if it is empty
        file_bytes = request.FILES.get('file').read()
        if len(file_bytes) == 0:
            return Response(status=status.HTTP_400_BAD_REQUEST, data='File is empty')
        file_blob.data = file_bytes
        # generate a user key for the file
        file_blob.user_key = generate_user_key()
        # get the file name
        file_blob.name = request.data.get('file_name')
        # get the file mime type
        file_blob.mime_type = request.data.get('mime_type')
        # get the password for the file
        password = request.data.get('password')
        # if a password is provided, encrypt the file
        if password is not None:
            # encrypt the file and enter the encryption data into the database
            encryption_obj = encrypt_blob(file_blob.data, password)
            # set data to the encrypted data
            file_blob.data = encryption_obj['cipher_blob']
            file_blob.nonce = encryption_obj['nonce']
            file_blob.tag = encryption_obj['tag']
            file_blob.salt = encryption_obj['salt']
            file_blob.is_encrypted = True
        # save the file_blob to the
        try:
            file_blob.save()
            # return the user key to the user
            response_obj = {
                'user_key': file_blob.user_key,
            }
            return Response(response_obj, status=status.HTTP_200_OK, content_type='application/json')
        except Exception as e:
            logging.error('Error saving file_blob: %s', e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
