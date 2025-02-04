FROM node:18-alpine

# 필수 패키지 설치
RUN apk add --no-cache python3 build-base

WORKDIR /app

# package.json, package-lock.json 복사 및 설치
COPY package.json package-lock.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# Build Args를 사용해 VITE_API_URL을 빌드 시점에 주입
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# 빌드 수행 (이 때 VITE_API_URL 값이 코드에 포함됩니다)
RUN npm run build

# 3000 포트를 외부에 노출
EXPOSE 3000

# 빌드 후 preview 서버 실행 (0.0.0.0에서 바인딩)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]