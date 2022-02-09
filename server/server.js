const { Server } = require("socket.io");

const io = new Server(3001, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST']
	}
});

io.on("connection", socket => {

	console.log("Connected");

	socket.on('get-document', documentId => {
		const data = "";
		socket.join(documentId);
		// emit the event with data from database
		socket.emit('load-document', data);
	
		socket.on('send-changes', delta => {
			// broadcast the changes to everyone else in the same room
			socket.broadcast.to(documentId).emit('receive-changes', delta);
		})
	})

	
})