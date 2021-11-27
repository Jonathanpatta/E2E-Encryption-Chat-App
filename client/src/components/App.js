import React from 'react'
import Login from './Login'
import useLocalStorage from '../hooks/useLocalStorage';
import Dashboard from './Dashboard'
import { ContactsProvider } from '../contexts/ContactsProvider'
import { ConversationsProvider } from '../contexts/ConversationsProvider';
import { SocketProvider } from '../contexts/SocketProvider';






function App() {
  const [id, setId] = useLocalStorage('id');
  
  const [dhKeys, setDhKeys] = useLocalStorage('dhkey');

  
  const dashboard = (
    
    <SocketProvider id={id} keys={dhKeys}>
      <ContactsProvider>
        <ConversationsProvider id={id}  myKeys={dhKeys}>
          <Dashboard id={id} />
        </ConversationsProvider>
      </ContactsProvider>
    </SocketProvider>
  )
  


  return (
    <SocketProvider id={id} keys={dhKeys}>
      {id ? dashboard : <Login onIdSubmit={setId} onDHKeySubmit={setDhKeys}/>}
    </SocketProvider>
      
      
  )
}

export default App;
