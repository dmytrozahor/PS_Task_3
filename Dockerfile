FROM node:20 AS build

WORKDIR /src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

ENV CI=false
RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3050

CMD ["nginx", "-g", "daemon off;"]
