import base64
import logging

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
        user_key = request.data.get('user_key')
        password = request.data.get('password')
        if user_key is None:
            return Response(status=status.HTTP_400_BAD_REQUEST, data='No user key provided')
        file_blob = None
        try:
            file_blob = FileBlob.objects.get(user_key=user_key)
        except FileBlob.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, data='File not found')
        print(file_blob)
        file_blob.accessed_at = timezone.now()
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
            # decrypt blob and return the plain blob
            try:
                plain_blob = decrypt_blob(decrypt_data, password)
                return Response(plain_blob)
            except ValueError as e:
                logging.error('Error decrypting file %s: %s', file_blob.user_key, str(e))
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        file_blob.save()
        base64_blob = base64.b64encode(file_blob.data).decode('utf-8')
        return Response(data=base64_blob, status=status.HTTP_200_OK, content_type='text/plain')
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def upload_file(request: Request):
    if request.method == 'POST':
        file_bytes = request.FILES.get('file').read()
        if len(file_bytes) == 0:
            return Response(status=status.HTTP_400_BAD_REQUEST, data='File is empty')
        file_blob = FileBlob()
        file_blob.data = file_bytes
        file_blob.user_key = generate_user_key()
        password = request.data.get('password')
        if password is not None:
            # encrypt the file and enter the encryption data into the database
            encryption_obj = encrypt_blob(file_blob.data, password)
            file_blob.data = encryption_obj['cipher_blob']
            file_blob.nonce = encryption_obj['nonce']
            file_blob.tag = encryption_obj['tag']
            file_blob.salt = encryption_obj['salt']
            file_blob.is_encrypted = True
        file_blob.save()
        response_obj = {
            'user_key': file_blob.user_key,
        }
        return Response(response_obj, status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
