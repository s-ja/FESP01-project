# DB 연결 문제 분석 및 해결 방안

## 문제 현상

```
Error: getaddrinfo ENOTFOUND fesp-db.aws2.store
code: 'ENOTFOUND'
syscall: 'getaddrinfo'
hostname: 'fesp-db.aws2.store'
```

**핵심 문제**: DNS 조회 실패 - `fesp-db.aws2.store` 호스트명을 찾을 수 없음

## 원인 분석

### 1. 환경 변수 설정 불일치

#### 현재 설정 흐름

1. **package.json의 start 스크립트**:
   ```json
   "start": "cross-env NODE_ENV=modi node -r dotenv/config ./bin/www-prod.js"
   ```
   - `NODE_ENV=modi`로 설정됨

2. **config/index.js의 환경 변수 로딩**:
   ```javascript
   dotenv.config({ path: ".env" });
   if (process.env.NODE_ENV) {
     dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
   }
   ```
   - `.env` 파일 로드
   - `.env.modi` 파일 로드 (override: true로 덮어쓰기)

3. **dbUtil.js의 URL 생성 로직**:
   ```javascript
   if (
     process.env.NODE_ENV === "production" ||
     process.env.NODE_ENV === "development" ||
     (process.env.DB_HOST && process.env.DB_HOST.endsWith(".aws2.store"))
   ) {
     // 인증 정보 포함 URL 생성
     url = `${DBConfig.protocol}://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}:${DBConfig.port}/${DBConfig.database}`;
   } else {
     // 인증 정보 없는 URL 생성
     url = `${DBConfig.protocol}://${DBConfig.host}:${DBConfig.port}`;
   }
   ```

#### 문제점

- **Koyeb 배포 환경**에서는 `fesp-db.aws2.store`에 접근할 수 없음
  - 이 호스트는 내부 네트워크 또는 특정 환경에서만 접근 가능한 것으로 보임
  - Koyeb 서버는 외부 네트워크에서 실행되므로 해당 호스트를 찾을 수 없음

- **환경별 설정 파일 불일치**
  - `.env.modi`: 로컬/내부 환경용 설정 (`fesp-db.aws2.store`)
  - Koyeb 배포 환경: MongoDB Atlas 사용 필요 (`database.qvoynvk.mongodb.net`)

### 2. dbUtil.js의 URL 생성 조건

현재 코드는 다음 조건에서 인증 정보 포함 URL을 생성합니다:
- `NODE_ENV === "production"`
- `NODE_ENV === "development"`  
- `DB_HOST.endsWith(".aws2.store")`

**문제**: `NODE_ENV=modi`인 경우, `DB_HOST.endsWith(".aws2.store")` 조건이 true여도 `.aws2.store` 호스트가 외부에서 접근 불가능하면 연결 실패

## 해결 방안

### 방안 1: Koyeb 환경 변수 직접 설정 (권장)

Koyeb 대시보드에서 다음 환경 변수를 설정:

```bash
# MongoDB Atlas 연결 정보 (Koyeb 배포 환경용)
DB_PROTOCOL=mongodb+srv
DB_HOST=database.qvoynvk.mongodb.net
DB_PORT=27017
DB_DATABASE=openmarket
DB_USER=ins
DB_PASSWORD=ins12$$

# 애플리케이션 설정
NODE_ENV=production  # 또는 modi (하지만 production 권장)
API_HOST=https://modi-ip3-modi.koyeb.app
APP_HOST=http://localhost
```

**장점**:
- 환경별 설정 파일에 의존하지 않음
- 배포 환경에서 즉시 적용 가능
- 보안상 민감한 정보를 코드 저장소와 분리

**실행 방법**:
1. Koyeb 대시보드 → 해당 서비스 → Settings → Environment Variables
2. 위 환경 변수들을 추가/수정
3. 서비스 재배포 또는 재시작

### 방안 2: NODE_ENV에 따른 분기 처리 개선

`dbUtil.js`의 URL 생성 로직을 개선하여 MongoDB Atlas 연결을 더 명확하게 처리:

```javascript
// 현재 코드
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development" ||
  (process.env.DB_HOST && process.env.DB_HOST.endsWith(".aws2.store"))
) {
  // 인증 정보 포함 URL
}

// 개선된 코드
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "development" ||
  (process.env.DB_HOST && (
    process.env.DB_HOST.endsWith(".aws2.store") ||
    process.env.DB_HOST.includes("mongodb.net")
  ))
) {
  // MongoDB Atlas 또는 내부 DB용 인증 정보 포함 URL
  if (DBConfig.protocol === "mongodb+srv") {
    url = `${DBConfig.protocol}://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}`;
  } else {
    url = `${DBConfig.protocol}://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}:${DBConfig.port}/${DBConfig.database}`;
  }
} else {
  // 로컬 환경용 인증 정보 없는 URL
  url = `${DBConfig.protocol}://${DBConfig.host}:${DBConfig.port}`;
}
```

### 방안 3: 환경 변수 검증 로직 추가

서버 시작 전에 필수 환경 변수를 검증하는 로직 추가:

```javascript
// config/index.js 또는 별도 파일
export const validateConfig = () => {
  const required = ['DB_PROTOCOL', 'DB_HOST', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`필수 환경 변수가 설정되지 않았습니다: ${missing.join(', ')}`);
  }
  
  // DB_HOST가 접근 가능한지 확인 (선택적)
  if (process.env.DB_HOST.includes('aws2.store') && 
      process.env.NODE_ENV !== 'local' && 
      process.env.NODE_ENV !== 'development') {
    logger.warn('내부 네트워크 호스트를 프로덕션 환경에서 사용하고 있습니다. MongoDB Atlas 사용을 권장합니다.');
  }
};
```

## .env.modi 파일 구조 (예상)

`.env.modi` 파일은 다음과 같은 구조일 것으로 예상됩니다:

```bash
# MongoDB 연결 설정 (내부 네트워크용)
DB_PROTOCOL=mongodb
DB_HOST=fesp-db.aws2.store
DB_PORT=27017
DB_DATABASE=team03db
DB_USER=<사용자명>
DB_PASSWORD=<비밀번호>

# 애플리케이션 설정
NODE_ENV=modi
API_HOST=<API 호스트>
APP_HOST=<앱 호스트>
```

**중요**: 이 파일의 설정은 **내부 네트워크 또는 특정 환경에서만 사용 가능**합니다.

## 즉시 실행해야 하는 조치

### 1단계: Koyeb 환경 변수 확인 및 설정

Koyeb 대시보드에서 다음을 확인:

1. **현재 설정된 환경 변수 확인**
   - Settings → Environment Variables
   - `NODE_ENV`, `DB_*` 변수들이 올바르게 설정되어 있는지 확인

2. **필수 환경 변수 설정** (없는 경우)
   ```
   NODE_ENV=production
   DB_PROTOCOL=mongodb+srv
   DB_HOST=database.qvoynvk.mongodb.net
   DB_PORT=27017
   DB_DATABASE=openmarket
   DB_USER=ins
   DB_PASSWORD=ins12$$
   ```

### 2단계: MongoDB Atlas 접근 확인

1. **IP 화이트리스트 확인**
   - MongoDB Atlas → Network Access
   - Koyeb 서버의 IP 주소가 허용 목록에 있는지 확인
   - 또는 `0.0.0.0/0` (모든 IP 허용) 설정 확인

2. **사용자 권한 확인**
   - MongoDB Atlas → Database Access
   - `ins` 사용자가 올바른 권한을 가지고 있는지 확인

### 3단계: 서비스 재시작

환경 변수 설정 후:
1. Koyeb 대시보드에서 서비스 재시작
2. 또는 자동 재배포 트리거 (git push 등)

### 4단계: 로그 확인

재시작 후 로그에서 다음을 확인:

✅ **정상적인 경우**:
```
MongoDB 연결 시도 중... (1/3)
DB 접속 성공: mongodb+srv://***:***@database.qvoynvk.mongodb.net
MongoDB 컬렉션 초기화 완료
MongoDB 연결 확인 완료. 서버를 시작합니다.
API 서버 구동 완료.
```

❌ **여전히 문제가 있는 경우**:
- 환경 변수가 제대로 로드되지 않았는지 확인
- MongoDB Atlas 연결 오류 메시지 확인
- 네트워크 접근 권한 확인

## 추가 권장 사항

### 1. 환경별 설정 분리

- **로컬 개발**: `.env.local` 또는 `.env.modi` 사용
- **배포 환경**: Koyeb 환경 변수로 직접 설정 (`.env` 파일 사용 안 함)

### 2. 설정 검증 스크립트

배포 전에 설정을 검증하는 스크립트 실행:

```bash
npm run test:modi  # 또는 test:prod
```

### 3. 연결 타임아웃 조정

현재 `serverSelectionTimeoutMS: 10000` (10초)으로 설정되어 있습니다. 
네트워크 지연이 있는 경우 이 값을 조정할 수 있습니다.

## 요약

1. **현재 문제**: Koyeb 배포 환경에서 내부 네트워크 호스트 `fesp-db.aws2.store`에 접근 시도 → DNS 조회 실패

2. **해결 방법**: Koyeb 환경 변수를 MongoDB Atlas 설정으로 변경

3. **즉시 조치**: 
   - Koyeb 대시보드에서 환경 변수 설정
   - MongoDB Atlas 접근 권한 확인
   - 서비스 재시작

4. **코드 수정 사항**: 
   - 현재 세션에서 DB 연결 초기화 타이밍 문제는 해결됨 ✅
   - 추가로 환경 변수 검증 로직을 추가하면 더 안전함

