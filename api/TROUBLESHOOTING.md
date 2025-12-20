# 문제 해결 가이드

## 1. EPERM (Permission Denied) 에러

### 원인
- `node_modules` 파일 접근 권한 문제
- Sandbox 환경 제한 (개발 환경)
- `cross-env` 패키지 의존성 문제

### 해결 방법

#### 방법 1: node_modules 재설치
```bash
cd api
rm -rf node_modules package-lock.json
npm install
```

#### 방법 2: 권한 확인
```bash
# node_modules 권한 확인
ls -la node_modules/path-key/

# 필요시 권한 수정 (주의: 신중하게 실행)
chmod -R 755 node_modules/
```

#### 방법 3: cross-env 없이 직접 실행
```bash
# package.json의 스크립트 대신 직접 실행
NODE_ENV=modi node -r dotenv/config ./test-production.js
```

---

## 2. 환경 변수 로드 문제

### 원인
- `-r dotenv/config`는 기본 `.env` 파일만 로드
- 환경별 `.env.${NODE_ENV}` 파일은 수동 로드 필요
- `config/index.js`와 `test-production.js`에서 중복 로드

### 확인 사항

1. **`.env.modi` 파일 존재 확인**
   ```bash
   ls -la api/.env.modi
   ```

2. **환경 변수 로드 순서 확인**
   - `-r dotenv/config`: 기본 `.env` 로드
   - `test-production.js`: `.env` + `.env.${NODE_ENV}` 로드
   - `config/index.js`: `.env` + `.env.${NODE_ENV}` 로드 (중복)

3. **필수 환경 변수 확인**
   - `DB_PROTOCOL`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_DATABASE`
   - `DB_USER`
   - `DB_PASSWORD`

### 해결 방법

#### 방법 1: 환경 변수 확인 스크립트 실행
```bash
cd api
NODE_ENV=modi node -e "
import('dotenv').then(dotenv => {
  dotenv.config({ path: '.env' });
  dotenv.config({ override: true, path: '.env.modi' });
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);
});
"
```

#### 방법 2: 직접 테스트
```bash
# 환경 변수 로드 확인
NODE_ENV=modi node -r dotenv/config -e "
const dotenv = require('dotenv');
dotenv.config({ override: true, path: '.env.modi' });
console.log(process.env.DB_HOST);
"
```

---

## 3. MongoDB 연결 문제

### 확인 사항

1. **MongoDB 연결 정보 확인**
   ```bash
   # .env.modi 파일에서 확인
   grep DB_ api/.env.modi
   ```

2. **연결 테스트**
   ```bash
   npm run test:connection
   ```

3. **연결 타임아웃 확인**
   - `dbUtil.js`의 `connectTimeoutMS` 설정 확인
   - 네트워크 방화벽 확인

### 해결 방법

1. **연결 정보 재확인**
   - MongoDB Atlas인 경우: IP 화이트리스트 확인
   - 로컬 MongoDB인 경우: 서비스 실행 확인

2. **연결 재시도 로직 확인**
   - `dbUtil.js`의 `connectWithRetry` 함수 확인
   - 최대 재시도 횟수: 3회
   - 재시도 간격: 5초

---

## 4. GridFsStorage 초기화 문제

### 원인
- MongoDB 연결이 완료되기 전에 GridFsStorage 초기화 시도
- `db` 객체가 `undefined`인 상태에서 초기화

### 확인 사항

1. **초기화 순서 확인**
   - MongoDB 연결 완료 → GridFsStorage 초기화
   - `routes/user/files.js`의 지연 초기화 로직 확인

2. **에러 메시지 확인**
   ```
   Error: Error creating storage engine. At least one of url or db option must be provided.
   ```

### 해결 방법

1. **지연 초기화 확인**
   - `routes/user/files.js`의 `initStorage()` 함수 확인
   - 첫 요청 시에만 초기화되도록 구현됨

2. **수동 테스트**
   ```bash
   # 서버 시작 후 파일 업로드 API 테스트
   npm run start
   # 다른 터미널에서
   curl -X POST http://localhost:3000/api/user/files \
     -F "attach=@test-file.txt"
   ```

---

## 5. 앱 모듈 로드 문제

### 확인 사항

1. **swagger-output.json 파일 확인**
   ```bash
   ls -la api/swagger-output.json
   ```

2. **app.js import 확인**
   - `import swaggerFile from './swagger-output.json'` 구문 확인
   - `fs.readFileSync` 방식으로 변경됨

3. **의존성 확인**
   ```bash
   npm list express swagger-ui-express
   ```

### 해결 방법

1. **Swagger 파일 재생성**
   ```bash
   npm run prestart
   ```

2. **앱 모듈 직접 테스트**
   ```bash
   NODE_ENV=modi node -r dotenv/config -e "
   import('./app.js').then(app => {
     console.log('앱 모듈 로드 성공');
   }).catch(err => {
     console.error('앱 모듈 로드 실패:', err);
   });
   "
   ```

---

## 6. 종합 테스트 체크리스트

### 사전 확인
- [ ] `.env.modi` 파일 존재
- [ ] MongoDB 연결 정보 정확
- [ ] `node_modules` 정상 설치
- [ ] `swagger-output.json` 파일 존재

### 단계별 테스트

1. **환경 변수 로드 테스트**
   ```bash
   npm run test:modi
   ```

2. **MongoDB 연결 테스트**
   ```bash
   npm run test:connection
   ```

3. **서버 시작 테스트**
   ```bash
   npm run start
   # Ctrl+C로 종료
   ```

4. **전체 테스트**
   ```bash
   npm run test:modi
   ```

---

## 7. Koyeb 배포 전 체크리스트

### 로컬 테스트
- [ ] `npm run test:modi` 성공
- [ ] `npm run start` 정상 시작
- [ ] MongoDB 연결 성공
- [ ] 파일 업로드 기능 정상

### Koyeb 설정
- [ ] 환경 변수 설정 (`.env.modi` 내용)
- [ ] `NODE_ENV=modi` 설정 (또는 `start` 스크립트 확인)
- [ ] MongoDB 연결 정보 설정
- [ ] 포트 설정 (기본: 3000)

### 배포 후 확인
- [ ] 서버 로그 확인
- [ ] Health check 통과
- [ ] API 엔드포인트 응답 확인

---

## 8. 자주 발생하는 에러와 해결

### 에러 1: `SyntaxError: Unexpected identifier 'assert'`
**원인**: `import ... assert {type: 'json'}` 구문 호환성 문제
**해결**: `app.js`에서 `fs.readFileSync` 방식으로 변경됨

### 에러 2: `Error creating storage engine`
**원인**: MongoDB 연결 전 GridFsStorage 초기화
**해결**: `routes/user/files.js`에서 지연 초기화 구현됨

### 에러 3: `EPERM: operation not permitted`
**원인**: 파일 시스템 권한 문제
**해결**: `node_modules` 재설치 또는 권한 수정

### 에러 4: `MongoDB 연결 시간 초과`
**원인**: 네트워크 또는 연결 정보 문제
**해결**: 연결 정보 확인 및 방화벽 설정 확인

---

## 9. 디버깅 팁

### 로그 확인
```bash
# 개발 환경 로그
tail -f api/logs/log.log

# 실시간 로그 확인
npm run start 2>&1 | tee debug.log
```

### 환경 변수 확인
```bash
# 현재 로드된 환경 변수 확인
NODE_ENV=modi node -r dotenv/config -e "
const dotenv = require('dotenv');
dotenv.config({ override: true, path: '.env.modi' });
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
"
```

### 모듈 로드 확인
```bash
# 특정 모듈 로드 테스트
NODE_ENV=modi node -r dotenv/config -e "
import('./utils/dbUtil.js').then(db => {
  console.log('dbUtil 로드 성공');
}).catch(err => {
  console.error('dbUtil 로드 실패:', err);
});
"
```

---

## 10. 연락처 및 추가 도움

문제가 지속되면:
1. 에러 메시지 전체 복사
2. 환경 정보 확인 (OS, Node.js 버전)
3. 로그 파일 확인
4. GitHub Issues 또는 팀 채널에 문의

