import userRouter from '#routes/user/index.js';
import sellerRouter from '#routes/seller/index.js';

import express from 'express';
const router = express.Router({mergeParams: true});

router.use('/', userRouter);
router.use('/seller', sellerRouter);

export default router;