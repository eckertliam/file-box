from django.db import models
from django.utils import timezone

# a blob representing a file from the user
class FileBlob(models.Model):
    # the path to the file
    path = models.CharField(max_length=255)
    # the file data
    data = models.BinaryField()
    # the time the file was created
    created_at = models.DateTimeField(default=timezone.now)
    # the time the file was last accessed
    accessed_at = models.DateTimeField(default=timezone.now)
    # the key used by the user to retrieve the file
    user_key = models.CharField(max_length=255)

    def __str__(self):
        return self.path
