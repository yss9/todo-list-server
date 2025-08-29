# 1. 베이스 이미지 설정 (Node.js 18 버전의 가벼운 Alpine Linux)
FROM node:18-alpine

# 2. 컨테이너 내부에 앱을 저장할 작업 디렉토리 생성
WORKDIR /usr/src/app

# 3. package.json과 package-lock.json 파일을 작업 디렉토리로 복사
# (소스 코드 전체를 복사하기 전에 의존성만 먼저 설치하여 빌드 캐시를 활용)
COPY package*.json ./

# 4. 의존성 패키지 설치
RUN npm install

# 5. 프로젝트의 모든 소스 코드를 작업 디렉토리로 복사
COPY . .

# 6. 컨테이너가 외부와 통신할 포트 번호 명시
EXPOSE 3000

# 7. 컨테이너가 시작될 때 실행할 기본 명령어 설정
CMD [ "node", "server.js" ]