export default async (messageText, signature, publicKey) => {


    try {
        const encodedText = new TextEncoder().encode(messageText);
        
        let result = await window.crypto.subtle.verify(
            {
            name: "ECDSA",
            hash: {name: "SHA-384"},
            },
            publicKey,
            signature,
            encodedText,
        );

        return result;
    }

    catch(e){
        console.log("error verifying signature",e);

        return `error: ${e}`;
    }
};