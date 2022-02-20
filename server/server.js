require("dotenv").config();
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const Document = require('./models/Document');

mongoose.connect(process.env.MONGOURL);

const io = new Server(3001, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST']
	}
});

io.on("connection", socket => {

	console.log("Connected");

	socket.on('get-document', async documentId => {
		const document= await findOrCreateDocument(documentId);
		socket.join(documentId);
		// emit the event with data from database
		socket.emit('load-document', document);
	
		socket.on('send-changes', delta => {
			// broadcast the changes to everyone else in the same room
			socket.broadcast.to(documentId).emit('receive-changes', delta);
		})

		socket.on('save-document', async data => {
			await Document.findByIdAndUpdate(documentId, { data });
		})
	})
});

async function findOrCreateDocument(id) {
	if(id == null) return;

	const document = await Document.findById(id);
	//console.log(document)
	if(document) return document;

	return await Document.create({_id: id, title: "New Document", data: ""});
}