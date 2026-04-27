import nacl from 'tweetnacl';
import nacl_util from 'tweetnacl-util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTARY_KEY_PATH = path.join(__dirname, 'notary-keypair.json');

/**
 * Load or generate the Notary's Ed25519 keypair.
 * The keypair is persisted to disk so it survives restarts.
 */
export function loadOrCreateKeypair() {
  if (fs.existsSync(NOTARY_KEY_PATH)) {
    const raw = JSON.parse(fs.readFileSync(NOTARY_KEY_PATH, 'utf-8'));
    return {
      publicKey: nacl_util.decodeBase64(raw.publicKey),
      secretKey: nacl_util.decodeBase64(raw.secretKey),
    };
  }

  const keypair = nacl.sign.keyPair();
  const toSave = {
    publicKey: nacl_util.encodeBase64(keypair.publicKey),
    secretKey: nacl_util.encodeBase64(keypair.secretKey),
  };
  fs.writeFileSync(NOTARY_KEY_PATH, JSON.stringify(toSave, null, 2));
  console.log('[NOTARY] Generated new keypair');
  return keypair;
}

/**
 * Create a signed attestation for a URL check result.
 * 
 * @param {object} keypair - Notary Ed25519 keypair
 * @param {object} data - { url, status, latency, timestamp }
 * @returns {object} - { attestation (the data), signature (base64), publicKey (base64) }
 */
export function createAttestation(keypair, data) {
  const attestation = {
    url: data.url,
    statusCode: data.statusCode,
    latency: data.latency,
    timestamp: data.timestamp || Date.now(),
    nonce: nacl_util.encodeBase64(nacl.randomBytes(16)),
  };

  const message = JSON.stringify(attestation);
  const messageBytes = nacl_util.decodeUTF8(message);
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

  return {
    attestation,
    signature: nacl_util.encodeBase64(signature),
    publicKey: nacl_util.encodeBase64(keypair.publicKey),
  };
}

/**
 * Verify a notary attestation signature.
 * 
 * @param {object} signedAttestation - { attestation, signature, publicKey }
 * @returns {boolean} - True if the signature is valid
 */
export function verifyAttestation(signedAttestation) {
  try {
    const { attestation, signature, publicKey } = signedAttestation;
    const message = JSON.stringify(attestation);
    const messageBytes = nacl_util.decodeUTF8(message);
    const signatureBytes = nacl_util.decodeBase64(signature);
    const publicKeyBytes = nacl_util.decodeBase64(publicKey);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (err) {
    console.error('[NOTARY] Attestation verification failed:', err.message);
    return false;
  }
}
