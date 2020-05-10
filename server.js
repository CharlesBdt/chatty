import path from 'path';
import http from 'http';
import express from 'express';
import socketio from 'socket.io';
import formatMessage from './utils/messages';
import users from './utils/users';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatBOT';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = users.userJoin(socket.id, username, room)

    // Join the selected room
    socket.join(user.room);

    // Emit to the user
    socket.emit('message', formatMessage(botName, 'Welcome !'));

    // Broadcast to everyone except the user
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.name} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: users.getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = users.getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.name, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = users.userLeave(socket.id);

    if (user) {
      // Emit to everyone, no exception
      io.to(user.room).emit('message', formatMessage(botName, `${user.name} has left the chat`));

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: users.getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is on port ${PORT}`));
