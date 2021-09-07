



const express = require("express");
const app = express();
const server = require('http').createServer(app);

const cors = require("cors");

app.use(cors({
  origin: "*",
  //methods: ["GET", "POST"],
  credentials: true,
}))

var publicKeys = [];


app.get("/getkey",(req,res) => {

  var keyData = publicKeys.find(e => e.id === req.query.id);

  console.log(keyData)

  res.send({keyData});
})

app.get("/getkeys",(req,res) => {

  keyData = []

  
  req.query.ids.forEach((id) => {
    var key = publicKeys.find(e => e.id === id);

    console.log("/getkeys:",key)
    keyData.push(key);
  })
  res.send({keyData});
})


  




const io = require('socket.io')(server,{
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
})

function addOrUpdatePublicKey(id,publicKeyJwk){
  if(id && publicKeyJwk){

    if(publicKeys.find(e => e.id === id)){
      publicKeys.forEach(e => {
        if(e.id === id){
          e.publicKeyJwk = publicKeyJwk;
        }
      })
    }
    else{
      publicKeys.push({id,publicKeyJwk});
    }
  }
}

io.on('connection', socket => {
  const id = socket.handshake.query.id;
  const publicKeyJwk = socket.handshake.query.publicKeyJwk;
  //console.log("public jwk key", publicKeyJwk);
  addOrUpdatePublicKey(id,publicKeyJwk)
  socket.join(id);

  
  socket.on('set-key',(data) => {
    addOrUpdatePublicKey(data.id,data.publicKeyJwk);
  })

  socket.on('get-key',(data) => {
    var data = publicKeys.find(e => e.id === data.id);
    console.log("get-key data:",data);
    socket.emit('get-key',data);
  })
  

  socket.on('send-message', (data) => {
    console.log(data);
    data.messageData.forEach(Message => {
      var newRecipients = data.messageData.filter(r => r.toId !== Message.toId)
      newRecipients = newRecipients.map(e => e.toId);

      newRecipients.push(id);
      console.log(newRecipients);

      var sendData = {
          recipients: newRecipients, 
          sender: id, 
          publicKeyJwk: Message.publicKeyJwk,
          encryptedMessage: Message.encryptedMessage,
        }

        console.log(sendData);

      socket.broadcast.to(Message.toId).emit('receive-message', sendData)


    })

    // data.recipients.forEach(recipient => {
    //   const newRecipients = data.recipients.filter(r => r !== recipient)
    //   newRecipients.push(id);
    //   //console.log(data);

    //   //console.log(publicKeys.filter(item => item.id === data.senderId));


      
    //   socket.broadcast.to(recipient).emit('receive-message', {
    //     recipients: newRecipients, 
    //     sender: id, 
    //     text: data.text,
    //     key: data.key,
    //     publicKeyJwk: publicKeys.find(e => e.id === data.senderId),
    //     encodedText:data.encodedText,
    //   })
    // })
  })
})



server.listen(5000);