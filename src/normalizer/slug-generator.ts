import { createLogger } from '../utils/logger';

const logger = createLogger('slug-generator');

const MAX_SLUG_LENGTH = 50;

export function generateSlug(input: string): string {
  let slug = input.toLowerCase();
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  slug = slug.replace(/-+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  
  if (slug.length > MAX_SLUG_LENGTH) {
    slug = slug.substring(0, MAX_SLUG_LENGTH);
    slug = slug.replace(/-[^-]*$/, '');
  }
  
  if (slug.length === 0) {
    slug = 'unnamed';
  }
  
  logger.debug('slug_generated', { input_length: input.length, slug });
  
  return slug;
}