import { Router } from 'express';

import authRouter from './auth.route';
import logRouter from './log.route';
import problemRouter from './problem.route';
import userRouter from './user.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/problems', problemRouter);
router.use('/logs', logRouter);

export default router;
