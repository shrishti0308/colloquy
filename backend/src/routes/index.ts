import { Router } from 'express';

import authRouter from './auth.route';
import userRouter from './user.route';
import problemRouter from './problem.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/problems', problemRouter);

export default router;
