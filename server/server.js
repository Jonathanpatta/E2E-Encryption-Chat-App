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


  


//socket stuff here

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
  addOrUpdatePublicKey(id,publicKeyJwk)
  socket.join(id);

  
  socket.on('set-key',(data) => {
    addOrUpdatePublicKey(data.id,data.publicKeyJwk);
  })

  socket.on('get-key',(data) => {
    var data = publicKeys.find(e => e.id === data.id);
    socket.emit('get-key',data);
  })
  

  socket.on('send-message', (data) => {
    data.messageData.forEach(Message => {
      var newRecipients = data.messageData.filter(r => r.toId !== Message.toId)
      newRecipients = newRecipients.map(e => e.toId);

      newRecipients.push(id);

      var sendData = {
          recipients: newRecipients, 
          sender: id, 
          publicKeyJwk: Message.publicKeyJwk,
          encryptedMessage: Message.encryptedMessage,
        }

      socket.broadcast.to(Message.toId).emit('receive-message', sendData)


    })
  })
})



server.listen(5000);