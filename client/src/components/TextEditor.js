import React, { useEffect, useCallback, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';


const TOOLBAR_OPTIONS = [
	[{ header: [1, 2, 3, 4, 5, 6, false] }],
	[{ font: [] }],
	[{ list: "ordered" }, { list: "bullet" }],
	["bold", "italic", "underline"],
	[{ color: [] }, { background: [] }],
	[{ script: "sub" }, { script: "super" }],
	[{ align: [] }],
	["image", "blockquote", "code-block"],
	["clean"],
];

export default function TextEditor() {
	const {id : documentId} = useParams();
	const [socket, setSocket] = useState();
	const [quill, setQuill] = useState();

	useEffect(() => {
		const s = io('http://localhost:3001');
		setSocket(s);

		// cleanup
		return () => {
			s.disconnect();
		}
	}, []);

	useEffect(() => {
		if(socket == null || quill == null) return;

		socket.once('load-document', document => {
			quill.setContents(document);
			quill.enable();
		})
		socket.emit('get-document', documentId);
	}, [socket, quill, documentId]);

	// Handler for sending text changes
	useEffect(() => {
		if(socket == null || quill == null) return;

		const textChangeHandler = (delta, oldDelta, source) => {
			if(source !== 'user') return;
			// send our changes made through socket
			socket.emit('send-changes', delta);
		}

		quill.on('text-change', textChangeHandler);

		// cleanup
		return () => {
			quill.off('text-change', textChangeHandler);
		}
	}, [socket, quill]);

	// Handler for receiving text changes
	useEffect(() => {
		if(socket == null || quill == null) return;
		
		const changeReceiveHandler = (delta) => {
			// apply received changes to our doc
			quill.updateContents(delta);
		}

		socket.on('receive-changes', changeReceiveHandler);

		// cleanup
		return () => {
			socket.off('receive-changes', changeReceiveHandler);
		}
	}, [socket, quill]);

	const wrapperRef = useCallback((wrapper) => {
		if (wrapper == null) return;

		wrapper.innerHTML = '';
		const editor = document.createElement('div');
		wrapper.append(editor);
		
		const myQuill = new Quill(editor, { 
			theme: 'snow', 
			modules: { toolbar: TOOLBAR_OPTIONS } 
		});
		// disable document by default (until socket connection is made)
		myQuill.disable();
		myQuill.setText('Loading...');
		setQuill(myQuill);
	}, []);

	return <div className='container' ref={wrapperRef}></div>;
}
