const io = require('socket.io')(5000)

io.on('connection', socket => {
  const id = socket.handshake.query.id
  socket.join(id)

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
      })
    })
  })
})