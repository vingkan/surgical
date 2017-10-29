let timerEl = document.getElementById('timer');

class Timer{

	constructor(time){
		this.time=time;
	}

	start(){
		var that=this;
		var interval = setInterval(function(){
			if(that.time>0){
				that.time=that.time-1;
				console.log(that.time);
				timerEl.setAttribute('text', 'value', that.time);
			}
			else{
				clearInterval(interval);
				console.log("Time's Up!");
			}
		}, 1000);
	}

	minusTime(time_penalty){
		this.time=this.time-time_penalty;
	}

	addTime(time_bonus){
		this.time=this.time+time_bonus;
	}

}

let mission = {

	ans: {
		condition:"Pneumothoratic tension",
		treatments:[{src:"general anesthesia",time_penalty:25},{src:"give oxygen",time_penalty:15},{src:"vascular surgery",time_penalty:60}]//ordered
	},

	p_overview: {
		name: "Suzette Williams",
		age:32,
		weight: 230,
		height:"5,7",
		notes: " Grandmother has diabetes. Had foot surgery 3 years ago."
	},

	scene: {
		vomit:true,
		moaning:true,
		speech:true,
		concious:true,
		time:180
	},

	test_results: {
		ekg:{src:"ekg.png",time_penalty:20},
		CXR:{src:"CXR-Chest-Lung3.jpg",time_penalty:40},
		CTS:{src:"CTS-1.jpg",time_penalty:60},
		HR:79,
		BP:180
	},

	dialog: {
		where_pain:"in my chest",
		pain_value:"it really hurts, it's like an 8",
		story:"I was walking up the stairs and I started feeling a pain in my left arm,my neck, knee and chest",
		current_medicine:"nope",
		allergies:"pennicillin"
	}

}

let callbackMap = {
	runTest: function(key) {
		let test = mission.test_results[key];
		setScreenImage(test.src);
		timer.minusTime(test.time_penalty);
	}
}

let parts = ['part-facemask', 'part-ivdrip', 'part-scalpel'];
let areas = ['mouth', 'chest', 'arm'];

let matrix = [
	['give oxygen', false, false],
	[false, 'general anesthesia', 'vascular surgery'],
	[false, 'general anesthesia', false]
];

let midx = 0;

function takeAction(action) {
	let treatment = mission.ans.treatments[midx];
	let pidx = parts.indexOf(action.part);
	let aidx = areas.indexOf(action.area);
	let used = matrix[aidx][pidx];
	if (used === treatment.src) {
		console.log('success!');
		midx++;
	} else {
		console.log('wrong thing')
		timer.minusTime(treatment.time_penalty);
	}
	if (midx === mission.ans.treatments.length) {
		alert('you won its over go home');
	}
}

var timer = new Timer(180);
timer.start();
console.log('timer started');

function askAI(textToAsk) {
	return new Promise((resolve, reject) => {
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "https://granite-temper.glitch.me/chatbot",
			"method": "POST",
			"headers": {
			"content-type": "application/json",
			},
			"processData": false,
			"data": `{\n\t\"data\": \"${textToAsk}\"}`
		}

		$.ajax(settings).done(function (response) {
			resolve(response);
		});
	});
}

let recognition = new webkitSpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en";
recognition.start();

recognition.onresult = function(e) {
	//let t = e.results[0][0].transcript;
	for (var i = e.resultIndex; i < e.results.length; ++i) {
		if (e.results[i].isFinal) {
			let ed = e.results[i][0];
			let t = ed.transcript;
			//console.log(t);
			console.log(`I asked: ${t}`);
			askAI(t).then((res) => {
				if (res in mission.dialog) {
					let resp = mission.dialog[res];
					console.log(`AI said: ${resp}`);
					responsiveVoice.speak(resp, "US English Male");
				}
			});
		}
	}
}

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

function degToRad(deg) {
	return (deg / 180) * (Math.PI);
}

function angleVector(v, a) {

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
			takeAction({
				part: part,
				area: props.area
			});
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
			let cursorPos = scaleVector(dir, 1.3);
			this.el.setAttribute('position', cursorPos);
		} else {
			this.el.setAttribute('position', this.data.position);
		}
	}

});


AFRAME.registerComponent('pressable', {

	schema: {
		callback: {type: 'string', default: ''},
		key: {type: 'string', default: ''}
	},

	init: function() {

		let el = this.el;
		let props = this.data;

		el.addEventListener('click', function(e) {
			this.setAttribute('material', 'color', 'white');
			//console.log(e.detail);
			if (props.callback) {
				if (props.callback in callbackMap) {
					callbackMap[props.callback](props.key);
				}
			}
		});

	}

});


