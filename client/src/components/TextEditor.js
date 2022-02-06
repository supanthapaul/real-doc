import React, { useEffect, useCallback, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';


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
	const [socket, setSocket] = useState();
	const [quill, setQuill] = useState();

	useEffect(() => {
		const s = io('http://localhost:3001');
		setSocket(s);

		return () => {
			s.disconnect();
		}
	}, []);

	const wrapperRef = useCallback((wrapper) => {
		if (wrapper == null) return;

		wrapper.innerHTML = '';
		const editor = document.createElement('div');
		wrapper.append(editor);
		
		const myQuill = new Quill(editor, { 
			theme: 'snow', 
			modules: { toolbar: TOOLBAR_OPTIONS } 
		});
		setQuill(myQuill);
	}, []);

	return <div class='container' ref={wrapperRef}></div>;
}