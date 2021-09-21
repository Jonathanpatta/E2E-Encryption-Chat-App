export default async (messageText,privateKey) => {

    try{
        const encodedText = new TextEncoder().encode(messageText);
        let signature = await window.crypto.subtle.sign(
            {
            name: "ECDSA",
            hash: {name: "SHA-384"},
            },
            privateKey,
            encodedText,
        );

        return signature;
    }

    catch(e){
        console.log(e);

        return `error: ${e}`;
    }
};