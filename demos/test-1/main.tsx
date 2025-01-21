// @ts-nocheck

import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
	return (
		<h1>
			<h2>
				<h3>
					hello react
				</h3>
			</h2>
		</h1>
	)
}

const root = document.getElementById('root');


ReactDOM.createRoot(root).render(App);

console.log(React);
console.log(App);
console.log(ReactDOM);
