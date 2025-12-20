# 환경 변수 덮어쓰기 문제 분석

## 문제 상황

### 현재 코드 동작

```javascript
// config/index.js
dotenv.config({ path: ".env" });
if (process.env.NODE_ENV) {
  dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
}
```

### 문제점

1. **`override: true` 옵션의 의미**
   - 파일의 값이 **기존 `process.env` 값을 덮어씁니다**
   - Koyeb에서 설정한 환경 변수도 `process.env`에 있으므로 덮어써집니다

2. **실행 순서**
   ```
   Koyeb 환경 변수 설정 → process.env에 로드
   ↓
   config/index.js 실행
   ↓
   dotenv.config({ path: ".env" }) → .env 파일 로드 (덮어쓰기 없음, 하지만 파일 값이 있으면 덮어씀)
   ↓
   dotenv.config({ override: true, path: `.env.${NODE_ENV}` }) → .env.modi 파일 로드 (기존 값 덮어쓰기)
   ↓
   결과: Koyeb 환경 변수가 .env.modi의 값으로 덮어써짐 ❌
   ```

3. **실제 발생하는 문제**
   - Koyeb에서 `DB_HOST=database.qvoynvk.mongodb.net` 설정
   - `.env.modi` 파일에 `DB_HOST=fesp-db.aws2.store` 존재
   - 결과: `DB_HOST=fesp-db.aws2.store`가 사용됨 (내부 네트워크 호스트)
   - Koyeb 서버에서 DNS 조회 실패 → 연결 불가

## 해결 방안

### 방안 1: 환경 변수가 이미 설정되어 있으면 파일을 로드하지 않기 (권장)

프로덕션/배포 환경에서는 환경 변수가 이미 설정되어 있으므로, 파일을 로드하지 않도록 수정:

```javascript
// config/index.js
import logger from "../utils/logger.js";
import dotenv from "dotenv";

// 프로덕션 환경 또는 환경 변수가 이미 설정된 경우 파일 로드 건너뛰기
const isProduction = process.env.NODE_ENV === 'production';
const envVarAlreadySet = process.env.DB_HOST && process.env.DB_DATABASE;

if (!isProduction && !envVarAlreadySet) {
  // 개발/로컬 환경에서만 .env 파일 로드
  dotenv.config({ path: ".env" });
  if (process.env.NODE_ENV) {
    dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
  }
} else {
  logger.log("환경 변수가 이미 설정되어 있거나 프로덕션 환경입니다. .env 파일을 로드하지 않습니다.");
}

export const db = {
  protocol: process.env.DB_PROTOCOL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
```

### 방안 2: override 옵션 제거 (부분적 해결)

기존 환경 변수가 있으면 덮어쓰지 않도록:

```javascript
// config/index.js
dotenv.config({ path: ".env" }); // override 없음 (기본값: false)
if (process.env.NODE_ENV) {
  dotenv.config({ override: false, path: `.env.${process.env.NODE_ENV}` }); // override: false
}
```

**주의**: 이 방법은 완전한 해결책이 아닙니다. 파일이 먼저 로드되고 환경 변수가 나중에 설정되는 경우도 있을 수 있습니다.

### 방안 3: .env 파일들을 git에서 제거 (권장 + 보안)

1. **.gitignore에 추가** (이미 되어 있을 수 있음)
   ```
   .env
   .env.*
   !.env.example
   ```

2. **git에서 제거** (이미 추적 중인 파일들)
   ```bash
   git rm --cached .env.aws .env.edutube .env.essentia .env.hanmogeum .env.modi .env.myparking .env.orummarket .env.ssm
   git commit -m "Remove .env files from git tracking"
   ```

3. **config/index.js 수정** (방안 1과 함께 사용)

### 방안 4: 배포 환경 감지 로직 추가

Koyeb이나 다른 클라우드 환경에서는 파일을 로드하지 않도록:

```javascript
// config/index.js
const isCloudDeployment = process.env.KOYEB_APP || process.env.VERCEL || process.env.HEROKU || process.env.RAILWAY;

if (!isCloudDeployment) {
  // 로컬/개발 환경에서만 .env 파일 로드
  dotenv.config({ path: ".env" });
  if (process.env.NODE_ENV) {
    dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
  }
} else {
  logger.log("클라우드 배포 환경이 감지되었습니다. .env 파일을 로드하지 않습니다.");
}
```

## 즉시 조치 사항

### 1. config/index.js 수정 (우선 적용)

환경 변수가 이미 설정되어 있으면 파일을 로드하지 않도록 수정:

```javascript
// 기존 코드
dotenv.config({ path: ".env" });
if (process.env.NODE_ENV) {
  dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
}

// 수정된 코드
// 환경 변수가 이미 설정되어 있으면 .env 파일 로드 건너뛰기
if (!process.env.DB_HOST || !process.env.DB_DATABASE) {
  dotenv.config({ path: ".env" });
  if (process.env.NODE_ENV) {
    dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
  }
} else {
  logger.log("환경 변수가 이미 설정되어 있습니다. .env 파일을 로드하지 않습니다.");
}
```

### 2. .env 파일들을 git에서 제거

```bash
cd api
git rm --cached .env.aws .env.edutube .env.essentia .env.hanmogeum .env.modi .env.myparking .env.orummarket .env.ssm
git commit -m "chore: Remove sensitive .env files from git tracking"
```

### 3. .gitignore 확인

`.gitignore` 파일에 다음이 포함되어 있는지 확인:
```
.env
.env.*
!.env.example
```

## 검증 방법

### 배포 환경에서 환경 변수 확인

배포 후 로그에서 확인:
```
환경 변수가 이미 설정되어 있습니다. .env 파일을 로드하지 않습니다.
NODE_ENV production
DB_HOST database.qvoynvk.mongodb.net  (Koyeb에서 설정한 값이 사용됨)
```

### 로컬 환경에서 확인

로컬에서 환경 변수 없이 실행하면:
```
.env 파일 로드됨
NODE_ENV modi
DB_HOST fesp-db.aws2.store  (.env.modi 파일의 값이 사용됨)
```

## 보안 고려사항

1. **민감한 정보 노출 방지**
   - .env 파일들은 비밀번호, API 키 등 민감한 정보를 포함
   - Git 저장소에 올라가면 보안 위험
   - 이미 올라간 경우 비밀번호 변경 권장

2. **환경별 설정 분리**
   - 로컬 개발: .env.* 파일 사용
   - 배포 환경: 환경 변수로 직접 설정 (Koyeb 대시보드 등)

3. **.env.example 파일 활용**
   - 필수 환경 변수 목록과 예시 값만 포함
   - 실제 값은 포함하지 않음

## 요약

- **문제**: `.env.modi` 등의 파일이 Koyeb 환경 변수를 덮어쓸 수 있음
- **원인**: `dotenv.config({ override: true })` 사용
- **해결**: 환경 변수가 이미 설정되어 있으면 파일을 로드하지 않도록 수정
- **보안**: .env 파일들을 git에서 제거하고 .gitignore에 추가

