import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

// Hash a password with a random salt
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

// Verify a password against a hash
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, storedHash] = hashedPassword.split(":")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(hash, "hex"))
}
