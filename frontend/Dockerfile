FROM node:latest 
WORKDIR /app
COPY package*.json /app
RUN npm install
COPY . /app
RUN npm run build --prod
RUN npm install -g @angular/cli

EXPOSE 80
CMD ["ng", "serve", "--host", "0.0.0.0"]