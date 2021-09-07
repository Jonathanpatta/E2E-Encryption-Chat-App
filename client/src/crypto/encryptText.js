export default async (text, derivedKey) => {
    const encodedText = new TextEncoder().encode(text);

    const initializationVector = new TextEncoder().encode("Initialization Vector")

  
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: initializationVector },
      derivedKey,
      encodedText
    );

    const uintArray = new Uint8Array(encryptedData);
  
    const string = String.fromCharCode.apply(null, uintArray);
  
    const base64Data = btoa(string);
    
  
    return base64Data;
  };