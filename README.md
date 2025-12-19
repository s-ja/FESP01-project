# FrontEnd School Plus Project API Server
* GitHub URL: (https://github.com/uzoolove/FESP01-project)

## 오픈마켓 API 서버
* 제공되는 API 서버를 사용해서 FrontEnd를 완성하면 됩니다.
* API 서버의 주제는 오픈마켓이며 회원, 상품리, 구매, 후기 등의 기능이 제공됩니다.
* 제공되는 API 기능을 잘 검토해서 어떤 종류의 쇼핑몰을 만들지는 각 팀에서 결정하면 됩니다.
	- 티셔츠 판매
  - 신발 판매
  - 중고제품 판매 등
* API 서버는 프로젝트 첫날 github로 제공되며 github의 가이드를 따라서 각자 로컬에 DB 및 API 서버를 설치해서 사용합니다.
* 최대한 제공되는 API만 이용해서 개발하고 제공되는 API 이외애 추가하고 싶은 기능이 있을 경우 요청하면 검토후 추가해 드릴수 있습니다.(단, 다만 새로운 API로 인해 기존 API에 변경이 발생하거나 요청한 API 구현이 복잡할 경우에는 추가가 어려울 수도 있습니다.)

## API 서버 구현 기술
* Application Server: Node.js + Express
* Database: MongoDB

### Node.js 설치
* https://nodejs.org/en/download 접속 후 다운로드
  - 본인의 OS에 맞는 버전 다운로드 후 기본 설정으로 설치

### MongoDB 설치
* https://www.mongodb.com/try/download/community 접속 후 다운로드
  - Version: 7.0.3
  - Platform: 본인 OS에 맞는 플랫폼 선택
  - Package: msi(Windows)
  - 기본 설정으로 설치
  - Mac 사용자는 다음을 참고해서 설치
    + Homebrew를 이용한 설치: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x
    + Tarball을 이용한 설치: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x-tarball

## Github 레퍼지토리 복사
* View > Source Control > Clone Repository 선택
* <nohyper>https</nohyper>://github.com/uzoolove/FESP01-project.git 입력
* 복사할 적당한 폴더(예시, C:\FESP) 선택 후 Select as Repository Destination 선택
  - 폴더 경로에 한글이 들어가지 않도록 주의
* Open 선택

## API 서버 실행
* 프로젝트 루트에서 실행
```
cd api
npm i
npm start
```

### 환경별 실행 스크립트
* `npm start` - 프로덕션 환경 (NODE_ENV=production)
* `npm run dev` - 개발 환경 (NODE_ENV=development)
* `npm run local` - 로컬 환경 (NODE_ENV=local, nodemon 사용)
* `npm run aws` - AWS 환경 (NODE_ENV=aws)
* 기타 환경별 스크립트: `start:myparking`, `start:modi`, `start:orummarket` 등

## DB 초기화
* 기본으로 제공되는 샘플 데이터로 DB 초기화
```
npm run dbinit
```

## API 서버 테스트
### 자체 제공 API 문서
* https://localhost/apidocs
  - 브라우저에서 "연결이 비공개로 설정되어 있지 않습니다." 메세지가 나올 경우 "고급" 버튼을 누른 후 "localhost(안전하지 않음)" 클릭

### Postman
* https://www.postman.com/downloads 접속 후 다운로드
- 본인의 OS에 맞는 버전 다운로드 후 기본 설정으로 설치

### Postman 사용
#### Workspace 생성
* Workspaces > Create Workspace
  - Blank Workspace > Next
  - Name: FESP > Create

#### 환경 변수 추가
* Environments > + 버튼(Create new environment)
  - "New Environment" -> "API Server"로 수정
  - Variable: url
  - Type: default
  - initial value: https://localhost/api
  - Ctrl + S 눌러서 저장

#### Collection 추가
* Collections > + 버튼(Create new collection) > Blank collection
  - "New Collection" -> "Sample"로 수정

#### API Server 환경 변수 지정
* 우측 상단의 "No Environment" 클릭 후 Api Server 선택

#### Collection에 API 요청 추가(상품 상세 조회)
* 컬렉션 목록에 있는 Sample 컬렉션위에 마우스 올린 후 ··· 클릭해서 Add request 선택
  - "New Request" -> "상품 상세 조회"로 수정
  - "Enter URL or paste text" 항목에 {{url}}/products/4 입력 후 Send
  - 정상 응답 결과 확인

#### Collection에 API 요청 추가(회원 정보 조회)
* 컬렉션 목록에 있는 Sample 컬렉션위에 마우스 올린 후 ··· 클릭해서 Add request 선택
  - "New Request" -> "회원 정보 조회"로 수정
  - "Enter URL or paste text" 항목에 {{url}}/users/4 입력 후 Send
  - 401 응답 결과 확인("authorization 헤더가 없습니다.")

#### Collection에 API 요청 추가(로그인)
* 컬렉션 목록에 있는 Sample 컬렉션위에 마우스 올린 후 ··· 클릭해서 Add request 선택
  - "New Request" -> "로그인"로 수정
  - "GET" -> "POST"로 수정
  - "Enter URL or paste text" 항목에 {{url}}/users/login 입력
  - Body > raw > "Text" -> "JSON"으로 변경 후 아래처럼 입력 후 Send
  ```
  {
    "email": "u1@market.com",
    "password": "11111111"
  }
  ```
  - 정상 응답 결과 확인

##### 로그인 응답 결과로 받은 토큰을 환경 변수에 세팅
* Collections > 로그인 > Tests
  - 다음처럼 입력 후 Send
  ```
  if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    const accessToken = jsonData.item.token.accessToken;
    const refreshToken = jsonData.item.token.refreshToken;
    pm.environment.set("accessToken", accessToken);
    pm.environment.set("refreshToken", refreshToken);
  }
  ```
* Environments > API Server 환경 변수에 accessToken과 refreshToken 추가 되었는지 확인

##### 요청 헤더에 토큰 인증 정보 추가
* Collections > 회원 정보 조회 > Authorization(또는 Auth) 선택
  - Type: Bearer Token
  - Token: {{accessToken}}
  - Send
  - 정상 응답 결과 확인

#### 나머지 API
* FESP 워크스페이스 > Import > https://raw.githubusercontent.com/uzoolove/FESP01-project/main/api/samples/OpenMarket.postman_collection.json
  - OpenMarket 컬렉션이 생성되고 테스트용 API가 import됨

## MongoDB 연결 관리

### 연결 설정
* MongoDB 연결은 `api/utils/dbUtil.js`에서 관리됩니다.
* 연결 풀 설정:
  - `maxPoolSize: 20` - 최대 연결 수
  - `minPoolSize: 5` - 최소 연결 수
  - `maxIdleTimeMS: 30000` - 유휴 연결 자동 해제 시간 (30초)
  - `connectTimeoutMS: 10000` - 연결 타임아웃 (10초)
  - `socketTimeoutMS: 45000` - 소켓 타임아웃 (45초)

### 연결 재시도
* MongoDB 연결 실패 시 자동으로 최대 3회 재시도합니다.
* 재시도 간격: 5초

### 서버 종료 절차 (우아한 종료)
서버는 다음 신호를 받으면 우아하게 종료됩니다:
* `SIGTERM` - 정상 종료 신호 (일반적으로 프로세스 매니저에서 전송)
* `SIGINT` - 인터럽트 신호 (Ctrl+C)

종료 프로세스:
1. Socket.IO 서버 종료
2. HTTP/HTTPS 서버 종료 (진행 중인 요청 완료 대기)
3. MongoDB 연결 종료
4. 프로세스 종료

**주의사항:**
* 서버를 종료할 때는 `Ctrl+C`를 사용하거나 프로세스 매니저의 종료 명령을 사용하세요.
* 강제 종료(`kill -9`)는 피하세요. 이 경우 MongoDB 연결이 정리되지 않을 수 있습니다.
* 강제 종료 타임아웃: 10초 (10초 내에 종료되지 않으면 강제 종료)

### MongoDB Atlas 연결 관리
* 프로덕션 환경에서 MongoDB Atlas를 사용하는 경우:
  - 서버 종료 시 연결이 자동으로 정리됩니다.
  - 유휴 연결은 30초 후 자동으로 해제됩니다.
  - 연결 풀 설정으로 불필요한 연결 생성을 방지합니다.

### 연결 상태 확인
* 연결 상태는 `api/utils/dbUtil.js`의 `isConnected()` 함수로 확인할 수 있습니다.
* 연결 정보는 `getConnectionInfo()` 함수로 조회할 수 있습니다.

### 로컬 테스트 방법

#### 1. 연결 관리 테스트
연결 생성, 상태 확인, 연결 해제를 테스트합니다:
```bash
cd api
npm run test:connection
```

이 테스트는 다음을 확인합니다:
- MongoDB 연결 상태
- 간단한 쿼리 실행
- 연결 해제 기능

#### 2. 종료 핸들러 테스트
서버 종료 핸들러가 제대로 동작하는지 테스트합니다:
```bash
cd api
npm run test:shutdown
```

테스트 방법:
1. 위 명령으로 서버를 실행합니다
2. 다른 터미널에서 다음 중 하나를 실행:
   - `kill -TERM <PID>` (PID는 로그에서 확인)
   - `kill -INT <PID>`
   - 또는 실행 중인 터미널에서 `Ctrl+C`
3. 로그에서 다음을 확인:
   - 종료 신호 수신 로그
   - HTTP 서버 종료 로그
   - MongoDB 연결 종료 로그

#### 3. 실제 서버 실행 및 종료 테스트
로컬 환경에서 실제 서버를 실행하고 종료를 테스트합니다:
```bash
cd api
npm run local
```

다른 터미널에서:
```bash
# 프로세스 ID 찾기
ps aux | grep node

# 우아한 종료 (SIGTERM)
kill -TERM <PID>

# 또는 인터럽트 신호 (SIGINT)
kill -INT <PID>
```

**예상되는 로그 출력:**
```
SIGTERM 신호를 받았습니다. 서버를 종료합니다...
Socket.IO 서버가 종료되었습니다.
HTTP 서버가 종료되었습니다.
MongoDB 연결이 정상적으로 종료되었습니다.
```

#### 4. 연결 상태 모니터링
서버 실행 중 연결 상태를 확인하려면:
```javascript
// API 엔드포인트에 추가하거나 별도 스크립트로 실행
import { getConnectionInfo } from './utils/dbUtil.js';
const info = getConnectionInfo();
console.log(info);
```

### 문제 해결
* MongoDB 연결 문제가 발생하는 경우:
  1. 로그에서 연결 시도 및 오류 메시지 확인
  2. MongoDB Atlas 대시보드에서 연결 수 확인
  3. 네트워크 및 방화벽 설정 확인
  4. 환경 변수 설정 확인 (`.env` 파일)
  5. 위의 테스트 스크립트를 실행하여 연결 관리가 제대로 동작하는지 확인

### 정당성 점검 결과

**발견된 문제점:**
1. ✅ **프로세스 종료 시 연결 해제 로직 부재**
   - `api/utils/dbUtil.js`에 `closeConnection()` 함수가 없었음
   - 모든 서버 시작 파일(`www.js`, `www-prod.js`, `www-aws.js`, `www-https.js`)에 SIGTERM/SIGINT 핸들러가 없었음
   - 이는 실제 코드 분석을 통해 확인된 사실입니다.

2. ✅ **연결 풀 설정 부족**
   - `minPoolSize`, `maxIdleTimeMS` 설정이 없어 유휴 연결 관리가 부족했음
   - 이는 MongoDB Atlas에서 유휴 연결이 계속 유지될 수 있는 원인이 될 수 있음

3. ✅ **다중 환경 실행 가능성**
   - package.json에 여러 환경별 스크립트가 있어 동시에 여러 인스턴스가 실행될 수 있음
   - 각 인스턴스가 별도의 연결을 생성하므로 총 연결 수가 증가할 수 있음

**추가 확인 사항:**
- MongoDB Atlas 대시보드에서 실제 연결 수를 모니터링하여 문제가 해결되었는지 확인하는 것을 권장합니다.
- 프로덕션 환경에 배포하기 전에 로컬에서 위의 테스트를 실행하여 모든 기능이 정상 동작하는지 확인하세요.


