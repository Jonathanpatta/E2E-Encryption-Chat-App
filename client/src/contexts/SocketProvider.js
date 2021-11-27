import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

const SocketContext = React.createContext()

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider(data) {
  var id=data.id;
  var clientPublicKey = data.keys?.publicKeyJwk ;
  var children = data.children;


  const [socket, setSocket] = useState()

  useEffect(() => {

   
    var newSocket;
    newSocket = io(
      'http://localhost:5000',
      {
        withCredentials: true,
        query: { 
          id, 
          publicKeyJwk: JSON.stringify(clientPublicKey) 
        }
      },
    )
    setSocket(newSocket)
    

    return () => newSocket.close()
  }, [id,clientPublicKey])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
