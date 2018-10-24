FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/

RUN yarn

ADD src /usr/src/app/src
ADD public /usr/src/app/public

CMD [ "yarn", "start" ]
