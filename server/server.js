const io = require('socket.io')(5000)


var publicKeys = [];

io.on('connection', socket => {
  const id = socket.handshake.query.id;
  const publicKey = socket.handshake.query.key;
  if(id && publicKey){

    if(publicKeys.find(e => e.id === id)){
      publicKeys.forEach(e => {
        if(e.id === id){
          e.key = publicKey;
        }
      })
    }
    else{
      publicKeys.push({id,key:publicKey});
    }
  }
  socket.join(id);

  

  

  socket.on('send-message', (data) => {
    console.log(data);
    data.recipients.forEach(recipient => {
      const newRecipients = data.recipients.filter(r => r !== recipient)
      newRecipients.push(id);

      
      socket.broadcast.to(recipient).emit('receive-message', {
        recipients: newRecipients, 
        sender: id, 
        text: data.text,
        key: data.key,
        publicKey: publicKeys.filter(item => item.id === data.senderId),
      })
    })
  })
})