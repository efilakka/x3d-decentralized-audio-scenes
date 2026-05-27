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
	var SpatialSound;
	var Gain;
	var AudioClip;
	var TransformNode;

	var TrackCurrentView;

	var source;
	var volume;
	var panner;
	var buffer;
	var resumeTime = 0.0;
	var pauseTime = 0.0;
	var isPaused = false;
	var context;

}

var
	transformArray = [],
	audioDestinationArray = [],
	listenerPointSourceArray = [],
	spatialSoundArray = [],
	gainArray = [],
	soundArray = [],
	audioClipArray = [],
	mainVolume, context, TrackCurrentView
	soundNodesArray = [];




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
		//================ The example of x3dscene.parentNode.id == "camBasedAudio" ================//


	
		for (var x in x3dscene._x3domNode._childNodes) //Find all the elements of the scene: Navigation, Background, Viewpoint, 3 Transform....
		{

			if (x3dom.isa(x3dscene._x3domNode._childNodes[x], x3dom.nodeTypes.Transform)) // -- Find Tranform nodes -- 
			{
				if (x3dscene._x3domNode._childNodes[x]._DEF == 'Transform1') {
					//console.log("I found the " + x3dscene._x3domNode._childNodes[x]._DEF);
					transformArray.push(x3dscene._x3domNode._childNodes[x]);
					//console.log(transformArray[transformArray.length - 1]);
				}
				if (x3dscene._x3domNode._childNodes[x]._DEF == 'Transform2') {
					//console.log("I found the " + x3dscene._x3domNode._childNodes[x]._DEF);
					transformArray.push(x3dscene._x3domNode._childNodes[x]);
					//console.log(transformArray[transformArray.length - 1]);
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

					if (x3dom.isa(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y], x3dom.nodeTypes.SpatialSound)) // -- Find SpatialSound nodes -- 
					{
						//console.log("I found the SpatialSound" + y);
						spatialSoundArray.push(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y]);
						//console.log(spatialSoundArray[spatialSoundArray.length - 1]);

						for (z = 0; z < spatialSoundArray[spatialSoundArray.length - 1]._childNodes.length; z++) {
							if (x3dom.isa(spatialSoundArray[spatialSoundArray.length - 1]._childNodes[z], x3dom.nodeTypes.Gain)) // -- Find Gain nodes -- 
							{
								//console.log("I found the Gain" + y);
								gainArray.push(spatialSoundArray[spatialSoundArray.length - 1]._childNodes[z]);
								//console.log(gainArray[gainArray.length - 1]);

								for (k = 0; k < gainArray[gainArray.length - 1]._childNodes.length; k++) {
									if (x3dom.isa(gainArray[gainArray.length - 1]._childNodes[k], x3dom.nodeTypes.Sound)) // -- Find Sound nodes --
									{
										//console.log("I found the Sound");
										soundArray.push(gainArray[gainArray.length - 1]._childNodes[k]);
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
			newAudioNode.Gain = gainArray[count];
			newAudioNode.AudioDestination = audioDestinationArray[audioDestinationArray.length-1];

			if (newAudioNode.SpatialSound != null) {
				//Create the Panner node - Web Audio API 
				newAudioNode.panner = context.createPanner();

				//Give variables in the Panner node based of the initialization of the SpatialSound X3D node
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
				newAudioNode.panner.coneOuterGain = radToDeg(newAudioNode.SpatialSound._vf.coneOuterGain);

			}

			if (newAudioNode.Gain != null) {
				//Create the Gain node - Web Audio API 
				newAudioNode.volume = context.createGain();
			}

			if (newAudioNode.AudioClip != null) {
				// Create the BufferSource node - Web Audio API
				newAudioNode.source = context.createBufferSource();

				// Give variables in the BufferSource node based of the initialization of the AudioClip X3D node
				newAudioNode.source.loop = newAudioNode.AudioClip._vf.loop;
				newAudioNode.source.playbackRate.value = newAudioNode.AudioClip._vf.pitch;
				newAudioNode.resumeTime = newAudioNode.AudioClip._vf.resumeTime;
				newAudioNode.pauseTime = newAudioNode.AudioClip._vf.pauseTime;
				newAudioNode.isPaused = false;
			}

			//connect source with Gain node
			newAudioNode.source.connect(newAudioNode.volume);

			//connect Gain node with Panner node
			newAudioNode.volume.connect(newAudioNode.panner);

			//check if the ListenerPointSource will be the camera
			if (newAudioNode.ListenerPointSource._vf.trackCurrentView == true) {
				//give orientation to Panner node based on viewpoint
				newAudioNode.ListenerPointSource = x3dom.canvases[0].doc._scene.getViewpoint();
				context.listener.setPosition(x3dom.canvases[0].doc._viewarea._movement.x - newAudioNode.ListenerPointSource._vf.position.x,
					x3dom.canvases[0].doc._viewarea._movement.y - newAudioNode.ListenerPointSource._vf.position.y,
					x3dom.canvases[0].doc._viewarea._movement.z - newAudioNode.ListenerPointSource._vf.position.z);
			}

			//connect the Panner Node with the Destination node
			newAudioNode.panner.connect(context.destination);

			//Connect Panner node with the scene geometry using the Transform node - translation x,y,z
			if (newAudioNode.panner) {

				newAudioNode.panner.setPosition(newAudioNode.TransformNode._vf.translation.x + newAudioNode.SpatialSound._vf.location.x,
					newAudioNode.TransformNode._vf.translation.y + newAudioNode.SpatialSound._vf.location.y,
					newAudioNode.TransformNode._vf.translation.z + newAudioNode.SpatialSound._vf.location.z);

			}


			soundNodesArray.push(newAudioNode);

			console.log("===========================");

			for(var d in soundNodesArray)
			{
				console.log(soundNodesArray[d]);
			}
			console.log("===========================");
			DecodeSpatialAudio(newAudioNode, 1);



		}





	}


	function vectorElement(node, myAttribute) {
		translationVector = node.getAttribute(myAttribute).split(" ");
		return translationVector;
	}

	function radToDeg(value) {

		var temp1 = (parseFloat(value) * 180.0) / 3.14159;
		return Math.floor(temp1);
	}

	function InitiWebAudio() {
		spatialSound = true;
		context = new AudioContext();
		//mainVolume = context.createGain();
		ListenerPointSource = x3dom.canvases[0].doc._scene.getViewpoint();
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

		console.log("---------------------");
		console.log(url);
		console.log("---------------------");



		request.open('GET', '' + url, true);
		request.responseType = 'arraybuffer';
		request.onload = function () {
			var res = request.response;
			console.log("0");

			context.decodeAudioData(res, function (buffer) {console.log("1");
					audioNode.buffer = buffer;
					// Make the sound source use the buffer and start playing it.
					audioNode.source.buffer = audioNode.buffer;

					if (status == 1) {console.log("2");
						if (audioNode.AudioClip._vf.startTime != null) {
							console.log(audioNode.AudioClip._vf.startTime);
							audioNode.source.start(audioNode.AudioClip._vf.startTime);

						} else {console.log("3");
							audioNode.source.start(context.currentTime);

						}
					} else if (status == 2) {console.log("4");
						audioNode.source.start(0, audioNode.resumeTime % audioNode.source.buffer.length);

					}

					if (audioNode.source.stopTime >= 0) {console.log("5");
						audioNode.source.stop(audioNode.source.stopTime("stopTime"));

					}

				},
				function (error) {console.log("6");
					console.error("Decoding the audio buffer failed " + error);
					DecodeAudio(audioNode);
				});
		};
		request.onerror = function () {console.log("7");
			console.log('error');
		}
		console.log("8");
		request.send();
		console.log("9");

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
				if (!init_camBasedAudio) {
					init_camBasedAudio = true;
					animationCam = document.getElementById("cam")
					blueVol = document.getElementById("blueVol");
					greenVol = document.getElementById("greenVol");
					cameraNav = document.getElementById("cam");
				}

				for (var s in soundNodesArray) {
					if (soundNodesArray[s].TransformNode) {
						xVel = x3dom.canvases[0].doc._viewarea._movement.x;
						yVel = x3dom.canvases[0].doc._viewarea._movement.y;
						zVel = x3dom.canvases[0].doc._viewarea._movement.z;

						var dt = (x3dom.canvases[0].fps_t0 - x3dom.canvases[0].lastTimeFPSWasTaken) / 1000;

						if ((xVel - xVelold) != 0 || (yVel - yVelold) != 0 || (zVel - zVelold) != 0) {
							//context.listener.setVelocity((xVel - xVelold) / (curTimestamp - oldTimestamp), (yVel - yVelold) / (curTimestamp - oldTimestamp), (zVel - zVelold) / (curTimestamp - oldTimestamp));
							//context.listener.setVelocity((xVel - xVelold) / dt, (yVel - yVelold) / dt, (zVel - zVelold) / dt);

						} else {
							norm += 1;
							if ((xVel - xVelold) == 0 && (yVel - yVelold) == 0 && (zVel - zVelold) == 0 && norm > 5) {

								norm = 0;
							}
						}

						//oldTimestamp = curTimestamp;
						xVelold = xVel;
						yVelold = yVel;
						zVelold = zVel;



						if (mouse_target) {
							//if(mouse_target.id=="ListenerPointSource" || mouse_target.id=="audioPlaybackSpeed" || mouse_target.id=="audioSource"){
							x3dom.canvases[0].doc._scene.getNavigationInfo()._xmlNode.setAttribute("type", "NONE");
							//}
						} else {
							x3dom.canvases[0].doc._scene.getNavigationInfo()._xmlNode.setAttribute("type", "ANY");
						}


						if (mouse_pos) {
							console.log("mphkaaaaaaaaaa");
							if (mouse_target.id == soundNodesArray[s].TransformNode._xmlNode.id) {

								soundNodesArray[s].TransformNode._xmlNode.setAttribute("translation", "" + mouse_pos.x + " 350 " + mouse_pos.z);

								soundNodesArray[s].panner.setPosition(+mouse_pos.x, 350, +mouse_pos.z);
								//soundNodesArray[s].panner.setVelocity(soundNodesArray[s].TransformNode._vf.translation.x + mouse_pos.x, 0, soundNodesArray[s].TransformNode._vf.translation.z + mouse_pos.z);

							}
						}


					}
				}


				context.listener.setPosition(x3dom.canvases[0].doc._viewarea._movement.x + ListenerPointSource._vf.position.x, x3dom.canvases[0].doc._viewarea._movement.y + ListenerPointSource._vf.position.y, x3dom.canvases[0].doc._viewarea._movement.z + ListenerPointSource._vf.position.z);
				

				var rot_mat = x3dom.canvases[0].doc._viewarea._rotMat.getEulerAngles();
				context.listener.setOrientation(rot_mat[0], rot_mat[1], rot_mat[2], 0, 1, 0);





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