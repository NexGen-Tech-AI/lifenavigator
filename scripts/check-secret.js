const secret = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';

console.log('NEXTAUTH_SECRET length:', secret.length);
console.log('NEXTAUTH_SECRET preview:', secret.substring(0, 10) + '...');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check if secret is at least 32 characters
if (secret.length < 32) {
  console.error('⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters long!');
  console.error('Current length:', secret.length);
}