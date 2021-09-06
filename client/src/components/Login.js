import React, { useRef } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { v4 as uuidV4 } from 'uuid'
import decryptText from '../crypto/decryptText';
import deriveKey from '../crypto/deriveKey';
import encryptText from '../crypto/encryptText';

import generateKeyPair from '../crypto/generateKeyPair';


var crypto = require("crypto-browserify");




export default function Login({ onIdSubmit, onKeySubmit , onDHKeySubmit}) {
  const idRef = useRef()

  function handleSubmit(e) {
    e.preventDefault()

    onIdSubmit(idRef.current.value)
  }

  function createNewId() {
    onIdSubmit(uuidV4());
    onKeySubmit(uuidV4());
    //var keyPair = crypto.createECDH('secp256k1');
    async function examplecode(){

      let aliceKeypair = await generateKeyPair();
      let bobKeypair = await generateKeyPair();


      var newakey = JSON.parse(JSON.stringify(aliceKeypair));
      var newbkey = JSON.parse(JSON.stringify(bobKeypair));

      let sharedalicekey = await deriveKey(newbkey.publicKeyJwk,newakey.privateKeyJwk);
      let sharedbobkey = await deriveKey(newakey.publicKeyJwk,newbkey.privateKeyJwk);




      var mytext = await encryptText("hello", sharedalicekey)
      console.log(mytext);
      var decoded = await encryptText("hello",sharedbobkey)
      console.log(decoded);
    }
    //examplecode();
    
    generateKeyPair().then(data => {
      onDHKeySubmit(data);
    });

    

    // keyPair.generateKeys();
    // var keyData = {
    //   publicKey: keyPair.getPublicKey().toString('hex'),
    //   privateKey: keyPair.getPrivateKey().toString('hex'),
    // }
    // onDHKeySubmit(keyData);
  }

  return (
    <Container className="align-items-center d-flex" style={{ height: '100vh' }}>
      <Form onSubmit={handleSubmit} className="w-100">
        <Form.Group>
          <Form.Label>Enter Your Id</Form.Label>
          <Form.Control type="text" ref={idRef} required />
        </Form.Group>   
        <Button type="submit" className="mr-2">Login</Button>
        <Button onClick={createNewId} variant="secondary">Create A New Id</Button>
      </Form>
    </Container>
  )
}
