/**
	* Enhancing X3D - X3DOM realism with spatial sound	
	@implementation Andreas Stamoulias
	@contributor Eftychia Lakka
	@ref https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
	@ref http://webaudio.github.io/web-audio-api/
	@ref http://doc.x3dom.org/author/nodes.html
	@ref http://x3dom.org/x3dom/test/functional/dumpNodeTypeTree.html
*/


function X3DSound() {

	var ListenerPointSource;
	var AudioDestination;
	var DynamicsCompressor;
	var AudioClip;
	var BiquadFilter;
	var Analyser;
	var mainVolume;


	var TransformNode;

	var source;
	var volume;
	var panner;
	var buffer;
	var resumeTime = 0.0;
	var pauseTime = 0.0;
	var isPaused = false;
	var context;

}

var soundNodesArray = [],
	transformArray = [],
	audioDestinationArray = [],
	listenerPointSourceArray = [],
	dynamicsCompressorArray = [],
	gainArray = [],
	spatialSoundArray = [],
	analyserArray = [],
	biquadFilterArray = [],
	soundArray = [],
	audioClipArray = [],
	gainArray2 = [],


	mainVolume, context, compressor, AudioListener, TrackCurrentView;

var countNodes = 0,
	countParse = 0;
var VectorUp = new x3dom.fields.SFVec3f(0, 1, 0);
var countAudioclips = 0;

function AudioController() {
	//filters demo variables
	var filter_control;
	var freq_control;
	var detune_control;
	var q_control;
	var gain_control;
	var init = false;
}

//update based on slider values	
function FilterControl(id, value) {
	var str = id.split('-');

	for (var a in soundNodesArray) {
		var audio = soundNodesArray[a].TransformNode._DEF.split('Audio');
		if (audio[1] == str[1]) {


			switch (str[0]) {
				case "mute_control":
					if (value) {
						soundNodesArray[a].muted = true;
						soundNodesArray[a].volume.gain.value = 0;
					} else {
						soundNodesArray[a].muted = false;
						soundNodesArray[a].volume.gain.value = parseInt(soundNodesArray[a].controller.gain_control.textContent);

					}

					break;
				case "filter_menu":
					switch (value) {
						case "ALLPASS":
							soundNodesArray[a].filter.type = 'allpass';
							break;
						case "LOWPASS":
							soundNodesArray[a].filter.type = 'lowpass';
							break;
						case "HIGHPASS":
							soundNodesArray[a].filter.type = 'highpass';
							break;
						case "BANDPASS":
							soundNodesArray[a].filter.type = 'bandpass';
							break;
						case "LOWSHELF":
							soundNodesArray[a].filter.type = 'lowshelf';
							break;
						case "HIGHSHELF":
							soundNodesArray[a].filter.type = 'highshelf';
							break;
						case "PEAKING":
							soundNodesArray[a].filter.type = 'peaking';
							break;
						case "NOTCH":
							soundNodesArray[a].filter.type = 'notch';
							break;
					}
					break;
				case "freqSlider":
					soundNodesArray[a].filter.frequency.value = value;
					break;
				case "detuneSlider":
					soundNodesArray[a].filter.detune.value = value;
					break;
				case "qSlider":
					soundNodesArray[a].filter.Q.value = value;
					break;
				case "gainSlider":
					if (!soundNodesArray[a].muted) {
						if (value != 0) {
							soundNodesArray[a].volume.gain.value = value;
							soundNodesArray[a].filter.gain.value = value;
						} else {
							soundNodesArray[a].volume.gain.value = 1;
						}
					}
					break;

					////////////////////////////////////////////////////////////////////////////////////
					//oscillator.detune.value = Math.pow(2, 1/12) * 10; // Offset sound by 10 semitones
					////////////////////////////////////////////////////////////////////////////////////

			}

		}
	}

}



(function () {
	/** Functions */
	var InitiWebAudio, DetectAudioSupport, DecodeSpatialAudio, DecodeAudio, main, SearchAudioNodes;

	/** Variables */
	var x3dWorld, spatialSound = false,
		initialized = false,
		inlineList, inlineListInit = false;

	/** Detect if the audio context is supported. */
	function DetectAudioSupport() {
		window.AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext || window.oAudioContext);
		if (!AudioContext) {
			console.log("AudioContext not supported!");
			PlayClassicX3DOMAudio();
		} else {
			console.log("AudioContext is supported!");
			InitiWebAudio();
		}
	}



	/** Search the nodes in X3D scene. */
	function SearchAudioNodes(x3dscene) //all the scene
	{

		if (!initialized) {
			initialized = true;
			compressor = context.createDynamicsCompressor();
		}

		//================ The example of x3dscene.parentNode.id == "filters" ================//
		for (var x in x3dscene._x3domNode._childNodes) //Find all the elements of the scene: Navigation, Background, Viewpoint, 3 Transform....
		{

			if (x3dom.isa(x3dscene._x3domNode._childNodes[x], x3dom.nodeTypes.Transform)) // -- Find Tranform nodes -- 
			{
				if (x3dscene._x3domNode._childNodes[x]._DEF == 'Audio1') {
					console.log("I found the " + x3dscene._x3domNode._childNodes[x]._DEF);
					transformArray.push(x3dscene._x3domNode._childNodes[x]);
					console.log(transformArray[transformArray.length - 1]);
				}
				if (x3dscene._x3domNode._childNodes[x]._DEF == 'Audio2') {
					console.log("I found the " + x3dscene._x3domNode._childNodes[x]._DEF);
					transformArray.push(x3dscene._x3domNode._childNodes[x]);
					console.log(transformArray[transformArray.length - 1]);
				}

				if (x3dscene._x3domNode._childNodes[x]._DEF == 'Audio3') {
					console.log("I found the " + x3dscene._x3domNode._childNodes[x]._DEF);
					transformArray.push(x3dscene._x3domNode._childNodes[x]);
					console.log(transformArray[transformArray.length - 1]);
				}

			}


			if (x3dom.isa(x3dscene._x3domNode._childNodes[x], x3dom.nodeTypes.AudioDestination)) // -- Find AudioDestination node -- 
			{
				//console.log("I found the AudioDestination");
				audioDestinationArray.push(x3dscene._x3domNode._childNodes[x]);
				//console.log(audioDestinationArray[audioDestinationArray.length - 1]);

				for (y = 0; y < audioDestinationArray[audioDestinationArray.length - 1]._childNodes.length; y++) {

					if (x3dom.isa(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y], x3dom.nodeTypes.ListenerPointSource)) // -- Find ListenerPointSource node --
					{
						//console.log("I found the ListenerPointSource");
						listenerPointSourceArray.push(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y]);
						//console.log(listenerPointSourceArray[listenerPointSourceArray.length - 1]);
					}

					if (x3dom.isa(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y], x3dom.nodeTypes.DynamicsCompressor)) // -- Find DynamicsCompressor node --
					{
						//console.log("I found the DynamicsCompressor");
						dynamicsCompressorArray.push(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y]);
						//console.log(dynamicsCompressorArray[dynamicsCompressorArray.length - 1]);

						for (z = 0; z < dynamicsCompressorArray[dynamicsCompressorArray.length - 1]._childNodes.length; z++) {
							if (x3dom.isa(dynamicsCompressorArray[dynamicsCompressorArray.length - 1]._childNodes[z], x3dom.nodeTypes.Gain)) // -- Find Gain node --
							{
								//console.log("I found the Gain");
								gainArray.push(dynamicsCompressorArray[dynamicsCompressorArray.length - 1]._childNodes[z]);
								//console.log(gainArray[gainArray.length - 1]);


								for (k = 0; k < gainArray[gainArray.length - 1]._childNodes.length; k++) {
									if (x3dom.isa(gainArray[gainArray.length - 1]._childNodes[k], x3dom.nodeTypes.SpatialSound)) // -- Find SpatialSound node --
									{
										//console.log("I found the SpatialSound");
										spatialSoundArray.push(gainArray[gainArray.length - 1]._childNodes[k]);
										//console.log(spatialSoundArray[spatialSoundArray.length - 1]);


										for (l = 0; l < spatialSoundArray[spatialSoundArray.length - 1]._childNodes.length; l++) {
											if (x3dom.isa(spatialSoundArray[spatialSoundArray.length - 1]._childNodes[l], x3dom.nodeTypes.Gain)) // -- Find Gain nodes --
											{
												//console.log("I found the Gain");
												gainArray2.push(spatialSoundArray[spatialSoundArray.length - 1]._childNodes[l]);
												//console.log(gainArray2[gainArray2.length - 1]);

												for (m = 0; m < gainArray2[gainArray2.length - 1]._childNodes.length; m++) {
													if (x3dom.isa(gainArray2[gainArray2.length - 1]._childNodes[m], x3dom.nodeTypes.Analyser)) { // -- Find Analyser nodes --
														//console.log("I found the Analyser");
														analyserArray.push(gainArray2[gainArray2.length - 1]._childNodes[m]);
														//console.log(analyserArray[analyserArray.length - 1]);

														for (j = 0; j < analyserArray[analyserArray.length - 1]._childNodes.length; j++) {
															if (x3dom.isa(analyserArray[analyserArray.length - 1]._childNodes[j], x3dom.nodeTypes.BiquadFilter)) // -- Find BiquadFilter nodes --
															{
																//console.log("I found the BiquadFilter");
																biquadFilterArray.push(analyserArray[analyserArray.length - 1]._childNodes[j]);
																//console.log(biquadFilterArray[biquadFilterArray.length - 1]);

																for (i = 0; i < biquadFilterArray[biquadFilterArray.length - 1]._childNodes.length; i++) {
																	if (x3dom.isa(biquadFilterArray[biquadFilterArray.length - 1]._childNodes[i], x3dom.nodeTypes.Sound)) // -- Find Sound nodes --
																		//console.log("I found the Sound");
																	soundArray.push(biquadFilterArray[biquadFilterArray.length - 1]._childNodes[i]);
																	//console.log(soundArray[soundArray.length - 1]);

																	for (p = 0; p < soundArray[soundArray.length - 1]._childNodes.length; p++) {

																		if (x3dom.isa(soundArray[soundArray.length - 1]._childNodes[p], x3dom.nodeTypes.AudioClip)) // -- Find AudioClip node --
																		{
																			//console.log("I found the AudioClip");
																			audioClipArray.push(soundArray[soundArray.length - 1]._childNodes[p]);
																			//console.log(audioClipArray[audioClipArray.length - 1]);
																			enableAudioClip = true;
																		}

																	}

																}


															}


														}
													}
												}

											}
										}
									}

								}
							}

						}
					}
				}
			}


		}

		//Check how many AudioClips(=sound sources) there are in scene
		countAudioclips = audioClipArray.length;
		console.log("In the scene runining " + countAudioclips + " AudioClip Nodes");

		for (count = 0; count < countAudioclips; count++) {
			//I will create the newAudioNode 
			var newAudioNode = new X3DSound;
			newAudioNode.AudioClip = audioClipArray[count];
			newAudioNode.ListenerPointSource = listenerPointSourceArray[listenerPointSourceArray.length - 1];
			newAudioNode.TransformNode = transformArray[count];
			newAudioNode.SpatialSound = spatialSoundArray[count];
			newAudioNode.AudioDestination = audioDestinationArray[audioDestinationArray.length - 1];
			newAudioNode.BiquadFilter = biquadFilterArray[count];
			newAudioNode.Analyser = analyserArray[count];


			// Create an object with a sound source and a volume control.
			newAudioNode.source = context.createBufferSource();

			// Make the sound source loop.
			newAudioNode.source.loop = newAudioNode.AudioClip._vf.loop;
			newAudioNode.source.url = newAudioNode.AudioClip._vf.url;
			newAudioNode.source.playbackRate.value = newAudioNode.AudioClip._vf.pitch;
			newAudioNode.resumeTime = newAudioNode.AudioClip._vf.resumeTime;
			newAudioNode.pauseTime = newAudioNode.AudioClip._vf.pauseTime;
			newAudioNode.isPaused = false;

			if (gainArray.length != 0) {
				
				newAudioNode.volume = context.createGain();
			}

			if (newAudioNode.SpatialSound != null) {
				
				//Create the Panner node - Web Audio API
				newAudioNode.panner = context.createPanner();

				//give variables in the Panner node based of the initialization of the SpatialSound X3D node
				/**.*/
				if (newAudioNode.SpatialSound._vf.enableHRTF == true) newAudioNode.panner.panningModel = 'HRTF';
				/**P*/
				newAudioNode.panner.distanceModel = newAudioNode.SpatialSound._vf.distanceModel;
				/**A*/
				newAudioNode.panner.refDistance = newAudioNode.SpatialSound._vf.referenceDistance;
				/**N*/
				newAudioNode.panner.maxDistance = newAudioNode.SpatialSound._vf.maxDistance;
				/**N*/
				newAudioNode.panner.rolloffFactor = newAudioNode.SpatialSound._vf.rolloffFactor;
				/**E*/
				newAudioNode.panner.coneInnerAngle = radToDeg(newAudioNode.SpatialSound._vf.coneInnerAngle);
				/**R*/
				newAudioNode.panner.coneOuterAngle = radToDeg(newAudioNode.SpatialSound._vf.coneOuterAngle);
				/**.*/
				newAudioNode.panner.coneOuterGain = newAudioNode.SpatialSound._vf.coneOuterGain;

			}

			/**	Check for BiquadFilterNode	*/
			if (newAudioNode.BiquadFilter != null) {
				newAudioNode.filter = context.createBiquadFilter();
				switch (newAudioNode.BiquadFilter._vf.type) {
					case "allpass":
						newAudioNode.filter.type = newAudioNode.filter.ALLPASS;
						break;
					case "lowpass":
						newAudioNode.filter.type = newAudioNode.filter.LOWPASS;
						break;
					case "highpass":
						newAudioNode.filter.type = newAudioNode.filter.HIGHPASS;
						break;
					case "bandpass":
						newAudioNode.filter.type = newAudioNode.filter.BANDPASS;
						break;
					case "lowshelf":
						newAudioNode.filter.type = newAudioNode.filter.LOWSHELF;
						break;
					case "highshelf":
						newAudioNode.filter.type = newAudioNode.filter.HIGHSHELF;
						break;
					case "peaking":
						newAudioNode.filter.type = newAudioNode.filter.PEAKING;
						break;
					case "notch":
						newAudioNode.filter.type = newAudioNode.filter.NOTCH;
						break;

				}

				newAudioNode.filter.frequency.value = newAudioNode.BiquadFilter._vf.frequency;
				newAudioNode.filter.Q.value = newAudioNode.BiquadFilter._vf.qualityFactor;
				newAudioNode.filter.gain.value = newAudioNode.BiquadFilter._vf.gain;
				newAudioNode.volume.gain.value = newAudioNode.BiquadFilter._vf.gain;
				newAudioNode.filter.detune.value = newAudioNode.BiquadFilter._vf.detune;

				newAudioNode.source.connect(newAudioNode.filter);
				if (newAudioNode.Analyser != null) {
					newAudioNode.analyser = context.createAnalyser();
				}

				newAudioNode.filter.connect(newAudioNode.analyser);
				newAudioNode.analyser.connect(newAudioNode.volume);
				newAudioNode.volume.connect(newAudioNode.panner);

			} else {
				newAudioNode.source.connect(newAudioNode.volume);
				newAudioNode.volume.connect(newAudioNode.panner);

			}

			// Hook up the sound volume control to the main volume.
			newAudioNode.panner.connect(mainVolume);

			// Connect the main volume node to the context compressor for smooth effects.

			mainVolume.connect(compressor);
			compressor.connect(context.destination);

			//check if the ListenerPointSource will be the camera
			if (newAudioNode.ListenerPointSource._vf.trackCurrentView == true) {

				//give orientation to Panner node based on viewpoint
				newAudioNode.ListenerPointSource = x3dom.canvases[0].doc._scene.getViewpoint();

			}

			var rot = new x3dom.fields.Quaternion.parseAxisAngle(newAudioNode.ListenerPointSource._vf.orientation).toAxisAngle();
			context.listener.setPosition(x3dom.canvases[0].doc._viewarea._movement.x, x3dom.canvases[0].doc._viewarea._movement.y, x3dom.canvases[0].doc._viewarea._movement.z);
			context.listener.setOrientation(rot[0].x, rot[0].y, rot[0].z, VectorUp.x, VectorUp.y, VectorUp.z);

			var audcon = new AudioController;
			newAudioNode.controller = audcon;

			var num_fix = 0;
			switch (newAudioNode.TransformNode._DEF) {
				case "Audio1":
					num_fix = 1;
					break;
				case "Audio2":
					num_fix = 2;
					break;
				case "Audio3":
					num_fix = 3;
					break;

			}

			audcon.filter_control = document.getElementById('filter_menu-' + num_fix);
			audcon.freq_control = document.getElementById("freqSlider-" + num_fix);
			audcon.detune_control = document.getElementById("detuneSlider-" + num_fix);
			audcon.q_control = document.getElementById("qSlider-" + num_fix);
			audcon.gain_control = document.getElementById("gainSlider-" + num_fix);

			//Connect Panner node with the scene geometry using the Transform node - translation x,y,z
			if (newAudioNode.panner) {

				newAudioNode.panner.setPosition(newAudioNode.TransformNode._vf.translation.x + newAudioNode.SpatialSound._vf.location.x,
					newAudioNode.TransformNode._vf.translation.y + newAudioNode.SpatialSound._vf.location.y,
					newAudioNode.TransformNode._vf.translation.z + newAudioNode.SpatialSound._vf.location.z);

			}





			soundNodesArray.push(newAudioNode);
			DecodeSpatialAudio(newAudioNode, 1);

		}



	}



	function radToDeg(value) {

		var temp1 = (parseFloat(value) * 180.0) / 3.14159;
		return Math.floor(temp1);
	}

	function InitiWebAudio() {
		spatialSound = true;
		context = new AudioContext();

		mainVolume = context.createGain();
		ListenerPointSource = x3dom.canvases[0].doc._scene.getViewpoint();
		var VectorUp = new x3dom.fields.SFVec3f(0, 1, 0);
		for (var cv in x3dom.canvases) {
			for (var sc in x3dom.canvases[cv].x3dElem.children) //length 4 (scene, canvas, ...)
			{
				if (x3dom.isa(x3dom.canvases[cv].x3dElem.children[sc]._x3domNode, x3dom.nodeTypes.Scene)) //Find the Scene???
				{
					x3dWorld = x3dom.canvases[cv].x3dElem.children[sc];

					SearchAudioNodes(x3dWorld);

					inlineList = document.getElementsByTagName("Inline");

				}
			}
		}
	}



	function PlayClassicX3DOMAudio() {
		spatialSound = false;
		for (var cv in x3dom.canvases) {
			for (var sc in x3dom.canvases[cv].x3dElem.children) {
				if (x3dom.isa(x3dom.canvases[cv].x3dElem.children[sc]._x3domNode, x3dom.nodeTypes.Scene)) {
					x3dWorld = x3dom.canvases[cv].x3dElem.children[sc];
					for (var x in x3dWorld._x3domNode._childNodes) {
						if (x3dom.isa(x3dWorld._x3domNode._childNodes[x], x3dom.nodeTypes.AudioBufferSource)) {
							var newAudioNode = new X3DSound;
							newAudioNode.AudioClip = x3dWorld._x3domNode._childNodes[x]._cf.source.node;
							soundNodesArray.push(newAudioNode);
							DecodeAudio(newAudioNode);
						}
					}
				}
			}
		}
	}



	function DecodeAudio(audioNode) {
		var audio = new Audio();
		audio.addEventListener('canplaythrough', function () {
			this.play();
		});
		audio.loop = audioNode.AudioClip._vf.loop;
		audio.src = "" + audioNode.AudioClip._vf.url[0];
	}


	function DecodeSpatialAudio(audioNode, status) {
		var request = new XMLHttpRequest();

		url = audioNode.AudioClip._vf.url[0];

		// console.log("---------------------");
		// console.log(url);
		// console.log("---------------------");



		request.open('GET', '' + url, true);
		request.responseType = 'arraybuffer';
		request.onload = function () {
			var res = request.response;
			//console.log("0");

			context.decodeAudioData(res, function (buffer) {
					//console.log("1");
					audioNode.buffer = buffer;
					// Make the sound source use the buffer and start playing it.
					audioNode.source.buffer = audioNode.buffer;

					if (status == 1) {
						//console.log("2");
						if (audioNode.AudioClip._vf.startTime != null) {
							//console.log(audioNode.AudioClip._vf.startTime);
							audioNode.source.start(audioNode.AudioClip._vf.startTime);

						} else {
							//console.log("3");
							audioNode.source.start(context.currentTime);

						}
					} else if (status == 2) {
						//console.log("4");
						audioNode.source.start(0, audioNode.resumeTime % audioNode.source.buffer.length);

					}

					if (audioNode.source.stopTime >= 0) {
						//console.log("5");
						audioNode.source.stop(audioNode.source.stopTime("stopTime"));

					}

				},
				function (error) {
					//console.log("6");
					console.error("Decoding the audio buffer failed " + error);
					DecodeAudio(audioNode);
				});
		};
		request.onerror = function () {
			//console.log("7");
			console.log('error');
		}
		//console.log("8");
		request.send();
		//console.log("9");


	}

	var mouse_target = null,
		mouse_over = null,
		mouse_pos = null;

	var timer = 0;
	var interpolate = false,
		from = 0,
		to = 0;
	var audioChannelController = 0;
	var whereTo = "Right";
	var init_splitChannels = false,
		init_camBasedAudio = false,
		init_singleAudio = false;
	var pR = 0.0,
		pL = 0.0;
	var xVel = 0.0,
		yVel = 0.0,
		zVel = 0.0,
		xVelold = 0.0,
		yVelold = 0.0,
		zVelold = 0.0;
	var curTimestamp = 0,
		oldTimestamp = 0;
	var norm = 0;

	var singleAudioVol;

	var blueVol, greenVol;
	var cameraNav;
	var currCamPos = 10000;
	var t = 0;

	var animationCam;
	var rota = 0.0;
	var mouseEntered = false;

	main = function main() {

		timer += 1;
		stime = Date.now();
		if (x3dWorld.parentNode.runtime.ready) {
			if (inlineList.length > 0 && !inlineListInit) {
				if (inlineList[0]._x3domNode._cf.children.nodes[0]) {
					if (inlineList[0]._x3domNode._cf.children.nodes[0]._xmlNode) {
						inlineListInit = true;
						for (var o in inlineList) {

							if (inlineList[o]._x3domNode._cf.children.nodes[0]) {
								var inlineScene = inlineList[o]._x3domNode._cf.children.nodes[0]._xmlNode;

								SearchAudioNodes(inlineScene);
							}

						}
					}
				}
			}

			//Track buffer current time and pause/resume audio
			for (var a in soundNodesArray) {
				if (soundNodesArray[a].pauseTime > 0) {

					if (context.currentTime >= (soundNodesArray[a].pauseTime + soundNodesArray[a].resumeTime) && !soundNodesArray[a].isPaused && soundNodesArray[a].source.buffer) {

						soundNodesArray[a].source.stop(context.currentTime);
						context.currentTime = 0;
						soundNodesArray[a].resumeTime = context.currentTime + soundNodesArray[a].AudioClip._vf.resumeTime; //soundNodesArray[a].AudioClip._vf.pauseTime;
						soundNodesArray[a].pauseTime = context.currentTime + soundNodesArray[a].AudioClip._vf.pauseTime; //soundNodesArray[a].AudioClip._vf.pauseTime;
						soundNodesArray[a].isPaused = true;
					}

					if (soundNodesArray[a].isPaused && context.currentTime >= soundNodesArray[a].resumeTime) {
						soundNodesArray[a].source.disconnect(soundNodesArray[a].volume);
						soundNodesArray[a].source = context.createBufferSource();
						soundNodesArray[a].source.loop = soundNodesArray[a].AudioClip._vf.loop;
						soundNodesArray[a].source.playbackRate.value = soundNodesArray[a].AudioClip._vf.pitch;
						soundNodesArray[a].source.connect(soundNodesArray[a].volume);

						DecodeSpatialAudio(soundNodesArray[a], 2);

						soundNodesArray[a].isPaused = false;
					}
				}
			}

			if (spatialSound) {


				for (var an in soundNodesArray) {

					var bufferLength = soundNodesArray[an].analyser.frequencyBinCount;
					var dataArray = new Uint8Array(bufferLength);




					soundNodesArray[an].analyser.getByteFrequencyData(dataArray); //fill dataArray from analyser
					var amplitude = "";
					var amplitudeColor = "";
					var sample = parseInt(soundNodesArray[an].analyser.frequencyBinCount);
					var high = 0,
						mid = 0,
						low = 0;
					var sampleRate = 1;
					var spiral = 1;
					if (!soundNodesArray[an].muted) {
						for (var i = 0; i < soundNodesArray[an].analyser.frequencyBinCount; i += sampleRate) {
							if (i <= sample / 3) {
								high += dataArray[i];
							} else if (i > sample / 3 && i <= 2 * sample / 3) {
								mid += dataArray[i];
							} else {
								low += dataArray[i];
							}

							var pos = soundNodesArray[an].TransformNode._vf.translation.x - 30;

							/*
							if(i<50){
								spiral = 1;
							}
							else{
								spiral = -1;
							}
							*/



							amplitude += "" + (pos + (i * 0.1)) + " " + (dataArray[i] + soundNodesArray[an].volume.gain.value) + " 0 ";
							//amplitude += ""+(pos+(i*0.1))*spiral+" "+(dataArray[i]+soundNodesArray[an].volume.gain.value)+" "+spiral+" ";
							amplitudeColor += "" + (dataArray[i] / 25) + " " + (dataArray[i] / 100) + " " + (dataArray[i] / 200) + " ";
						}

						//soundNodesArray[an].TransformNode._cf.children.nodes[0]._cf.appearance.node._cf.material.node._xmlNode.setAttribute('diffuseColor', ''+high/(255*(sample/(3*sampleRate)))+' '+mid/(255*(sample/(3*sampleRate)))+' '+low/(255*(sample/(3*sampleRate))));

						var value = high / (255 * (sample / (3 * sampleRate))) * 0.5 + mid / (255 * (sample / (3 * sampleRate))) * 1.1 + low / (255 * (sample / (3 * sampleRate))) * 0.3;

						if(soundNodesArray[an].volume.gain.value > 0){
							soundNodesArray[an].TransformNode._cf.children.nodes[0]._cf.appearance.node._cf.material.node._xmlNode.setAttribute('diffuseColor', '0 '+value+' '+soundNodesArray[an].volume.gain.value/40);
						}
						else if(soundNodesArray[an].volume.gain.value < 0){
							soundNodesArray[an].TransformNode._cf.children.nodes[0]._cf.appearance.node._cf.material.node._xmlNode.setAttribute('diffuseColor', ''+(-soundNodesArray[an].volume.gain.value)/40+' '+value+' 0');
						}
						else{
							soundNodesArray[an].TransformNode._cf.children.nodes[0]._cf.appearance.node._cf.material.node._xmlNode.setAttribute('diffuseColor', '0 '+value+' 0');
						}


						if (!soundNodesArray[an].pointSetCreated) {
							soundNodesArray[an].pointSetCreated = true;
							var new_shape = document.createElement('Shape');
							var pointSet = document.createElement('PointSet');
							var coord = document.createElement('Coordinate');
							coord.setAttribute('point', '' + amplitude);
							var color = document.createElement('Color');
							color.setAttribute('color', '' + amplitudeColor);

							new_shape.appendChild(pointSet);
							pointSet.appendChild(coord);
							pointSet.appendChild(color);

							document.getElementById('AnimDataPoint').appendChild(new_shape);
							soundNodesArray[an].pointSet = new_shape;
						} else {
							soundNodesArray[an].pointSet._x3domNode._cf.geometry.node._cf.coord.node._xmlNode.setAttribute('point', '' + amplitude);
							soundNodesArray[an].pointSet._x3domNode._cf.geometry.node._cf.color.node._xmlNode.setAttribute('color', '' + amplitudeColor);
						}
					} else {
						soundNodesArray[an].pointSet._x3domNode._cf.geometry.node._cf.coord.node._xmlNode.setAttribute('point', '0 0 0');
						soundNodesArray[an].pointSet._x3domNode._cf.geometry.node._cf.color.node._xmlNode.setAttribute('color', '0 0 0');
					}





				}


				var rot_mat = x3dom.canvases[0].doc._viewarea._rotMat.getEulerAngles();
				context.listener.setOrientation(rot_mat[0], rot_mat[1], rot_mat[2], 0, 1, 0);


				/*
				context.listener.setPosition(x3dom.canvases[0].doc._viewarea._movement.x-AudioListener._vf.position.x, x3dom.canvases[0].doc._viewarea._movement.y-AudioListener._vf.position.y, x3dom.canvases[0].doc._viewarea._movement.z-AudioListener._vf.position.z);
				context.listener.setOrientation(x3dom.canvases[0].doc._viewarea._last_mat_view.getEulerAngles()[0], x3dom.canvases[0].doc._viewarea._last_mat_view.getEulerAngles()[1], x3dom.canvases[0].doc._viewarea._last_mat_view.getEulerAngles()[2], 0, 1, 0);
				*/


			}


		}

		requestAnimFrame(main);



	};


	window.onload = function () {
		DetectAudioSupport();
		requestAnimFrame(main);

	}

})();



window.requestAnimFrame = (function () {

	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function ( /* function */ callback, /* DOMElement */ element) {
			window.setTimeout(callback, 1000 / 60);
		};

})();