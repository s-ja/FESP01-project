# 배포 문제 해결 요약

## 문제 분석

### 발견된 문제
1. **MongoDB 연결 초기화 타이밍 문제**
   - `dbUtil.js`에서 `db` 변수가 비동기로 초기화됨
   - 모델 파일들이 모듈 로드 시점에 `db`를 import하여 `undefined` 상태
   - 런타임에 `db.product`, `db.code` 등에 접근 시 `Cannot read properties of undefined` 에러 발생

2. **로그 분석 결과**
   ```
   TypeError: Cannot read properties of undefined (reading 'product')
   at Object.findBy (file:///workspace/models/user/product.model.js:29:33)
   ```
   - 모든 API 요청에서 동일한 에러 발생
   - MongoDB 연결은 성공했지만, 모델에서 `db` 객체를 사용할 때 `undefined`

## 해결 방법

### 수정된 파일 목록
모든 모델 파일에서 `db` 직접 import를 `getDB()` 함수 사용으로 변경:

1. ✅ `models/user/product.model.js`
2. ✅ `models/user/code.model.js` (실제로는 `models/code/code.model.js`)
3. ✅ `models/user/user.model.js`
4. ✅ `models/user/reply.model.js`
5. ✅ `models/user/order.model.js`
6. ✅ `models/user/cart.model.js`
7. ✅ `models/user/bookmark.model.js`
8. ✅ `models/user/post.model.js`
9. ✅ `models/seller/product.model.js`
10. ✅ `models/seller/order.model.js`
11. ✅ `models/admin/user.model.js`

### 변경 패턴

#### Before (문제 있는 코드)
```javascript
import db from '#utils/dbUtil.js';

const model = {
  async findBy() {
    const item = await db.collection.findOne({});
    // db가 undefined일 수 있음
  }
};
```

#### After (수정된 코드)
```javascript
import { getDB } from '#utils/dbUtil.js';

const model = {
  async findBy() {
    const db = getDB();
    if (!db || !db.collection) {
      throw new Error('MongoDB 연결이 초기화되지 않았습니다.');
    }
    
    const item = await db.collection.findOne({});
    // db가 항상 초기화된 상태
  }
};
```

## 수정 사항 상세

### 1. Import 문 변경
- `import db from '#utils/dbUtil.js'` → `import { getDB } from '#utils/dbUtil.js'`
- `import db, { nextSeq }` → `import { getDB, nextSeq }`

### 2. 각 함수에 getDB() 추가
- 모든 async 함수 시작 부분에 `const db = getDB();` 추가
- MongoDB 연결 확인 로직 추가

### 3. 에러 처리
- `db`가 `undefined`이거나 컬렉션이 없는 경우 명확한 에러 메시지 제공

## 배포 전 체크리스트

### ✅ 완료된 항목
- [x] 모든 모델 파일에서 `getDB()` 사용으로 변경
- [x] MongoDB 연결 확인 로직 추가
- [x] 에러 처리 개선

### ⚠️ 확인 필요
- [ ] Koyeb 환경 변수 설정 확인
- [ ] MongoDB Atlas IP 화이트리스트 설정
- [ ] 배포 후 API 테스트

## 예상 결과

### 수정 전
- 모든 API 요청에서 500 에러 발생
- `Cannot read properties of undefined (reading 'product')` 에러

### 수정 후
- MongoDB 연결이 완료된 후에만 `db` 객체 사용
- 모든 API 요청 정상 처리 예상

## 다음 단계

1. **코드 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "fix: MongoDB 연결 초기화 타이밍 문제 해결 - 모든 모델에서 getDB() 사용"
   git push
   ```

2. **Koyeb 자동 배포 확인**
   - Koyeb에서 자동으로 배포 시작
   - 배포 로그 확인

3. **배포 후 테스트**
   - API 엔드포인트 테스트
   - MongoDB 연결 확인
   - 에러 로그 확인

## 참고 사항

### MongoDB 연결 흐름
1. `dbUtil.js` 모듈 로드
2. `connectWithRetry()` 비동기 실행
3. MongoDB 연결 성공 후 `db` 객체 초기화
4. 모델 파일에서 `getDB()` 호출 시 초기화된 `db` 반환

### 주의사항
- 모든 모델 함수에서 `getDB()`를 호출해야 함
- `db`를 직접 import하지 말고 `getDB()` 함수 사용
- 연결 확인 로직을 추가하여 안전성 향상

