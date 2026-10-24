FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4173

COPY package.json ./
COPY . .

RUN mkdir -p /app/data

EXPOSE 4173
CMD ["npm", "start"]
