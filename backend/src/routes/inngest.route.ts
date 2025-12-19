import { Router } from 'express';
import { serve } from 'inngest/express';
import { Config } from '../config';
import { inngest } from '../config/inngest';
import { inngestFunctions } from '../services/inngest.service';

const router = Router();

// Inngest endpoint - must be publicly accessible
router.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions: inngestFunctions,
    signingKey: Config.INNGEST_SIGNING_KEY,
  })
);

export default router;
