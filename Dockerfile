# Choose the version of python for the base image
FROM python:3.13

# Set the working directory in the container (this directory will be created if it doesn't exist, and it will be the directory where all the files are located)
WORKDIR /code

#Copy the requirements.txt file to the container
COPY ./requirements.txt /code/requirements.txt

# Install the dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the backend directory to the container
COPY ./backend /code/backend

# Change the directory to the backend directory
WORKDIR /code/backend

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]

#To create the image, run the following command:
#docker build -t myimage .

#To run the container from the image, run the following command:
#docker run -d --name mycontainer -p 80:80 myimage