import Pulse from '@pulsecron/pulse';
import config from '../config';

const pulse = new Pulse({
  db: { address: config.DB_URL, collection: 'jobs' },
  defaultConcurrency: 1,
});

export default pulse;
