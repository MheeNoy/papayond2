// utils/hash.js
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 16; // Adjust based on your requirements

export async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

export async function verifyPassword(password, hashedPassword) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}
