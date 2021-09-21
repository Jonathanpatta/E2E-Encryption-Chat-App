export default async () => {
    let keyPair = await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-384"
        },
        true,
        ["sign", "verify"]
      );

    return keyPair;
};