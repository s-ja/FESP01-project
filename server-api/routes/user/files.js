import logger from '#utils/logger.js';
import express from 'express';
import multer from 'multer';
import path from 'node:path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: '../public/uploads/',
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// 파일 업로드
router.post('/', upload.single('attach'), async function(req, res, next) {
  /*
    #swagger.tags = ['파일']
    #swagger.summary  = '파일 업로드 - 1차'
    #swagger.description = '파일을 업로드 합니다.<br>회원 가입시 프로필 이미지를 첨부하거나 상품의 이미지를 미리 업로드 한 후 응답 받은 파일 경로를 사용하면 업로드한 파일에 접근이 가능합니다.<br>파일 업로드 완료 후 파일명과 경로를 반환합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              attach: {
                type: "string",
                format: "binary"
              }
            }
          }            
        }
      }
    } 
  */
  try{
    logger.debug(req.file);
    res.json({ok: 1, file: {
      name: req.file.filename,
      path: `/uploads/${req.file.filename}`
    }});
  }catch(err){
    next(err);
  }
});

export default router;