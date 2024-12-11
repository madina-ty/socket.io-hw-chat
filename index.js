import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;
const connectedUsers = [];

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { users: connectedUsers });
});

io.on('connection', (socket) => {
    console.log('A user connected');
    connectedUsers.push(socket.id);
    io.emit('updateUsers', connectedUsers);

    socket.on('disconnect', () => {
        console.log('User disconnected');
        const index = connectedUsers.indexOf(socket.id);
        if (index !== -1) {
            connectedUsers.splice(index, 1);
        }
        io.emit('updateUsers', connectedUsers);
    });

    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);
        const { recipient, message } = data;
        if (connectedUsers.includes(recipient)) {
            io.to(recipient).emit('message', message);
        }
    });
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
