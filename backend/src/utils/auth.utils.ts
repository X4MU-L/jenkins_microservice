import * as bcrypt from 'bcrypt';
export async function comparePasswords(
  plainText: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(plainText, hashedPassword);
}

export async function hashPassword(password: string) {
  // Hash password before storing
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}
