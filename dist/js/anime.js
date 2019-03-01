var playPause = anime({

 targets: 'div.box',
	Opacity: [
		{ value: 200, duration: 500 },
		{ value: 0, duration: 800 }
	],
	
	delay: function(el, i, l){ return i * 650},
	opacity: '1',
	
	
	

 });