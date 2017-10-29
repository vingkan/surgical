class Timer {

	constructor(time){
		this.time = time;
	}

	start() {
		var that = this;
		setInterval(function() {
			that.time=that.time-1;
			//console.log(that.time);
		},1000);
	}

	minusTime(time_penalty) {
		this.time=this.time-time_penalty;
	}

	addTime(time_bonus) {
		this.time=this.time+time_bonus;
	}
}

let mission = {
	ans: {
		condition:"Pneumothoratic tension",
		treatments:["general anesthesia","give oxygen","vascular surgery"]//ordered
	},
	p_overview: {
		name: "Suzette Williams",
		age:32,
		weight: 230,
		height:"5,7",
		notes: "Grandmother has diabetes, had foot surgery 3 years ago"
	},
	scene: {
		vomit:true,
		moaning:true,
		speech:true,
		concious:true,
		time:180
	},
	test_results: {
		EKG:{src:"EKGnormal1.jpg",time_penalty:20},
		CXR:{src:"CXR-Chest-Lung3.jpg",time_penalty:40},
		CTS:{src:"CTS-1.jpg",time_penalty:60},
		HR:79,
		BP:180
	}
}

var timer = new Timer(180);
timer.start();
console.log('timer started');
setTimeout(function(){
	console.log(timer.time);
},5000);
setTimeout(function(){timer.minusTime(20);
console.log('minus timed'+ timer.time);},15000);

let imageScreen = document.getElementById('image-screen');

function setScreenImage(url) {
	imageScreen.setAttribute('src', url);
}

setTimeout(function(){
	setScreenImage('lungs2.jpg');
}, 2000);

let cursorEl = document.getElementById('cursor');

function blinkCursor() {
	cursorEl.setAttribute('material', 'color', 'orange');
	setTimeout(function() {
		cursorEl.setAttribute('material', 'color', 'white');
	}, 1000);
}

let heldEl = null;

function setHeld(el) {
	heldEl = el;
}

function getHeld() {
	return heldEl;
}

function getRay() {
	return cursorEl.components.raycaster.raycaster.ray;
}

function scaleVector(v, s) {
	return {
		x: v.x * s,
		y: v.y *s,
		z: v.z * s
	}
}

function addVector(v1, v2) {
	return {
		x: v1.x + v2.x,
		y: v1.y + v2.y,
		z: v1.z + v2.z
	}
}

// v1 - v2
function subtractVector(v1, v2) {
	return addVector(v1, scaleVector(v2, -1));
}

let patientEl = document.getElementById('patient');

AFRAME.registerComponent('body-part', {

	schema: {
		area: {type: 'string', default: ""}
	},

	init: function() {

		let el = this.el;
		let props = this.data;

		el.addEventListener('click', function(e) {
			blinkCursor();
			let part = (getHeld() || {}).id || 'nothing';
			console.log(`Used ${part} on the patient's ${props.area}.`);
			setHeld(null);
		});

	},

	tick: function() {
		
	}

});

AFRAME.registerComponent('pickupable-ref', {

	schema: {
		ref: {type: 'string', default: ""},
		refPosition: {type: 'vec3'},
		color: {type: 'string'}
	},

	init: function() {

		let el = this.el;
		let props = this.data;
		let obj = document.getElementById(props.ref);
		props.color = this.el.getAttribute('material').color;
		props.refPosition = obj.getAttribute('position');

		el.addEventListener('click', function(e) {
			this.setAttribute('material', 'color', 'orange');
			if (obj) {
				setHeld(obj);
			}
		});

		el.addEventListener('mouseleave', function(e) {
			this.setAttribute('material', 'color', props.color);
		});

	},

	tick: function() {
		let obj = document.getElementById(this.data.ref);
		if (obj) {
			if (getHeld() === obj) {
				let ray = getRay();
				let dir = scaleVector(ray.direction, -1);
				dir = subtractVector(ray.origin, dir);
				let cursorPos = scaleVector(dir, 1.1);
				obj.setAttribute('position', cursorPos);
			} else {
				obj.setAttribute('position', this.data.refPosition);
			}
		}
	}

});

AFRAME.registerComponent('pickupable', {

	schema: {
		position: {type: 'vec3'},
		color: {type: 'string'}
	},

	init: function() {

		let el = this.el;
		let props = this.data;

		props.position = this.el.getAttribute('position');
		props.color = this.el.getAttribute('material').color;

		el.addEventListener('mouseenter', function(e) {
			this.setAttribute('material', 'color', 'orange');
		});

		el.addEventListener('click', function(e) {
			this.setAttribute('material', 'color', 'white');
			//console.log(e.detail);
			setHeld(el);
		});

		el.addEventListener('mouseleave', function(e) {
			this.setAttribute('material', 'color', props.color);
		});

	},

	tick: function() {
		if (getHeld() === this.el) {
			let ray = getRay();
			let dir = scaleVector(ray.direction, -1);
			dir = subtractVector(ray.origin, dir);
			let cursorPos = scaleVector(dir, 1.1);
			this.el.setAttribute('position', cursorPos);
		} else {
			this.el.setAttribute('position', this.data.position);
		}
	}

});


