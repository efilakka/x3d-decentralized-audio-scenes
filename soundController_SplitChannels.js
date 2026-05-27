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

	var Sound;
	var ListenerPointSource;
	var ChannelSplitter;
	var AudioDestination;
	var ChannelMerger;
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

var soundNodesArray = [],
	channelSelectorArray = [],
	channelSplitterArray = [],
	transformArray = [],
	channelMergerArray = [],
	audioDestinationArray = [],
	soundArray = [],
	listenerPointSourceArray = [],
	audioClipArray = [],
	gainArray = [],
	mainVolume, context, TrackCurrentView,
	channelSelectorNodesArray = [];
var countNodes = 0;
var VectorUp = new x3dom.fields.SFVec3f(0, 1, 0);
var countAudioclips = 1;
var enableAudioClip = false;





(function () {
	/** Functions */
	var InitiWebAudio, DetectAudioSupport, DecodeSpatialAudio, DecodeAudio, main, SearchAudioNodes;

	/** Variables */
	var x3dWorld, spatialSound = false,
		splitChannels = true,
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

		//================ The example of x3dscene.parentNode.id == "splitChannels" ================//



		for (var x in x3dscene._x3domNode._childNodes) //Find all the elements of the scene: Navigation, Background, Viewpoint, 3 Transform....
		{

			if (x3dom.isa(x3dscene._x3domNode._childNodes[x], x3dom.nodeTypes.Transform)) // -- Find Tranform3 node -- 
			{
				if (x3dscene._x3domNode._childNodes[x]._xmlNode.getAttribute("id") == 'Transform3') {
					console.log("I found the Transform");
					transformArray.push(x3dscene._x3domNode._childNodes[x]);
					console.log(transformArray[transformArray.length - 1]);
				}

			}

			if (x3dom.isa(x3dscene._x3domNode._childNodes[x], x3dom.nodeTypes.AudioDestination)) // -- Find AudioDestination node -- 
			{
				console.log("I found the AudioDestination");
				audioDestinationArray.push(x3dscene._x3domNode._childNodes[x]);
				console.log(audioDestinationArray[audioDestinationArray.length - 1]);

				for (y = 0; y < audioDestinationArray[audioDestinationArray.length - 1]._childNodes.length; y++) {

					if (x3dom.isa(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y], x3dom.nodeTypes.ListenerPointSource)) // -- Find ListenerPointSource node --
					{
						console.log("I found the ListenerPointSource");
						listenerPointSourceArray.push(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y]);
						console.log(listenerPointSourceArray[listenerPointSourceArray.length - 1]);
					}

					if (x3dom.isa(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y], x3dom.nodeTypes.Gain)) { // -- Find Gain3 node --
						console.log("I found the Gain");
						gainArray.push(audioDestinationArray[audioDestinationArray.length - 1]._childNodes[y]);
						console.log(gainArray[gainArray.length - 1]);

						for (z = 0; z < gainArray[gainArray.length - 1]._childNodes.length; z++) {
							if (x3dom.isa(gainArray[gainArray.length - 1]._childNodes[z], x3dom.nodeTypes.ChannelSplitter)) // -- Find ChannelSplitter node --
							{
								console.log("I found the ChannelSplitter");
								channelSplitterArray.push(gainArray[gainArray.length - 1]._childNodes[z]);
								console.log(channelSplitterArray[channelSplitterArray.length - 1]);

								for (f = 0; f < channelSplitterArray[channelSplitterArray.length - 1]._childNodes.length; f++) {
									if (x3dom.isa(channelSplitterArray[channelSplitterArray.length - 1]._childNodes[f], x3dom.nodeTypes.Sound)) // -- Find Sound node -- 
									{
										console.log("I found the Sound");
										soundArray.push(channelSplitterArray[channelSplitterArray.length - 1]._childNodes[f]);
										console.log(soundArray[soundArray.length - 1]);

										for (p = 0; p < soundArray[soundArray.length - 1]._childNodes.length; p++) {

											if (x3dom.isa(soundArray[soundArray.length - 1]._childNodes[p], x3dom.nodeTypes.AudioClip)) // -- Find AudioClip node --
											{
												console.log("I found the AudioClip");
												audioClipArray.push(soundArray[soundArray.length - 1]._childNodes[p]);
												console.log(audioClipArray[audioClipArray.length - 1]);
												enableAudioClip = true;
											}

										}

									}
								}

							}

							if (x3dom.isa(gainArray[gainArray.length - 1]._childNodes[z], x3dom.nodeTypes.ChannelMerger)) // -- Find ChannelMerger node --
							{
								console.log("I found the ChannelMerger");
								channelMergerArray.push(gainArray[gainArray.length - 1]._childNodes[z]);
								console.log(channelMergerArray[channelMergerArray.length - 1]);

								for (k = 0; k < channelMergerArray[channelMergerArray.length - 1]._childNodes.length; k++) {
									if (x3dom.isa(channelMergerArray[channelMergerArray.length - 1]._childNodes[k], x3dom.nodeTypes.ChannelSelector)) // -- Find ChannelSelector node --
									{
										console.log("I found the ChannelSelector" + k);
										channelSelectorArray.push(channelMergerArray[channelMergerArray.length - 1]._childNodes[k]);
										console.log(channelSelectorArray[channelSelectorArray.length - 1]);

										for (l = 0; l < channelSelectorArray[channelSelectorArray.length - 1]._childNodes.length; l++) {
											if (x3dom.isa(channelSelectorArray[channelSelectorArray.length - 1]._childNodes[l], x3dom.nodeTypes.Gain)) // -- Find Gain node --
											{
												console.log("I found Gain" + k)
												gainArray.push(channelSelectorArray[channelSelectorArray.length - 1]._childNodes[l]);
												console.log(gainArray[gainArray.length - 1]);

												for (m = 0; m < gainArray[gainArray.length - 1]._childNodes.length; m++) {
													if (x3dom.isa(gainArray[gainArray.length - 1]._childNodes[m], x3dom.nodeTypes.ChannelSplitter)) // -- Find ChannelSplitter node --
													{
														console.log("I found ChannelSplitter" + k)
														channelSplitterArray.push(gainArray[gainArray.length - 1]._childNodes[m]);
														console.log(channelSplitterArray[channelSplitterArray.length - 1]);

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

		//I will create the newAudioNode 
		var newAudioNode = new X3DSound;
		newAudioNode.AudioClip = audioClipArray[audioClipArray.length - 1];
		newAudioNode.ListenerPointSource = listenerPointSourceArray[listenerPointSourceArray.length - 1];
		newAudioNode.ChannelMerger = channelMergerArray[channelMergerArray.length - 1];
		newAudioNode.ChannelSplitter = channelSplitterArray[channelSplitterArray.length - 1];
		newAudioNode.TransformNode = transformArray[transformArray.length - 1];

		if (audioClipArray.length != 0 && enableAudioClip == true) {
			// Create an object with a sound source and a volume control.

			newAudioNode.source = context.createBufferSource();

			// Give variables in the BufferSource node based of the initialization of the AudioClip X3D node
			newAudioNode.source.loop = newAudioNode.AudioClip._vf.loop;
			newAudioNode.source.playbackRate.value = newAudioNode.AudioClip._vf.pitch;
			newAudioNode.resumeTime = newAudioNode.AudioClip._vf.resumeTime;
			newAudioNode.pauseTime = newAudioNode.AudioClip._vf.pauseTime;
			newAudioNode.isPaused = false;


		}

		//check if the ListenerPointSource will be the 
		if (listenerPointSourceArray[listenerPointSourceArray.length - 1]._vf.trackCurrentView == true) {

			newAudioNode.ListenerPointSource = x3dom.canvases[0].doc._scene.getViewpoint();

			var rot = new x3dom.fields.Quaternion.parseAxisAngle(newAudioNode.ListenerPointSource._vf.orientation).toAxisAngle();


			context.listener.dopplerFactor = 1;
			context.listener.speedOfSound = 343.3;
			context.listener.setOrientation(0, 0, -1, 0, 1, 0);
			context.listener.setPosition(x3dom.canvases[0].doc._viewarea._movement.x, x3dom.canvases[0].doc._viewarea._movement.y, x3dom.canvases[0].doc._viewarea._movement.z);
			context.listener.setOrientation(rot[0].x, rot[0].y, rot[0].z, VectorUp.x, VectorUp.y, VectorUp.z);

		

		}

		if (channelMergerArray.length != 0) {
			newAudioNode.merger = context.createChannelMerger(2);
			console.log("I create ChannelMerger ");
		}

		if (channelSplitterArray.length != 0) {
			newAudioNode.splitter = context.createChannelSplitter(2);
			console.log("I create ChannelSplitter ");
		}

		if (gainArray[0] = !null) {
			newAudioNode.volume = context.createGain();
			console.log("I create Gain3 ");
		}

		if (gainArray[1] = !null) {
			newAudioNode.gainL = context.createGain();
			console.log("I create Gain0 ");
		}

		if (gainArray[2] = !null) {
			newAudioNode.gainR = context.createGain();
			console.log("I create Gain1 ");
		}



		if (channelSplitterArray[0]._DEF == channelSplitterArray[1]._DEF && channelSplitterArray[0]._DEF == channelSplitterArray[2]._DEF) //Check if the ChannelSplitter connect with the other ChannelSelectors
		{
			console.log("ChannelSplitters Nodes have the same ChanellMerger");
			newAudioNode.source.connect(newAudioNode.splitter);

			// Split the stereo signal.

			newAudioNode.gainL.gain.value = 1;
			newAudioNode.gainR.gain.value = 1;

			newAudioNode.splitter.connect(newAudioNode.gainL, channelSelectorArray[0]._vf.channelSelection);
			newAudioNode.splitter.connect(newAudioNode.gainR, channelSelectorArray[1]._vf.channelSelection);

			newAudioNode.gainL.connect(newAudioNode.merger, 0, channelSelectorArray[0]._vf.channelSelection);
			newAudioNode.gainR.connect(newAudioNode.merger, 0, channelSelectorArray[1]._vf.channelSelection);
		}

		newAudioNode.merger.connect(newAudioNode.volume);
		newAudioNode.volume.connect(context.destination);


		soundNodesArray.push(newAudioNode);
		console.log("===========================");
		DecodeSpatialAudio(newAudioNode, 1);




	}




	function InitiWebAudio() {
		spatialSound = true;
		context = new AudioContext();
		ListenerPointSource = x3dom.canvases[0].doc._scene.getViewpoint();
		var VectorUp = new x3dom.fields.SFVec3f(0, 1, 0);
		for (var cv in x3dom.canvases) {
			for (var sc in x3dom.canvases[cv].x3dElem.children) {
				if (x3dom.isa(x3dom.canvases[cv].x3dElem.children[sc]._x3domNode, x3dom.nodeTypes.Scene)) {
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

			if (splitChannels == true && spatialSound) {

				if (!init_splitChannels) {
					init_splitChannels = true;
					pR = document.getElementById("pR");
					pR.setAttribute("center", "0 -40 0");
					pL = document.getElementById("pL");
					pL.setAttribute("center", "0 -40 0");

				}


				for (var s in soundNodesArray) {
					if (soundNodesArray[s].TransformNode) {

						var currNodePos = soundNodesArray[s].TransformNode._vf.translation;

						if (currNodePos.x < 500 && whereTo == "Right") {
							audioChannelController = 5;
							soundNodesArray[s].TransformNode._xmlNode.setAttribute("translation", "" + (currNodePos.x + audioChannelController) + " " + currNodePos.y + " " + currNodePos.z);

							if (currNodePos.x < 0) {
								soundNodesArray[s].gainR.gain.value = 1 - Math.abs(currNodePos.x) / 500;
							} else if (currNodePos.x > 0) {
								if (soundNodesArray[s].gainR.gain.value < 1) {
									soundNodesArray[s].gainR.gain.value = Math.abs(currNodePos.x) / 500;
								}
								if (soundNodesArray[s].gainL.gain.value > 0) {
									soundNodesArray[s].gainL.gain.value = 1 - Math.abs(currNodePos.x) / 500;
								}
							} else {
								soundNodesArray[s].gainR.gain.value = 1;
							}

							if (currNodePos.x >= 500) {
								whereTo = "Left";

							}

						} else if (currNodePos.x > -500 && whereTo == "Left") {

							audioChannelController = -5;
							soundNodesArray[s].TransformNode._xmlNode.setAttribute("translation", "" + (currNodePos.x + audioChannelController) + " " + currNodePos.y + " " + currNodePos.z);


							if (currNodePos.x > 0) {
								soundNodesArray[s].gainL.gain.value = 1 - Math.abs(currNodePos.x) / 500;
							} else if (currNodePos.x < 0) {
								if (soundNodesArray[s].gainL.gain.value < 1) {
									soundNodesArray[s].gainL.gain.value = Math.abs(currNodePos.x) / 500;
								}
								if (soundNodesArray[s].gainR.gain.value > 0) {
									soundNodesArray[s].gainR.gain.value = 1 - Math.abs(currNodePos.x) / 500;
								}
							} else {
								soundNodesArray[s].gainL.gain.value = 1;
							}

							if (currNodePos.x <= -500) {
								whereTo = "Right";

							}
						}
					}

					var gR = soundNodesArray[s].gainR.gain.value;
					var gL = soundNodesArray[s].gainL.gain.value;
					pR.setAttribute('scale', '1 ' + gR + ' 1');
					pL.setAttribute('scale', '1 ' + gL + ' 1');
					pR._x3domNode._cf.children.nodes[0]._cf.appearance.node._cf.material.node._xmlNode.setAttribute("diffuseColor", "" + (1 - gR) + " " + gR + " 0");
					pL._x3domNode._cf.children.nodes[0]._cf.appearance.node._cf.material.node._xmlNode.setAttribute("diffuseColor", "" + (1 - gL) + " " + gL + " 0");

				}

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