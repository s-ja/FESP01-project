import jwtAuth from '#middlewares/jwtAuth.js';
import userRouter from './users.js';
import productRouter from './products.js';
import cartRouter from './carts.js';
import orderRouter from './orders.js';
import replyRouter from './replies.js';
import fileRouter from './files.js';
import codeRouter from './codes.js';
import bookmarkRouter from './bookmarks.js';

import express from 'express';
const router = express.Router({mergeParams: true});

router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/orders', jwtAuth.auth('user'), orderRouter);
router.use('/replies', replyRouter);
router.use('/files', fileRouter);
router.use('/carts', jwtAuth.auth('user'), cartRouter);
router.use('/codes', codeRouter);
router.use('/bookmarks', jwtAuth.auth('user'), bookmarkRouter);
export default router;