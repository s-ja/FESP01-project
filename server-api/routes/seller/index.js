import productRouter from './products.js';
import jwtAuth from '#middlewares/jwtAuth.js';

import express from 'express';
const router = express.Router({mergeParams: true});

router.use('/seller/products', jwtAuth.auth('seller'), productRouter);

export default router;