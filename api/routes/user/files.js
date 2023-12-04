import logger from '#utils/logger.js';
import express from 'express';
import multer from 'multer';
import path from 'node:path';

import shortid from 'shortid';

const router = express.Router();

const storage = multer.diskStorage({
  destination: '../public/uploads/',
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueId = shortid.generate();
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({ storage });

// multer 에러 처리
const handleError = (err, req, res, next) => {
  logger.error(err);
  let message = '';
  if (err instanceof multer.MulterError) {
    if(err.code === 'LIMIT_UNEXPECTED_FILE') {
      if(err.field === 'attach'){
        message = '파일은 한번에 10개 까지만 업로드가 가능합니다.';
      }else{
        message = '첨부 파일 필드명은 attach로 지정해야 합니다.';
      }
    }
    res.status(422).json({ ok: 0, message: message || err.code});
  }else{
    next(err);
  }
};

// 파일 업로드
router.post('/', upload.array('attach', 10), handleError, async function(req, res, next) {
  /*
    #swagger.tags = ['파일']
    #swagger.summary  = '파일 업로드 - 1차'
    #swagger.description = '한번에 최대 10개 까지 파일을 업로드 합니다.<br>회원 가입시 프로필 이미지를 첨부하거나 상품의 이미지를 미리 업로드 한 후 응답 받은 파일 경로를 사용하면 업로드한 파일에 접근이 가능합니다.<br>파일 업로드 완료 후 파일명과 경로를 반환합니다.'
    
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              attach: {
                type: "array",
                items: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          }            
        }
      }
    }
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "단일 파일 업로드": { $ref: "#/components/examples/singleFileUploadRes" },
            "여러 파일 업로드": { $ref: "#/components/examples/multiFileUploadRes" },
          }
        }
      }
    }
    #swagger.responses[422] = {
      description: '입력값 검증 오류',
      content: {
        "application/json": {
          examples: {
            "필드명 오류": { $ref: "#/components/examples/fileUploadFieldError" },
            "최대 허용치 초과 ": { $ref: "#/components/examples/fileUploadLimitError" },
          }
        }
      }
    }
    #swagger.responses[500] = {
      description: '서버 에러',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error500' }
        }
      }
    }

  */
  try{
    logger.debug(req.files);
    const result = { ok: 1 };
    if(req.files.length == 1){  // 단일 파일
      result.file = {
        name: req.files[0].filename,
        path: `/uploads/${req.files[0].filename}`
      }
    }else{  // 여러 파일
      result.files = req.files.map(file => ({
        originalname: file.originalname,
        name: file.filename,
        path: `/uploads/${file.filename}`
      }));
    }
    res.status(201).json(result);
  }catch(err){
    next(err);
  }
});

export default router;