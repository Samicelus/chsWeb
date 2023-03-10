FROM node:16-alpine as build-stage
ARG envType
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npm.taobao.org
COPY ./ .
RUN echo "build with envType = $envType"
RUN export NODE_ENV="$envType" && npm run build

FROM nginx:1.19.6 as production-stage
ARG envType
RUN cp -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/src/assets/auth/WW_verify_9Z7kfXk6evIj2GfS.txt /app
RUN echo "begin to copy nginx.$envType.conf config file"
COPY nginx.${envType:-default}.conf /etc/nginx/nginx.conf