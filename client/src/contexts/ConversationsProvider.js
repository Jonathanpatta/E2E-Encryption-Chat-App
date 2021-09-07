import React, { useContext, useState, useEffect, useCallback } from 'react'
import useLocalStorage from '../hooks/useLocalStorage';
import { useContacts } from './ContactsProvider';
import { useSocket } from './SocketProvider';

import deriveKey from '../crypto/deriveKey';

import encryptText from '../crypto/encryptText';
import decryptText from '../crypto/decryptText';

import axios from "axios"

var CryptoJS = require("crypto-js");

var crypto = require("crypto-browserify");

const ConversationsContext = React.createContext()

export function useConversations() {
  return useContext(ConversationsContext)
}

export function ConversationsProvider({ id, clientKey , myKeys , children }) {
  const [conversations, setConversations] = useLocalStorage('conversations', [])
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0)
  const { contacts } = useContacts()
  const socket = useSocket()

  function createConversation(recipients) {
    setConversations(prevConversations => {
      return [...prevConversations, { recipients, messages: [] }]
    })
  }

  const encryptMessage = (text,key) => {
    return CryptoJS.AES.encrypt(text,key).toString();
  }

  const decryptMessage = (text,key) => {
    return CryptoJS.AES.decrypt(text,key).toString(CryptoJS.enc.Utf8);
  }

  

  const addMessageToConversation = useCallback((data) => {

    //{ recipients, text, sender }

    var recipients = data.recipients;
    var text = data.text;
    var sender = data.sender;

    

    
    setConversations(prevConversations => {
      let madeChange = false
      const newMessage = { sender, text }
      const newConversations = prevConversations.map(conversation => {
        if (arrayEquality(conversation.recipients, recipients)) {
          madeChange = true
          return {
            ...conversation,
            messages: [...conversation.messages, newMessage]
          }
        }

        return conversation
      })

      if (madeChange) {
        return newConversations
      } else {
        return [
          ...prevConversations,
          { recipients, messages: [newMessage] }
        ]
      }
    })
  }, [setConversations])

  useEffect(() => {
    if (socket == null) return

    socket.on('receive-message', (data) => {
      // var otherPublicKeyJwk;
      // if(data.publicKeyJwk){
      //   otherPublicKeyJwk = JSON.parse(data.publicKeyJwk.publicKeyJwk);
      // }
      // console.log(otherPublicKeyJwk);
      // //console.log(myKeys);
      // deriveKey(otherPublicKeyJwk,myKeys.privateKeyJwk).then(derivedKey => {
      //   //console.log("derived key:",derivedKey);
      //   //console.log("encoded text: ",encryptText("hello",derivedKey).then(res => console.log(res)))
      //   if (data.encodedText){
      //     decryptText(data.encodedText,deriveKey);
      //   }
      // })
      // data.text = decryptMessage(data.text,data.key);
      
      console.log("received message data:",data)

      if(data){
        var otherPublicKeyJwk;
        if(data.publicKeyJwk){
          otherPublicKeyJwk = JSON.parse(data.publicKeyJwk);
        }

        deriveKey(otherPublicKeyJwk,myKeys.privateKeyJwk)
          .then(derivedKey =>  decryptText(data.encryptedMessage,derivedKey))
          .then(plainText => {
            data.text = plainText;
            addMessageToConversation(data);
          })
      }
    })


    return () => {
      socket.off('receive-message');
    }
  }, [socket, addMessageToConversation])

  function sendMessage(recipients, text) {
    var encryptedText = encryptMessage(text,clientKey);

    axios.get('http://localhost:5000/getkeys',{
      params:{ids:recipients}
    }).then(res => {
      
      var keys = res.data.keyData
      if(keys){


          async function getMessageData(){
            var messageData = [];
            for(var i=0;i<keys.length;i++){
              var item = keys[i];
              var otherPublicKeyJwk = JSON.parse(item.publicKeyJwk);
              await deriveKey(otherPublicKeyJwk,myKeys.privateKeyJwk)
                .then(derivedKey => {
                  return encryptText(text,derivedKey);
                })
                .then(encryptedMessage => {
                  messageData.push({
                    toId:item.id,
                    encryptedMessage,
                    publicKeyJwk: JSON.stringify(myKeys.publicKeyJwk),
                  })
                })
            }
            return messageData;
          }


          keys.forEach(item => {
            
            
          })

        getMessageData().then(e => socket.emit('send-message', { messageData:e }));

        

      }
    })

    

    

    
    

    addMessageToConversation({ recipients, text, sender: id })
  }

  const formattedConversations = conversations.map((conversation, index) => {
    const recipients = conversation.recipients.map(recipient => {
      const contact = contacts.find(contact => {
        return contact.id === recipient
      })
      const name = (contact && contact.name) || recipient
      return { id: recipient, name }
    })

    const messages = conversation.messages.map(message => {
      const contact = contacts.find(contact => {
        return contact.id === message.sender
      })
      const name = (contact && contact.name) || message.sender
      const fromMe = id === message.sender
      return { ...message, senderName: name, fromMe }
    })
    
    const selected = index === selectedConversationIndex
    return { ...conversation, messages, recipients, selected }
  })

  const value = {
    conversations: formattedConversations,
    selectedConversation: formattedConversations[selectedConversationIndex],
    sendMessage,
    selectConversationIndex: setSelectedConversationIndex,
    createConversation
  }

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  )
}

function arrayEquality(a, b) {
  if (a.length !== b.length) return false

  a.sort()
  b.sort()

  return a.every((element, index) => {
    return element === b[index]
  })
}