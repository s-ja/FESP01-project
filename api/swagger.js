import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: '오픈마켓 API', 
    description: '오픈마켓 API Server입니다.', 
  },
  servers: [
    {
      url: 'http://localhost/api',
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
        ok: 0, 
        error: {
          message: '이메일 형식에 맞지 않습니다.'
        }
      },
      Error404: {
        ok: 0, 
        error: {
          message: '/api/products/123 리소스를 찾을 수 없습니다.'
        }
      },
      Error500: {
        ok: 0, 
        error: {
          message: '서버 오류'
        }
      },
      UserInfo: {
        _id: 1,
        email: 'admin@market.com',
        password: '12345678',
        name: '무지',
        phone: '01011112222',
        address: '서울시 강남구 역삼동 123',
        type: 'admin',
        createdAt: '2023-11-20 11:23:45',
        updatedAt: '2023-11-20 11:23:45',
        extra: {}
      },
      UserInfoRequest: {
        email: 'uzoolove@gmail.com',
        password: '12345678',
        name: '김철수',
        address: '서울시 강남구 테헤란로 443 애플트리타워',
  
        extras: {
          birthday: '20011225',
  
        }
      },
      ItemUpdateRequest: {
        title: 'JS 프로젝트 완성',
        content: '화요일까지 완료해야 함.',
        done: true
      },
      ItemResponse: {
        ok: 1,
        item: {
          _id: 5,
          title: 'JS 프로젝트 완성',
          content: '화요일까지 완료해야 함.',
          createdAt: '2023.10.30 11:34:31',
          updatedAt: '2023.10.30 11:34:31'
        }      
      },
      ListResponse: {
        ok: 1,
        items: [
          {
            _id: 3,
            title: "React 공부",
            done: false,
            createdAt: "2023.10.25 10:12:45",
            updatedAt: "2023.10.25 18:34:17"
          }
        ],
        pagination: {
          page: 2,
          limit: 2,
          total: 5,
          totalPages: 3
        }
      },
      ListWithoutPaginationResponse: {
        ok: 1,
        items: [
          {
            _id: 3,
            title: "React 공부",
            done: false,
            createdAt: "2023.10.25 10:12:45",
            updatedAt: "2023.10.25 18:34:17"
          }
        ],
        pagination: {}
      },
    },
    examples: {
      createUser: {
        name: '김철수',
        age: 30
      }
    }
  },

};
const outputFile = './swagger-output.json';
const routes = [ './routes/user/index.js', './routes/seller/index.js'];

swaggerAutogen({openapi: '3.0.0'})(outputFile, routes, doc);