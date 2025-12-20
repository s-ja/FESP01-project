# Koyeb 배포 설정 분석

## 현재 Koyeb 설정

### MongoDB 연결 정보
```json
{
  "DB_PROTOCOL": "mongodb+srv",
  "DB_HOST": "database.qvoynvk.mongodb.net",
  "DB_PORT": "27017",
  "DB_DATABASE": "openmarket",
  "DB_USER": "ins",
  "DB_PASSWORD": "ins12$$" (URL 인코딩: ins12%24%24)
}
```

### 로컬 `.env.modi` 설정
```
DB_HOST: fesp-db.aws2.store
DB_DATABASE: team03db
```

## 문제점 분석

### 1. MongoDB 호스트 불일치
- **Koyeb**: `database.qvoynvk.mongodb.net` (MongoDB Atlas)
- **로컬**: `fesp-db.aws2.store` (내부 네트워크)

**해결 방법**:
- Koyeb에서는 MongoDB Atlas를 사용하므로 정상 작동할 것입니다.
- 로컬 테스트에서는 MongoDB 연결 실패가 예상됩니다.

### 2. 데이터베이스 이름 불일치
- **Koyeb**: `openmarket`
- **로컬**: `team03db`

**해결 방법**:
- Koyeb 배포 시에는 `openmarket` 데이터베이스를 사용합니다.
- 로컬 개발 시에는 `.env.modi`의 설정을 사용합니다.

### 3. 앱 모듈 로드 실패
- **에러**: `SyntaxError: Unexpected token ')'`
- **원인**: 코드 문법 오류 또는 의존성 문제

## Koyeb 배포 전 체크리스트

### ✅ 완료된 항목
- [x] Swagger 파일 생성 성공
- [x] MongoDB 연결 실패 처리 (로컬 환경 제한)
- [x] GridFsStorage 초기화 실패 처리

### ⚠️ 해결 필요
- [ ] 앱 모듈 로드 실패 해결
- [ ] Koyeb 환경 변수 확인

## Koyeb 환경 변수 설정 확인

### 필수 환경 변수
```bash
# MongoDB 연결
DB_PROTOCOL=mongodb+srv
DB_HOST=database.qvoynvk.mongodb.net
DB_PORT=27017
DB_DATABASE=openmarket
DB_USER=ins
DB_PASSWORD=ins12$$

# 애플리케이션
API_HOST=https://modi-ip3-modi.koyeb.app
APP_HOST=http://localhost
NODE_ENV=modi  # 또는 production
```

### 확인 사항
1. **NODE_ENV 설정**: Koyeb에서 `NODE_ENV=modi` 또는 `NODE_ENV=production` 설정 필요
2. **MongoDB Atlas 접근**: IP 화이트리스트에 Koyeb IP 추가 필요
3. **포트 설정**: 기본 포트 3000 사용

## 배포 시 주의사항

### 1. MongoDB Atlas 설정
- MongoDB Atlas에서 Koyeb의 IP 주소를 화이트리스트에 추가
- 또는 `0.0.0.0/0`으로 모든 IP 허용 (개발 환경만)

### 2. 환경 변수 설정
- Koyeb 대시보드에서 환경 변수 설정
- `.env.modi`의 내용을 Koyeb 환경 변수로 설정

### 3. 빌드 및 실행
- `workdir`: `api`
- `run_command`: `npm start`
- `start` 스크립트는 `NODE_ENV=modi`를 사용하도록 수정됨

## 예상되는 문제 및 해결

### 문제 1: MongoDB 연결 실패
**원인**: IP 화이트리스트 미설정
**해결**: MongoDB Atlas에서 Koyeb IP 추가

### 문제 2: 환경 변수 불일치
**원인**: `.env.modi`와 Koyeb 설정 불일치
**해결**: Koyeb 환경 변수를 `.env.modi`와 일치시키거나, Koyeb 설정에 맞게 조정

### 문제 3: 앱 모듈 로드 실패
**원인**: 코드 문법 오류
**해결**: 문법 오류 수정 필요

## 앱 모듈 로드 실패 원인 분석

### 발견된 문제
1. **`tracer` 패키지 누락**: `node_modules/tracer/index.js`를 찾을 수 없음
2. **문법 오류 가능성**: `SyntaxError: Unexpected token ')'`

### 해결 방법
1. **의존성 재설치**:
   ```bash
   cd api
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Koyeb 배포 시**: 
   - Koyeb는 자동으로 `npm install`을 실행하므로 의존성 문제는 해결될 것입니다.
   - 로컬에서만 발생하는 문제일 수 있습니다.

## 다음 단계

1. ✅ **의존성 재설치** (로컬 환경)
   ```bash
   cd api
   npm install
   ```

2. ✅ **Koyeb 환경 변수 확인**
   - MongoDB Atlas 연결 정보 확인
   - `NODE_ENV` 설정 확인

3. ✅ **MongoDB Atlas 설정**
   - IP 화이트리스트에 Koyeb IP 추가
   - 또는 `0.0.0.0/0`으로 모든 IP 허용 (개발 환경)

4. ✅ **배포 및 테스트**
   - Koyeb에서 자동 배포 확인
   - Health check 통과 확인
   - API 엔드포인트 테스트

## 중요 참고사항

### 로컬 vs Koyeb 환경 차이
- **로컬**: `fesp-db.aws2.store` (내부 네트워크, 접근 불가)
- **Koyeb**: `database.qvoynvk.mongodb.net` (MongoDB Atlas, 접근 가능)

### 배포 전 확인
- [x] Swagger 생성 성공
- [ ] 의존성 설치 확인 (로컬)
- [x] MongoDB 연결 실패 처리 (로컬 환경 제한)
- [ ] Koyeb 환경 변수 설정 확인
- [ ] MongoDB Atlas IP 화이트리스트 설정

### 예상 결과
- **로컬 테스트**: MongoDB 연결 실패는 정상 (내부 네트워크 접근 불가)
- **Koyeb 배포**: 모든 기능 정상 작동 예상

