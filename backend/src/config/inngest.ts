import { Inngest } from 'inngest';
import { Config } from './index';

export const inngest = new Inngest({
  id: 'colloquy',
  eventKey: Config.INNGEST_EVENT_KEY,
});
