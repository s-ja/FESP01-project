import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: '오픈마켓 API', 
    description: '오픈마켓 API Server입니다.', 
  },
  servers: [
    {
      url: 'https://localhost/api',
      description: ''
    }
  ],
  tags: [
    {
      name: '회원',
      description: '회원 관리 기능',
    },
    {
      name: '상품',
      description: '상품 관리 기능',
    },
    {
      name: '주문',
      description: '주문 관리 기능',
    },
    {
      name: '후기',
      description: '후기 관리 기능',
    },
    {
      name: '파일',
      description: '파일 관리 기능',
    },
  ],
  components: {
    securitySchemes:{
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        in: 'header',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error422: {
        "ok": 0,
        "message": "잘못된 입력값이 있습니다.",
        "errors": [
          {
            "type": "field",
            "value": "swaggermarket.com",
            "msg": "이메일 형식에 맞지 않습니다.",
            "path": "email",
            "location": "body"
          }
        ]
      },
      Error409: {
        "ok": 0,
        "message": "이미 등록되어 있는 이메일입니다."
      },
      Error404: {
        "ok": 0,
        "message": "/api/user 리소스를 찾을 수 없습니다."
      },
      Error500: {
        "ok": 0,
        "message": "요청하신 작업 처리에 실패했습니다. 잠시 후 다시 이용해 주시기 바랍니다."
      },
      CreateUserReq: {
        email: 'swagger@market.com',
        password: '12345678',
        name: '스웨거',
        phone: '01011112222',
        address: '서울시 강남구 역삼동 123',
        type: 'user'
      },
      CreateUserRes: {
        "ok": 1,
        "item": {
          "email": "swagger@market.com",
          "name": "스웨거",
          "phone": "01011112222",
          "address": "서울시 강남구 역삼동 123",
          "type": "user",
          "_id": 5,
          "createdAt": "2023.11.20 08:13:40",
          "updatedAt": "2023.11.20 08:13:40"
        }
      },

      EmailDuplicate: {
        "ok": 1,
        "duplicate": true
      },
      EmailNotDuplicate: {
        "ok": 1,
        "duplicate": false
      },
    },
    examples: {
      CreateUserReq: {
        email: 'swagger@market.com',
        password: '12345678',
        name: '스웨거',
        phone: '01011112222',
        address: '서울시 강남구 역삼동 123',
        type: 'user'
      },
      CreateUserReq1: {
        email: 'swagger@market.com',
        password: '12345678',
        name: '스웨거',
        phone: '01011112222',
        address: '서울시 강남구 역삼동 123',
        type: 'user',
        extra: {
          gender: 'extra에는 프로젝트에서 필요한 아무 속성이나',
          age: '필요한 값을',
          address: ['넣으면', '됩니다.'],
          profileImage: '/uploads/swagger.jpg',
          obj: {
            hello: '객체로',
            hi: '넣어도 됩니다.'
          },
          addressBook: [{
            name: '집',
            address: '서울시'
          }, {
            name: '회사',
            address: '인천시'
          }]
        }
      },
      CreateUserRes: {
        "ok": 1,
        "item": {
          "email": "swagger@market.com",
          "name": "스웨거",
          "phone": "01011112222",
          "address": "서울시 강남구 역삼동 123",
          "type": "user",
          "extra": {
            "gender": "아무 속성이나",
            "age": "필요한 값을",
            "address": [
              "넣으면",
              "됩니다."
            ],
            "profile": "/uploads/swagger.jpg",
            "obj": {
              "hello": "객체로",
              "hi": "넣어도 됩니다."
            }
          },
          "_id": 5,
          "createdAt": "2023.11.20 08:13:40",
          "updatedAt": "2023.11.20 08:13:40"
        }
      },
    }
  },

};
const outputFile = './swagger-output.json';
const routes = [ './routes/user/index.js', './routes/seller/index.js'];

swaggerAutogen({openapi: '3.0.0'})(outputFile, routes, doc);