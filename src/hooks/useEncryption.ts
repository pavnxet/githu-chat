import { useState, useEffect } from "react";
import { deriveKey, encryptMessage, decryptMessage } from "@/lib/encryption";

export function useEncryption(username: string) {
  const [key, setKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    if (username) {
      deriveKey(username).then(setKey).catch(console.error);
    }
  }, [username]);

  const encrypt = async (plaintext: string) => {
    if (!key) throw new Error("Encryption key not ready");
    return encryptMessage(key, plaintext);
  };

  const decrypt = async (ciphertext: string, iv: string) => {
    if (!key) throw new Error("Encryption key not ready");
    return decryptMessage(key, ciphertext, iv);
  };

  return { encrypt, decrypt, isReady: !!key };
}
