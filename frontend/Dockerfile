FROM node:18-alpine

# 필수 패키지 설치
RUN apk add --no-cache python3 build-base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# 빌드 수행
RUN npm run build

# 3000 포트를 외부에 노출
EXPOSE 3000

# 빌드 후 preview 서버 실행 (0.0.0.0에서 바인딩)
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]