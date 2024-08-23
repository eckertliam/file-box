from django import forms

class UploadFileForm(forms.Form):
    file = forms.FileField()
    password = forms.CharField(max_length=255, required=False)

    def is_valid(self) -> bool:
        return super().is_valid() and self.cleaned_data.get('file') is not None

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.file is None:
            raise forms.ValidationError('File is required')

class RetrieveFileForm(forms.Form):
    user_key = forms.CharField(max_length=255)
    password = forms.CharField(max_length=255, required=False)

    def is_valid(self) -> bool:
        return super().is_valid() and self.cleaned_data.get('user_key') is not None

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.user_key is None:
            raise forms.ValidationError('User key is required')
