FROM node:alpine AS build 
WORKDIR /dist/src/app

RUN npm cache clean --force

COPY . . 
RUN npm install
RUN npm run build --prod

FROM nginx:alpine AS ngi
COPY --from=build /dist/src/app/dist/chess /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
