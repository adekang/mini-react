// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
	return (
		<div>
			<Child />
		</div>
	);
};

const Child = () => {
	return (
		<div>
			<p>
				<span>hello react</span>
			</p>
		</div>
	);
};

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(App);

console.log(React);
console.log(App);
console.log(ReactDOM);
