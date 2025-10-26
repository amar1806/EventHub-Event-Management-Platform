import crypto from 'crypto';

/**
 * Generates a Gravatar URL for the given email address
 * @param email User's email address
 * @param size Image size in pixels (default: 200)
 * @param defaultImage Default image type to use (default: mp - mystery person)
 * @returns Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 200, defaultImage: string = 'mp') {
  if (!email) return '';
  
  const trimmedEmail = email.trim().toLowerCase();
  const hash = crypto.createHash('md5').update(trimmedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=${defaultImage}&s=${size}`;
} 