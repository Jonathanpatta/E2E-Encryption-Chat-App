import React, { useRef } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import { v4 as uuidV4 } from 'uuid'

import generateKeyPair from '../crypto/generateKeyPair';
import signText from '../crypto/signText';

import verifyText from '../crypto/verifyText';
import generateSignatureKeyPair from '../crypto/generateSignatureKeyPair';




export default function Login({ onIdSubmit, onDHKeySubmit}) {
  const idRef = useRef()

  function handleSubmit(e) {
    e.preventDefault()

    onIdSubmit(idRef.current.value)
  }

  function createNewId() {
    onIdSubmit(uuidV4());
    
    generateKeyPair().then(data => {
      onDHKeySubmit(data);
    });

    async function example ()  {

      let keyPair = await generateSignatureKeyPair();

      console.log(keyPair);


      //let keyPair = await generateKeyPair();

      console.log(keyPair);
      var sign = await signText("message",keyPair.privateKey);

      console.log("signature:",sign);
      var verified = await verifyText("message",sign ,keyPair.publicKey);
      console.log(verified);
    }
    example()

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
