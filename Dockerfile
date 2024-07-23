FROM ubuntu:20.04

RUN apt-get update

RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

RUN apt-get install tesseract-ocr tesseract-ocr-deu libtesseract-dev -y
RUN apt-get install antiword -y
RUN apt-get install poppler-utils -y
RUN apt-get install pdftk -y
RUN apt-get install ghostscript -y


WORKDIR /textract-server

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]
