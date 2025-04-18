// @ts-nocheck
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	return (
		<div onClick={() => { console.log('1'); }}>
			<div onClick={() => { console.log('2'); }}>
					<div onClick={() => { console.log('3'); }}>
							<span>{11111}</span>
					</div>
		</div>
	</div>
	)
};



const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);
