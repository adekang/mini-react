// @ts-nocheck
import React,{useState} from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [num] = useState(0);

	return <span>{num}</span>
};

const Child = () => {
	return (
		<div>
			<p>
				<span>hello react</span>
			</p>
			<p>
				<span>Welcome to the app!</span>
			</p>
		</div>
	);
};

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);

