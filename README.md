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
* https://www.mongodb.com/try/download/community-kubernetes-operator 접속 후 다운로드
  - Version: 7.0.3
  - Platform: 본인 OS에 맞는 플랫폼 선택
  - Package: msi(Windows) 또는 tgz(MacOS)
  - 기본 설정으로 설치

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

* api 서버 사용방법: https://localhost/apidocs
  - 브라우저에서 "연결이 비공개로 설정되어 있지 않습니다." 메세지가 나올 경우 "고급" 버튼을 누른 후 localhost(안전하지 않음) 클릭
