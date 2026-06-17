import { AES } from "crypto-es";

// Reemplaza con la clave secreta exacta que usa tu backend (puedes usar variables de entorno)
const ENCRYPTION_SECRET = "MiClaveUltraSecretaDeConstanza123";

/**
 * Cifra cualquier objeto de JavaScript y lo empaqueta en la estructura esperada por el middleware.
 */
export const encryptPayload = (data: object): { payload: string } => {
  const jsonString = JSON.stringify(data);
  const encrypted = AES.encrypt(jsonString, ENCRYPTION_SECRET).toString();
  return { payload: encrypted };
};
