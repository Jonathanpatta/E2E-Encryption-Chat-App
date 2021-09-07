
export default async (messageText, derivedKey) => {
    try {

      const initializationVector = new TextEncoder().encode("Initialization Vector")
  
      const string = atob(messageText);
      const uintArray = new Uint8Array(
        [...string].map((char) => char.charCodeAt(0))
      );
      const algorithm = {
        name: "AES-GCM",
        iv: initializationVector,
      };
      const decryptedData = await window.crypto.subtle.decrypt(
        algorithm,
        derivedKey,
        uintArray
      );
  
      return new TextDecoder().decode(decryptedData);
    } catch (e) {
      return `error decrypting message: ${e}`;
    }
  };