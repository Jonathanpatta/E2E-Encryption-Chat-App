import React, { useEffect } from 'react'
import Login from './Login'
import useLocalStorage from '../hooks/useLocalStorage';
import Dashboard from './Dashboard'
import { ContactsProvider } from '../contexts/ContactsProvider'
import { ConversationsProvider } from '../contexts/ConversationsProvider';
import { SocketProvider } from '../contexts/SocketProvider';

var crypto = require("crypto-browserify");




function App() {
  const [id, setId] = useLocalStorage('id');
  const [key, setKey] = useLocalStorage('key');
  var keyPair = crypto.createECDH('secp256k1');
  
  const [dhKeys, setDhKeys] = useLocalStorage('dhkey');

  
  const dashboard = (
    
    <SocketProvider id={id} keys={dhKeys}>
      <ContactsProvider>
        <ConversationsProvider id={id} clientKey={key}>
          <Dashboard id={id} />
        </ConversationsProvider>
      </ContactsProvider>
    </SocketProvider>
  )
  
  useEffect(() => {
    console.log("useEffect 1")
    keyPair.generateKeys();
    var keyData = {
      publicKey: keyPair.getPublicKey().toString('hex'),
      privateKey: keyPair.getPrivateKey().toString('hex'),
    }
    
    setDhKeys(keyData);
  },[])


  useEffect(() => {
    console.log("asdijfh");
  },dhKeys)

  return (
    id ? dashboard : 
    <SocketProvider id={id}>
      <Login onIdSubmit={setId} onKeySubmit={setKey}/>
    </SocketProvider>
      
      
  )
}

export default App;
