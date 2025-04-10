// @ts-nocheck
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [num,setNum] = useState(0);
	window.setNum = setNum;
	return num === 3 ? <Child /> :<span>{num}</span>;
};


const Child = () => {
	return <span>Child</span>;
};

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);
