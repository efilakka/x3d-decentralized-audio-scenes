/**
 * Sound Controller for Multi-Source Spatial Audio Navigation Scene - X_ITE Version
 * Enhancing X3D - X_ITE realism with spatial sound
 * Adapted from X3DOM version for X_ITE framework
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
	var analyser;
	var analyserDataArray;
}

var transformArray = [],
	audioDestinationArray = [],
	listenerPointSourceArray = [],
	spatialSoundArray = [],
	gainArray = [],
	soundArray = [],
	audioClipArray = [],
	mainVolume, context, TrackCurrentView,
	soundNodesArray = [];

(function () {
	'use strict';
	
	/** Functions */
	var InitiWebAudio, DetectAudioSupport, DecodeSpatialAudio, DecodeAudio, main, SearchAudioNodes;
	
	/** Variables */
	var x3dWorld, spatialSound = false,
		initialized = false,
		inlineList, inlineListInit = false,
		x3dCanvas, x3dBrowser, x3dScene;

	/** Detect if the audio context is supported. */
	function DetectAudioSupport() {
		window.AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext || window.oAudioContext);
		if (!AudioContext) {
			console.error("AudioContext not supported!");
			return;
		}
		// AudioContext is supported
		InitiWebAudio();
	}

	/** Search the nodes in X3D scene - X_ITE version */
	function SearchAudioNodes(x3dCanvas, x3dScene) {
		// X_ITE: Use x3dCanvas for DOM queries, not x3dScene (which is an X3D node object)
		if (!x3dCanvas) {
			console.error("X_ITE: Canvas not found!");
			return;
		}
		
		// Find Transform nodes by DEF attribute
		// X_ITE: Use querySelectorAll on the canvas (which contains the scene as DOM)
		// Note: In XML/XHTML, attributes are case-sensitive, so we need to check both DEF and def
		var transforms = x3dCanvas.querySelectorAll('Transform');
		for (var i = 0; i < transforms.length; i++) {
			// Try both DEF and def (case-sensitive in XML)
			var def = transforms[i].getAttribute('DEF') || transforms[i].getAttribute('def');
			if (def && (def === 'Sculpture1' || def === 'Sculpture2' || def === 'Sculpture3' || def === 'Sculpture4')) {
				transformArray.push(transforms[i]);
			}
		}

		// Find AudioDestination
		var audioDest = x3dCanvas.querySelector('AudioDestination');
		if (audioDest) {
			audioDestinationArray.push(audioDest);

			// Find ListenerPointSource
			var listener = audioDest.querySelector('ListenerPointSource');
			if (listener) {
				listenerPointSourceArray.push(listener);
			}

			// Find SpatialSound nodes
			var spatialSounds = audioDest.querySelectorAll('SpatialSound');
			for (var j = 0; j < spatialSounds.length; j++) {
				spatialSoundArray.push(spatialSounds[j]);

				// Find Gain nodes
				var gains = spatialSounds[j].querySelectorAll('Gain');
				for (var k = 0; k < gains.length; k++) {
					gainArray.push(gains[k]);

					// Find Sound nodes
					var sounds = gains[k].querySelectorAll('Sound');
					for (var l = 0; l < sounds.length; l++) {
						soundArray.push(sounds[l]);

						// Find AudioClip nodes
						var audioClips = sounds[l].querySelectorAll('AudioClip');
						for (var m = 0; m < audioClips.length; m++) {
							audioClipArray.push(audioClips[m]);
						}
					}
				}
			}
		}
		
		// SearchAudioNodes summary (silent to avoid crashes)

		// Check how many AudioClips there are in scene
		var countAudioclips = audioClipArray.length;

		// Create audio nodes for each AudioClip
		for (var count = 0; count < countAudioclips; count++) {
			var newAudioNode = new X3DSound();
			newAudioNode.AudioClip = audioClipArray[count];
			// ListenerPointSource is optional - use null if not found
			newAudioNode.ListenerPointSource = listenerPointSourceArray.length > 0 ? listenerPointSourceArray[listenerPointSourceArray.length - 1] : null;
			newAudioNode.TransformNode = transformArray[count];
			newAudioNode.SpatialSound = spatialSoundArray[count];
			newAudioNode.Gain = gainArray[count];
			newAudioNode.AudioDestination = audioDestinationArray[audioDestinationArray.length - 1];

			if (newAudioNode.SpatialSound != null) {
				// Create the Panner node - Web Audio API
				newAudioNode.panner = context.createPanner();

				// Configure Panner based on SpatialSound X3D node
				var spatialSoundNode = newAudioNode.SpatialSound;
				var enableHRTF = spatialSoundNode.getAttribute('enableHRTF');
				if (enableHRTF === 'true' || enableHRTF === true) {
					newAudioNode.panner.panningModel = 'HRTF';
				}

				var distanceModel = spatialSoundNode.getAttribute('distanceModel') || 'linear';
				newAudioNode.panner.distanceModel = distanceModel;

				var refDistance = parseFloat(spatialSoundNode.getAttribute('referenceDistance') || '1');
				newAudioNode.panner.refDistance = refDistance;

				var maxDistance = parseFloat(spatialSoundNode.getAttribute('maxDistance') || '2000');
				newAudioNode.panner.maxDistance = maxDistance;

				var rolloffFactor = parseFloat(spatialSoundNode.getAttribute('rolloffFactor') || '2');
				newAudioNode.panner.rolloffFactor = rolloffFactor;

				var coneInnerAngle = parseFloat(spatialSoundNode.getAttribute('coneInnerAngle') || '6.28319');
				newAudioNode.panner.coneInnerAngle = radToDeg(coneInnerAngle);

				var coneOuterAngle = parseFloat(spatialSoundNode.getAttribute('coneOuterAngle') || '6.28319');
				newAudioNode.panner.coneOuterAngle = radToDeg(coneOuterAngle);

				var coneOuterGain = parseFloat(spatialSoundNode.getAttribute('coneOuterGain') || '0');
				newAudioNode.panner.coneOuterGain = coneOuterGain;
			}

			if (newAudioNode.Gain != null) {
				// Create the Gain node - Web Audio API
				newAudioNode.volume = context.createGain();
				var gainValue = parseFloat(newAudioNode.Gain.getAttribute('gain') || '1');
				newAudioNode.volume.gain.value = gainValue;
			}

			if (newAudioNode.AudioClip != null) {
				// Create the BufferSource node - Web Audio API
				newAudioNode.source = context.createBufferSource();

				// Configure BufferSource based on AudioClip X3D node
				var loop = newAudioNode.AudioClip.getAttribute('loop');
				newAudioNode.source.loop = (loop === 'true' || loop === true);

				var pitch = parseFloat(newAudioNode.AudioClip.getAttribute('pitch') || '1');
				newAudioNode.source.playbackRate.value = pitch;

				var resumeTimeAttr = newAudioNode.AudioClip.getAttribute('resumeTime');
				newAudioNode.resumeTime = resumeTimeAttr ? parseFloat(resumeTimeAttr) : 0.0;

				var pauseTimeAttr = newAudioNode.AudioClip.getAttribute('pauseTime');
				newAudioNode.pauseTime = pauseTimeAttr ? parseFloat(pauseTimeAttr) : -1;

				newAudioNode.isPaused = false;
			}

			// Create analyser for audio visualization
			newAudioNode.analyser = context.createAnalyser();
			newAudioNode.analyser.fftSize = 256;
			newAudioNode.analyserDataArray = new Uint8Array(newAudioNode.analyser.frequencyBinCount);

			// Connect audio nodes: source -> volume -> analyser -> panner -> destination
			newAudioNode.source.connect(newAudioNode.volume);
			newAudioNode.volume.connect(newAudioNode.analyser);
			newAudioNode.analyser.connect(newAudioNode.panner);
			newAudioNode.panner.connect(context.destination);
			
			// Audio node connected (silent to avoid crashes)

			// Set initial panner position based on Transform node
			if (newAudioNode.panner && newAudioNode.TransformNode) {
				var transformTranslation = newAudioNode.TransformNode.getAttribute('translation');
				if (transformTranslation) {
					var trans = transformTranslation.split(' ').map(parseFloat);
					var spatialLocation = newAudioNode.SpatialSound.getAttribute('location');
					var loc = spatialLocation ? spatialLocation.split(' ').map(parseFloat) : [0, 0, 0];
					
					newAudioNode.panner.setPosition(
						trans[0] + loc[0],
						trans[1] + loc[1],
						trans[2] + loc[2]
					);
				}
			}

			soundNodesArray.push(newAudioNode);
			DecodeSpatialAudio(newAudioNode, 1);
		}

		// Make soundNodesArray globally available
		window.soundNodesArray = soundNodesArray;
	}

	function radToDeg(value) {
		return (parseFloat(value) * 180.0) / 3.14159;
	}

	function InitiWebAudio() {
		spatialSound = true;
		context = new AudioContext();
		window.context = context; // Make globally available

		// Wait for X_ITE to be ready
		function waitForX_ITE() {
			var attempts = 0;
			var maxAttempts = 50;

			function check() {
				attempts++;
				x3dCanvas = document.querySelector('x3d-canvas');
				
				if (x3dCanvas && x3dCanvas.browser) {
					x3dBrowser = x3dCanvas.browser;
					x3dScene = x3dBrowser.currentScene;
					
				if (x3dScene) {
					console.log("X_ITE initialization successful!");
					console.log("x3dCanvas:", x3dCanvas);
					console.log("x3dScene:", x3dScene);
					console.log("x3dBrowser:", x3dBrowser);
					SearchAudioNodes(x3dCanvas, x3dScene);
					main();
				} else {
					console.log("X_ITE: Scene not ready yet (attempt", attempts, "/", maxAttempts, ")");
					if (attempts < maxAttempts) {
						setTimeout(check, 100);
					}
				}
			} else {
				console.log("X_ITE: Canvas or browser not ready yet (attempt", attempts, "/", maxAttempts, ")");
				if (attempts < maxAttempts) {
					setTimeout(check, 100);
				} else {
					console.error("X_ITE browser failed to initialize after", maxAttempts, "retries");
				}
			}
			}

			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', check);
			} else {
				check();
			}
		}

		waitForX_ITE();
	}

	function DecodeSpatialAudio(audioNode, status) {
		var request = new XMLHttpRequest();
		var urlAttr = audioNode.AudioClip.getAttribute('url');
		if (!urlAttr) return;

		// Parse URL - X3D format: "url1" "url2" "url3"
		var urls = urlAttr.match(/"([^"]+)"/g);
		if (!urls || urls.length === 0) return;

		var url = urls[0].replace(/"/g, '');

		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		
		request.onload = function () {
			var res = request.response;
			if (!res) return;

			context.decodeAudioData(res, 
				function (buffer) {
					audioNode.buffer = buffer;
					audioNode.source.buffer = audioNode.buffer;
					
					console.log(audioClipArray.indexOf(audioNode.AudioClip) + 1, "- Audio buffer decoded, duration:", buffer.duration, "seconds");

					if (status == 1) {
						var startTimeAttr = audioNode.AudioClip.getAttribute('startTime');
						if (startTimeAttr && parseFloat(startTimeAttr) > 0) {
							audioNode.source.start(parseFloat(startTimeAttr));
						} else {
							// Wait for user interaction if AudioContext is suspended
							if (context.state === 'suspended') {
								// Store for later
								audioNode.pendingStart = true;
								console.log(audioClipArray.indexOf(audioNode.AudioClip) + 1, "- Audio source buffer set, AudioContext state: suspended audioInitialized: false");
								console.log("AudioContext not ready, adding to pending list (state:", context.state, "initialized: false)");
							} else {
								console.log(audioClipArray.indexOf(audioNode.AudioClip) + 1, "- Audio source buffer set, AudioContext state:", context.state, "audioInitialized: true");
								console.log(audioClipArray.indexOf(audioNode.AudioClip) + 1, "- Starting audio (status", status + ")");
								audioNode.source.start(context.currentTime);
								console.log(audioClipArray.indexOf(audioNode.AudioClip) + 1, "- Starting audio at currentTime:", context.currentTime);
								console.log("Audio started successfully at currentTime");
							}
						}
					} else if (status == 2) {
						audioNode.source.start(0, audioNode.resumeTime % audioNode.source.buffer.length);
					}

					var stopTimeAttr = audioNode.AudioClip.getAttribute('stopTime');
					if (stopTimeAttr && parseFloat(stopTimeAttr) >= 0) {
						audioNode.source.stop(parseFloat(stopTimeAttr));
					}
				},
				function (error) {
					// Try fallback URL if available
					if (urls.length > 1) {
						var fallbackUrl = urls[1].replace(/"/g, '');
						var fallbackRequest = new XMLHttpRequest();
						fallbackRequest.open('GET', fallbackUrl, true);
						fallbackRequest.responseType = 'arraybuffer';
						fallbackRequest.onload = function() {
							context.decodeAudioData(fallbackRequest.response,
								function(buffer) {
									audioNode.buffer = buffer;
									audioNode.source.buffer = audioNode.buffer;
									if (context.state !== 'suspended') {
										audioNode.source.start(context.currentTime);
									} else {
										audioNode.pendingStart = true;
									}
								},
								function(err) {
									// Decoding failed
								}
							);
						};
						fallbackRequest.send();
					}
				}
			);
		};

		request.onerror = function () {
			// Request failed
		};

		request.send();
	}

	// Resume AudioContext when user interacts
	var resumeInProgress = false;
	window.resumeAudioContext = function() {
		if (resumeInProgress) {
			console.log("AudioContext resume already in progress, skipping...");
			return;
		}
		if (context && context.state === 'suspended') {
			resumeInProgress = true;
			context.resume().then(function() {
				console.log("AudioContext resumed");
				// Start any pending audio
				var pendingCount = 0;
				for (var i = 0; i < soundNodesArray.length; i++) {
					if (soundNodesArray[i].pendingStart && soundNodesArray[i].source && soundNodesArray[i].buffer) {
						pendingCount++;
					}
				}
				console.log("Starting", pendingCount, "pending audio nodes...");
				for (var i = 0; i < soundNodesArray.length; i++) {
					if (soundNodesArray[i].pendingStart && soundNodesArray[i].source && soundNodesArray[i].buffer) {
						console.log("Started pending audio node", (i+1) + "/" + pendingCount);
						try {
							// Reconnect if needed (sometimes connections are lost)
							if (!soundNodesArray[i].source.buffer) {
								soundNodesArray[i].source.buffer = soundNodesArray[i].buffer;
							}
							// Make sure source is connected
							if (soundNodesArray[i].source.numberOfOutputs === 0) {
								soundNodesArray[i].source.connect(soundNodesArray[i].volume);
							}
							soundNodesArray[i].source.start(context.currentTime);
							soundNodesArray[i].pendingStart = false;
							console.log("Audio node", (i+1), "started successfully at", context.currentTime, "state:", soundNodesArray[i].source.playbackState);
						} catch(e) {
							console.error("Error starting audio node", (i+1) + ":", e);
							// Try to recreate the source
							try {
								soundNodesArray[i].source = context.createBufferSource();
								soundNodesArray[i].source.buffer = soundNodesArray[i].buffer;
								soundNodesArray[i].source.loop = soundNodesArray[i].AudioClip.getAttribute('loop') === 'true';
								soundNodesArray[i].source.connect(soundNodesArray[i].volume);
								soundNodesArray[i].source.start(context.currentTime);
								soundNodesArray[i].pendingStart = false;
								console.log("Audio node", (i+1), "recreated and started");
							} catch(e2) {
								console.error("Failed to recreate audio node", (i+1) + ":", e2);
							}
						}
					}
				}
				resumeInProgress = false;
			}).catch(function(err) {
				console.error("Error resuming AudioContext:", err);
				resumeInProgress = false;
			});
		} else {
			console.log("AudioContext already running, state:", context ? context.state : "no context");
		}
	};

	// Main update loop - updates listener and source positions
	main = function main() {
		if (!x3dBrowser || !x3dScene || !spatialSound) {
			requestAnimationFrame(main);
			return;
		}

		// Update listener from bound Viewpoint (runtime pose, not static DOM attributes)
		try {
			if (context.listener) {
				var pose = (typeof window.getGalleryCameraPose === 'function')
					? window.getGalleryCameraPose(x3dCanvas)
					: null;
				if (pose && pose.position && pose.position.length >= 3) {
					context.listener.setPosition(pose.position[0], pose.position[1], pose.position[2]);
				}
				if (pose && pose.orientation && pose.orientation.length >= 4) {
					var o = pose.orientation;
					context.listener.setOrientation(o[0], o[1], o[2], 0, 1, 0);
				}
			}
		} catch (e) {
			// Error updating listener
		}

		// Update panner positions based on Transform nodes
		for (var s = 0; s < soundNodesArray.length; s++) {
			if (soundNodesArray[s].TransformNode && soundNodesArray[s].panner) {
				try {
					var transformTranslation = soundNodesArray[s].TransformNode.getAttribute('translation');
					if (transformTranslation) {
						var trans = transformTranslation.split(' ').map(parseFloat);
						var spatialLocation = soundNodesArray[s].SpatialSound.getAttribute('location');
						var loc = spatialLocation ? spatialLocation.split(' ').map(parseFloat) : [0, 0, 0];
						
						soundNodesArray[s].panner.setPosition(
							trans[0] + loc[0],
							trans[1] + loc[1],
							trans[2] + loc[2]
						);
					}
				} catch(e) {
					// Error updating panner position
				}
			}

			// Handle pause/resume
			if (soundNodesArray[s].pauseTime > 0) {
				if (context.currentTime >= (soundNodesArray[s].pauseTime + soundNodesArray[s].resumeTime) && 
					!soundNodesArray[s].isPaused && soundNodesArray[s].source.buffer) {
					soundNodesArray[s].source.stop(context.currentTime);
					soundNodesArray[s].resumeTime = context.currentTime + (soundNodesArray[s].AudioClip.getAttribute('resumeTime') ? parseFloat(soundNodesArray[s].AudioClip.getAttribute('resumeTime')) : 0);
					soundNodesArray[s].pauseTime = context.currentTime + (soundNodesArray[s].AudioClip.getAttribute('pauseTime') ? parseFloat(soundNodesArray[s].AudioClip.getAttribute('pauseTime')) : -1);
					soundNodesArray[s].isPaused = true;
				}

				if (soundNodesArray[s].isPaused && context.currentTime >= soundNodesArray[s].resumeTime) {
					soundNodesArray[s].source.disconnect(soundNodesArray[s].volume);
					soundNodesArray[s].source = context.createBufferSource();
					soundNodesArray[s].source.loop = soundNodesArray[s].AudioClip.getAttribute('loop') === 'true';
					soundNodesArray[s].source.playbackRate.value = parseFloat(soundNodesArray[s].AudioClip.getAttribute('pitch') || '1');
					soundNodesArray[s].source.connect(soundNodesArray[s].volume);
					DecodeSpatialAudio(soundNodesArray[s], 2);
					soundNodesArray[s].isPaused = false;
				}
			}
		}

		requestAnimationFrame(main);
	};

	// Initialize when page loads
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', DetectAudioSupport);
	} else {
		DetectAudioSupport();
	}

	// Expose InitWebAudio globally for manual initialization if needed
	window.InitWebAudio = InitiWebAudio;

})();
