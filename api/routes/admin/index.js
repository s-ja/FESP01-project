import jwtAuth from '#middlewares/jwtAuth.js';
import codeRouter from './codes.js';

import express from 'express';
const router = express.Router({mergeParams: true});

router.use('/admin/codes', jwtAuth.auth('admin'), codeRouter);

export default router;