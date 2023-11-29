import logger from '../utils/logger.js';
import dotenv from 'dotenv';

// 기본 .env 파일 로딩(package.json에서 로딩함)
// dotenv.config({ path: '.env' });
// 환경별 .env 파일 로딩
logger.log('NODE_ENV', process.env.NODE_ENV);
if (process.env.NODE_ENV) {
  dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
}

import db, { getClient, nextSeq } from '../utils/dbutil.js';
import moment from 'moment';

async function main() {
  await db.dropDatabase();
  logger.info('DB 삭제.');
  await initDB();
  return 'DB 초기화 완료.';
}

main()
  .then(logger.info)
  .catch(logger.error)
  .finally(() => getClient().close());

async function initDB(){
  // 시퀀스 등록
  await registSeq();
  console.info('1. 시퀀스 등록 완료.');
  
  // 회원 등록
  await registUser();
  console.info('2. 회원 등록 완료.');

  // 상품 등록
  await registProduct();
  console.info('3. 상품 등록 완료.');

  // // 장바구니 등록
  await registCart();
  console.info('4. 장바구니 등록 완료.');

  // // 구매 등록
  await registOrder();
  console.info('5. 구매 등록 완료.');

  // // 후기 등록
  await registReply();
  console.info('6. 후기 등록 완료.');

  // // 코드 등록
  await registCode();
  console.info('7. 코드 등록 완료.');
  
  // 상품 조회
  await productList();
}

function getDay(day=0){
	return moment().add(day, 'days').format('YYYY.MM.DD');
}
function getTime(day=0, second=0){
	return moment().add(day, 'days').add(second, 'seconds').format('YYYY.MM.DD HH:mm:ss');
}

// 시퀀스 등록
async function registSeq(){
	const seqList = ['user', 'product', 'cart', 'order', 'reply'];
  const data = seqList.map(_id => ({ _id, no: 1 }));
	await db.seq.insertMany(data);
}

// 회원 등록
async function registUser(){
	var data = [
		{
			_id: await nextSeq('user'),
      email: 'admin@market.com',
			password: '$2b$10$S.8GNMDyvUF0xzujPtHBu.j5gtS19.OhRmYbpJBnCHg2S83WLx1T2',
      name: '무지',
      phone: '01011112222',
      address: '서울시 강남구 역삼동 123',
      type: 'admin',
			createdAt: getTime(-100, -60*60*3),
      updatedAt: getTime(-100, -60*60*3),
      extra: {
        birthday: '03-23',
        level: 'UL03',
        addressBook: [
          {
            id: 1,
            name: '집',
            value: '서울시 강남구 역삼동 123',
          },
          {
            id: 2,
            name: '회사',
            value: '서울시 강남구 신사동 234',
          }
        ]
      }
		},
		{
			_id: await nextSeq('user'),
      email: 's1@market.com',
			password: '$2b$10$S.8GNMDyvUF0xzujPtHBu.j5gtS19.OhRmYbpJBnCHg2S83WLx1T2',
      name: '네오',
      phone: '01022223333',
      address: '서울시 강남구 삼성동 456',
      type: 'seller',
			createdAt: getTime(-50),
      updatedAt: getTime(-30, -60*60*3),
      extra: {
        birthday: '11-23',
        level: 'UL01',
        addressBook: [
          {
            id: 1,
            name: '회사',
            value: '서울시 강남구 삼성동 567',
          },
          {
            id: 2,
            name: '학교',
            value: '서울시 강남구 역삼동 234',
          }
        ]
      }
		},
    {
			_id: await nextSeq('user'),
      email: 's2@market.com',
			password: '$2b$10$S.8GNMDyvUF0xzujPtHBu.j5gtS19.OhRmYbpJBnCHg2S83WLx1T2',
      name: '어피치',
      phone: '01033334444',
      address: '서울시 강남구 도곡동 789',
      type: 'seller',
			createdAt: getTime(-40, -60*30),
      updatedAt: getTime(-30, -60*20),
      extra: {
        birthday: '11-24',
        level: 'UL02',
        addressBook: [
          {
            id: 1,
            name: '회사',
            value: '서울시 마포구 연희동 123',
          },
          {
            id: 2,
            name: '가게',
            value: '서울시 강남구 학동 234',
          }
        ]
      }
		},
    {
			_id: await nextSeq('user'),
      email: 'u1@market.com',
			password: '$2b$10$S.8GNMDyvUF0xzujPtHBu.j5gtS19.OhRmYbpJBnCHg2S83WLx1T2',
      name: '제이지',
      phone: '01044445555',
      address: '서울시 강남구 논현동 222',
      type: 'user',
			createdAt: getTime(-20, -60*30),
      updatedAt: getTime(-10, -60*60*12),
      extra: {
        birthday: '11-30',
        level: 'UL01',
        address: [
          {
            id: 1,
            name: '회사',
            value: '서울시 강동구 천호동 123',
          },
          {
            id: 2,
            name: '집',
            value: '서울시 강동구 성내동 234',
          }
        ]
      }
		},
	];
	
	await db.user.insertMany(data);
}

// 상품 등록
async function registProduct(){
	var data = [
    {
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 22800,
      shippingFees: 0,
      show: true,
      active: true,
      name: '캥거루 스턴트 독 로봇완구',
      quantity: 320,
      buyQuantity: 310,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-dog.jpg`],
      content: `
        <div class="product-detail">
          <p>캥거루 스턴트 독 로봇완구 상세 설명</p>
        </div>`,
			createdAt: getTime(-41, -60*60*2),
      updatedAt: getTime(-40, -60*15),
      extra: {
        isNew: true,
        isBest: true,
        category: ['PC03', 'PC0301'],
        sort: 5,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 17260,
      shippingFees: 2500,
      show: true,
      active: true,
      name: '헬로카봇 스톰다이버',
      quantity: 200,
      buyQuantity: 198,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-diver.jpg`],
      content: `
        <div class="product-detail">
          <p>헬로카봇 스톰다이버 상세 설명</p>
        </div>`,
			createdAt: getTime(-38, -60*60*6),
      updatedAt: getTime(-33, -60*55),
      extra: {
        isNew: false,
        isBest: true,
        category: ['PC01', 'PC0103'],
        sort: 4,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 48870,
      shippingFees: 0,
      show: true,
      active: true,
      name: '레고 클래식 라지 조립 박스 10698',
      quantity: 100,
      buyQuantity: 99,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-classic.jpg`],
      content: `
        <div class="product-detail">
          <p>레고 클래식 라지 조립 박스 10698 상세 설명</p>
        </div>`,
			createdAt: getTime(-35, -60*60*6),
      updatedAt: getTime(-10, -60*19),
      extra: {
        isNew: true,
        isBest: true,
        category: ['PC01', 'PC0103'],
        sort: 3,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 3,
      price: 45000,
      shippingFees: 3500,
      show: true,
      active: true,
      name: '레고 테크닉 42151 부가티 볼리드',
      quantity: 100,
      buyQuantity: 89,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-bugatti.png`],
      content: `
        <div class="product-detail">
          <p>레고 테크닉 42151 부가티 볼리드 상세 설명</p>
        </div>`,
			createdAt: getTime(-33, -60*60*7),
      updatedAt: getTime(-22, -60*60*3),
      extra: {
        isNew: false,
        isBest: true,
        category: ['PC03', 'PC0303'],
        sort: 1,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 45000,
      shippingFees: 3500,
      show: true,
      active: true,
      name: '레고 마인크래프트 21246 깊고 어두운 전장',
      quantity: 100,
      buyQuantity: 98,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-minecraft.png`],
      content: `
        <div class="product-detail">
          <p>레고 마인크래프트 21246 깊고 어두운 전장 상세 설명</p>
        </div>`,
			createdAt: getTime(-30, -60*60*10),
      updatedAt: getTime(-10, -60*56),
      extra: {
        isNew: true,
        isBest: false,
        today: true,
        category: ['PC03', 'PC0303'],
        sort: 2,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 54790,
      shippingFees: 4000,
      show: false,
      active: true,
      name: '레고 마블 76247 헐크버스터: 와칸다의 전투',
      quantity: 100,
      buyQuantity: 99,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-hulk.png`],
      content: `
        <div class="product-detail">
          <p>레고 마블 76247 헐크버스터: 와칸다의 전투 상세 설명</p>
        </div>`,
			createdAt: getTime(-30, -60*60*21),
      updatedAt: getTime(-20, -60*10),
      extra: {
        isNew: false,
        isBest: false,
        category: ['PC03', 'PC0303'],
        sort: 1,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 3,
      price: 13000,
      shippingFees: 3500,
      show: true,
      active: true,
      name: '할리갈리 보드게임',
      quantity: 100,
      buyQuantity: 98,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-halligalli.jpg`],
      content: `
        <div class="product-detail">
          <p>할리갈리 보드게임 상세 설명</p>
        </div>`,
			createdAt: getTime(-25, -60*60*12),
      updatedAt: getTime(-24, -60*23),
      extra: {
        isNew: false,
        isBest: true,
        category: ['PC01', 'PC0102'],
        sort: 3,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 26000,
      shippingFees: 3000,
      show: true,
      active: true,
      name: '루미큐브 클래식',
      quantity: 100,
      buyQuantity: 97,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-rummikub.png`],
      content: `
        <div class="product-detail">
          <p>루미큐브 클래식 상세 설명</p>
        </div>`,
			createdAt: getTime(-22, -60*60*22),
      updatedAt: getTime(-20, -60*33),
      extra: {
        isNew: true,
        isBest: true,
        category: ['PC01', 'PC0102'],
        sort: 8,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 3,
      price: 12000,
      shippingFees: 3000,
      show: true,
      active: true,
      name: '짱구는 못말려 숲속 산책 직소퍼즐',
      quantity: 100,
      buyQuantity: 96,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-jjangu.jpg`],
      content: `
        <div class="product-detail">
          <p>짱구는 못말려 숲속 산책 직소퍼즐 상세 설명</p>
        </div>`,
			createdAt: getTime(-21, -60*60*4),
      updatedAt: getTime(-16, -60*15),
      extra: {
        isNew: true,
        isBest: false,
        today: true,
        category: ['PC03', 'PC0302'],
        sort: 2,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 3,
      price: 24000,
      shippingFees: 0,
      show: true,
      active: true,
      name: '라푼젤 그녀의 꿈 직소퍼즐 KD-1000-001 + 그림 엽서(랜덤) + 품질보증서',
      quantity: 100,
      buyQuantity: 95,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-rapunzel.jpg`],
      content: `
        <div class="product-detail">
          <p>라푼젤 그녀의 꿈 직소퍼즐 KD-1000-001 + 그림 엽서(랜덤) + 품질보증서 상세 설명</p>
        </div>`,
			createdAt: getTime(-18, -60*60*7),
      updatedAt: getTime(-12, -60*33),
      extra: {
        isNew: false,
        isBest: true,
        category: ['PC01', 'PC0101'],
        sort: 4,
      }
		},
		{
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 14400,
      shippingFees: 3000,
      show: true,
      active: true,
      name: 'KC인증 스키비디 토일렛 피규어 블럭 8종 중국 호환 레고 블록 장난감 어린이 선물',
      quantity: 100,
      buyQuantity: 94,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi01.jpg`, `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi02.jpg`],
      content: `
        <div align="center"><p>*크리스마스 배송 안내</p></div>
        <div align="center"><p>택배사 물량 증가로 평소보다 2~3일 더 걸립니다.</p></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi03.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi04.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><p>*반품 안내</p></div>`,
			createdAt: getTime(-16, -60*60*3),
      updatedAt: getTime(-15, -60*45),
      extra: {
        isNew: false,
        isBest: false,
        today: true,
        category: ['PC01', 'PC0103'], // 어린이 > 레고
        sort: 6,
      }
		},
    {
			_id: await nextSeq('product'),
      seller_id: 2,
      price: 9000,
      shippingFees: 3000,
      show: true,
      active: true,
      name: '스키비디 토일렛 봉제 인형 (25cm-30cm) 시리즈 크리스마스 선물',
      quantity: 999,
      buyQuantity: 800,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi11.jpg`],
      content: `
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi12.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi13.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi14.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi15.jpg"></div>`,
			createdAt: getTime(-11, -60*60*12),
      updatedAt: getTime(-5, -60*60*6),
      extra: {
        isNew: true,
        isBest: true,
        category: ['PC01', 'PC0103'], // 어린이 > 레고
        sort: 7,
      },
		},
    {
			_id: await nextSeq('product'),
      seller_id: 3,
      price: 21600,
      shippingFees: 3500,
      show: true,
      active: true,
      name: 'KC인증 스키비디 토일렛 피규어 블럭 4종 중국 호환 레고 블록 장난감 어린이 선물',
      quantity: 99,
      buyQuantity: 94,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi21.jpg`],
      content: `
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi22.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi23.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-skibidi24.jpg"></div>`,
			createdAt: getTime(-10, -60*60*12),
      updatedAt: getTime(-5, -60*60*6),
      extra: {
        isNew: true,
        isBest: false,
        category: ['PC01', 'PC0103'], // 어린이 > 레고
        sort: 6,
      },      
		},
    {
			_id: await nextSeq('product'),
      seller_id: 3,
      price: 12900,
      shippingFees: 3500,
      show: true,
      active: true,
      name: '푸쉬팝게임기 팝잇 푸시팝 게임기 두더지게임 핑거 뽁뽁이 애니멀 1+1',
      quantity: 300,
      buyQuantity: 298,
      mainImages: [`${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-pushpop01.jpg`, `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-pushpop02.jpg`, `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-pushpop03.jpg`],
      content: `
        <div align="center"><p>푸쉬팝게임기 팝잇 푸시팝 게임기 두더지게임 핑거 뽁뽁이 애니멀을 구매하시는 모든 분께 사은품(무작위)으로 하나 더 드립니다.</p></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-pushpop04.gif"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-pushpop05.jpg"></div>
        <div align="center"><br></div>
        <div align="center"><img src="${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-pushpop06.jpg"></div>`,
			createdAt: getTime(-3, -60*60*12),
      updatedAt: getTime(-3, -60*60*12),
      extra: {
        isNew: false,
        isBest: true,
        category: ['PC01', 'PC0102'], // 어린이 > 보드게임
        sort: 5,
      },
		},
	];
	
	await db.product.insertMany(data);
}

// 장바구니 등록
async function registCart(){
	var data = [
		{
			_id: await nextSeq('cart'),
      user_id: 4,
      product_id: 1,
      count: 2,
      createdAt: getTime(-7, -60*30),
      updatedAt: getTime(-7, -60*30),
		},
    {
			_id: await nextSeq('cart'),
      user_id: 4,
      product_id: 2,
      count: 1,
      createdAt: getTime(-4, -60*30),
      updatedAt: getTime(-3, -60*60*12),
		},
    {
			_id: await nextSeq('cart'),
      user_id: 2,
      product_id: 3,
      count: 2,
      createdAt: getTime(-3, -60*60*4),
      updatedAt: getTime(-3, -60*60*4),
		},
    {
			_id: await nextSeq('cart'),
      user_id: 2,
      product_id: 4,
      count: 3,
      createdAt: getTime(-2, -60*60*12),
      updatedAt: getTime(-1, -60*60*20),
		},
	];
	
	await db.cart.insertMany(data);
}

// 구매 등록
async function registOrder(){
	var data = [
		{
			_id: await nextSeq('order'),
      user_id: 4,
      state: 'OS010',
      products: [
        {
          _id: 2,
          name: '헬로카봇 스톰다이버',
          image: `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-diver.jpg`,
          quantity: 2,
          price: 34520,
          reply_id: 3,
        }
      ],
      cost: {
        products: 34520,
        shippingFees: 2500,
        total: 37020
      },
      address: {
        name: '회사',
        value: '서울시 강남구 신사동 234',
      },
			createdAt: getTime(-6, -60*60*3),
      updatedAt: getTime(-6, -60*60*3)
		},
    {
			_id: await nextSeq('order'),
      user_id: 2,
      state: 'OS040',
      products: [
        {
          _id: 3,
          name: '레고 클래식 라지 조립 박스 10698',
          image: `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-classic.jpg`,
          quantity: 1,
          price: 48870,
        },
        {
          _id: 4,
          name: '레고 테크닉 42151 부가티 볼리드',
          image: `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-bugatti.png`,
          quantity: 2,
          price: 90000,
          reply_id: 2,
        }
      ],
      cost: {
        products: 138840,
        shippingFees: 3500,
        total: 142370
      },
      address: {
        name: '집',
        value: '서울시 강남구 역삼동 123',
      },
			createdAt: getTime(-4, -60*60*22),
      updatedAt: getTime(-2, -60*60*12)
		},
    {
			_id: await nextSeq('order'),
      user_id: 4,
      state: 'OS310',
      products: [
        {
          _id: 4,
          name: '레고 테크닉 42151 부가티 볼리드',
          image: `${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/uploads/sample-bugatti.png`,
          quantity: 1,
          price: 45000,
          reply_id: 1,
        }
      ],
      cost: {
        products: 45000,
        shippingFees: 3500,
        total: 48500
      },
      address: {
        name: '학교',
        value: '서울시 강남구 역삼동 234',
      },
			createdAt: getTime(-3, -60*60*18),
      updatedAt: getTime(-1, -60*60*1)
		},
	];

	await db.order.insertMany(data);
}

// 후기 등록
async function registReply(){
	var data = [
		{
			_id: await nextSeq('reply'),
      user_id: 4,
      product_id: 4,
      rating: 5,
      content: '아이가 좋아해요.',
			createdAt: getTime(-4, -60*60*12),
		},
    {
			_id: await nextSeq('reply'),
      user_id: 2,
      product_id: 4,
      rating: 4,
      content: '배송이 좀 느려요.',
			createdAt: getTime(-3, -60*60*1),
		},
    {
			_id: await nextSeq('reply'),
      user_id: 4,
      product_id: 2,
      rating: 1,
      content: '하루만에 고장났어요.',
			createdAt: getTime(-2, -60*60*10),
		}
	];
	
	await db.reply.insertMany(data);
}

// 코드 등록
async function registCode(){
	var data = [
		{
			_id: 'productCategory',
      title: '상품 카테고리',
      codes: [
        {
          sort: 2,
          code: 'PC01',
          value: '어린이',
          depth: 1
        },
        {
          sort: 3,
          code: 'PC0101',
          value: '퍼즐',
          parent: 'PC01',
          depth: 2
        },
        {
          sort: 1,
          code: 'PC0102',
          value: '보드게임',
          parent: 'PC01',
          depth: 2
        },
        {
          sort: 2,
          code: 'PC0103',
          value: '레고',
          parent: 'PC01',
          depth: 2
        },
        {
          sort: 4,
          code: 'PC0104',
          value: '로봇',
          parent: 'PC01',
          depth: 2
        },

        {
          sort: 1,
          code: 'PC02',
          value: '스포츠',
          depth: 1
        },
        {
          sort: 1,
          code: 'PC0201',
          value: '축구',
          parent: 'PC02',
          depth: 2
        },
        {
          sort: 3,
          code: 'PC0202',
          value: '야구',
          parent: 'PC02',
          depth: 2
        },
        {
          sort: 2,
          code: 'PC0203',
          value: '농구',
          parent: 'PC02',
          depth: 2
        },

        {
          sort: 3,
          code: 'PC03',
          value: '어른',
          parent: 'PC03',
          depth: 1
        },        
        {
          sort: 1,
          code: 'PC0301',
          value: '원격 조종',
          parent: 'PC03',
          depth: 2
        },
        {
          sort: 2,
          code: 'PC0302',
          value: '퍼즐',
          parent: 'PC03',
          depth: 2
        },
        {
          sort: 3,
          code: 'PC0303',
          value: '레고',
          parent: 'PC03',
          depth: 2
        },
      ]
		}, {
    _id: 'orderState',
      title: '주문 상태',
      codes: [
        {
          sort: 1,
          code: 'OS010',
          value: '주문 완료'
        }, {
          sort: 2,
          code: 'OS020',
          value: '결제 완료'
        }, {
          sort: 3,
          code: 'OS030',
          value: '배송 준비중'
        }, {
          sort: 4,
          code: 'OS040',
          value: '배송 완료'
        }, {
          sort: 5,
          code: 'OS110',
          value: '반품 요청'
        }, {
          sort: 6,
          code: 'OS120',
          value: '반품 처리중'
        }, {
          sort: 7,
          code: 'OS130',
          value: '반품 완료'
        }, {
          sort: 8,
          code: 'OS210',
          value: '교환 요청'
        }, {
          sort: 9,
          code: 'OS220',
          value: '교환 처리중'
        }, {
          sort: 10,
          code: 'OS230',
          value: '교환 완료'
        }, {
          sort: 11,
          code: 'OS310',
          value: '환불 요청'
        }, {
          sort: 12,
          code: 'OS320',
          value: '환불 처리중'
        }, {
          sort: 13,
          code: 'OS330',
          value: '환불 완료'
        }
      ]
    }
	];
	await db.code.insertMany(data);	
}

// 모든 상품명을 출력한다.
async function productList(){
	var result = await db.product.find({}, {projection: {_id: 0, name: 1}}).toArray();
  logger.log(`상품 ${result.length}건 조회됨.`);
  logger.log(result);  
}





