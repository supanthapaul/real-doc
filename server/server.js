const { Server } = require("socket.io");

const io = new Server(3001, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST']
	}
});

io.on("connection", socket => {
	console.log("Connected");
})