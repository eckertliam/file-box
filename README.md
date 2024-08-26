# File Box
## By: Liam Eckert
Upload a file to file box and get a unique key to retrieve the file at any time.
Files can also optionally be encrypted on server side using a password.
## Requirements
- Python 3.6+
- Poetry
- NPM
## Running the server
To run the server:
1. Run `poetry install` to install the required python packages.
2. Run `npm install` to install the required node packages.
3. Run `npm run build` to build the frontend.
4. Run 'poetry run python manage.py makemigrations' to create the migrations.
5. Run 'poetry run python manage.py migrate' to apply the migrations.
6. Run `poetry run python manage.py runserver` to start the API server.
7. Run `npm run start` to start the frontend server.
8. Navigate to `http://localhost:3000` in your browser.
9. You can now upload files to the server.