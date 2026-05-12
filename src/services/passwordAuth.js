const PBKDF2_ALGO = 'pbkdf2_sha256'
const PBKDF2_ITERATIONS = 120000
const SALT_BYTES = 16
const HASH_BITS = 256

function toBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function fromBase64(value) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function derivePbkdf2(password, salt, iterations) {
  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(password)
  const keyMaterial = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits'])

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
      salt,
    },
    keyMaterial,
    HASH_BITS,
  )

  return new Uint8Array(derivedBits)
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) mismatch |= a[i] ^ b[i]
  return mismatch === 0
}

export async function hashPassword(password) {
  if (!password) throw new Error('Password is required')

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derivePbkdf2(password, salt, PBKDF2_ITERATIONS)

  return `${PBKDF2_ALGO}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export async function verifyPassword(password, storedHash) {
  try {
    const [algo, iterText, saltText, hashText] = String(storedHash ?? '').split('$')
    if (algo !== PBKDF2_ALGO || !iterText || !saltText || !hashText) return false

    const iterations = Number.parseInt(iterText, 10)
    if (!Number.isInteger(iterations) || iterations <= 0) return false

    const salt = fromBase64(saltText)
    const expected = fromBase64(hashText)
    const actual = await derivePbkdf2(password, salt, iterations)

    return timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
