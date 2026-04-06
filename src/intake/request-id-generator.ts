import { createLogger } from '../utils/logger';
import crypto from 'crypto';

const logger = createLogger('request-id-generator');

let counter = 0;

export function generateRequestId(prefix: string = 'owl'): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  counter++;
  
  const id = `${prefix}-${timestamp}-${random}-${counter.toString(36)}`;
  
  logger.debug('request_id_generated', { request_id: id });
  
  return id;
}

export function resetCounter(): void {
  counter = 0;
}