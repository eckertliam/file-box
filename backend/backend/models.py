from django.db import models
from django.utils import timezone

# a blob representing a file from the user
class FileBlob(models.Model):
    # the file data
    data = models.BinaryField()
    # the time the file was created
    created_at = models.DateTimeField(default=timezone.now)
    # the time the file was last accessed
    accessed_at = models.DateTimeField(default=timezone.now)
    # the key used by the user to retrieve the file 64 char hex string
    user_key = models.CharField(max_length=64, unique=True)
    # below are fields involved in encryption
    # whether the file is encrypted
    is_encrypted = models.BooleanField(default=False)
    # the nonce used in encryption
    nonce = models.BinaryField(null=True)
    # the tag used in encryption
    tag = models.BinaryField(null=True)

    def __str__(self):
        return self.user_key
