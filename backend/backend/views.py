import logging

from django.utils import timezone
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response

from .crypto import *
from .forms import RetrieveFileForm, UploadFileForm
from .models import FileBlob

def retrieve_file(request: Request):
    if request.method == 'POST':
        form = RetrieveFileForm(request.data)
        if not form.is_valid():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user_key = form.cleaned_data['user_key']
        password = form.cleaned_data['password']
        file_blob: FileBlob = FileBlob.objects.get(user_key=user_key)
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
                logging.error(e)
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        file_blob.save()
        return Response(file_blob.data)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


def upload_file(request: Request):
    if request.method == 'POST':
        form = UploadFileForm(request.data)
        if not form.is_valid():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        file_blob = FileBlob()
        file_blob.data = form.cleaned_data['file'].read()
        file_blob.user_key = generate_user_key()
        password = form.cleaned_data['password']
        if password is not None:
            # encrypt the file and enter the encryption data into the database
            encryption_obj = encrypt_blob(file_blob.data, password)
            file_blob.data = encryption_obj['cipher_blob']
            file_blob.nonce = encryption_obj['nonce']
            file_blob.tag = encryption_obj['tag']
            file_blob.is_encrypted = True
        file_blob.save()
        return Response(status=status.HTTP_201_CREATED)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)