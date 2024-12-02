FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# 개발 환경에서는 빌드하지 않고 직접 실행
EXPOSE 3000

# vite를 직접 실행
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]