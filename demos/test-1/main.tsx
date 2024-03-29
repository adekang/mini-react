import React from 'react';
import ReactDOM from 'react-dom';

const jsx = (
	<div>
		<span>hello react</span>
	</div>
);

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(jsx);

console.log(React);
console.log(jsx);
console.log(ReactDOM);
