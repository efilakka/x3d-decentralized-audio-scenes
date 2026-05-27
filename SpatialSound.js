/**
	* Enhancing X3D - X3DOM realism with spatial sound	
	@implementation Andreas Stamoulias
	@contributor Eftychia Lakka
	@ref https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
	@ref http://webaudio.github.io/web-audio-api/
	@ref http://doc.x3dom.org/author/nodes.html
	@ref http://x3dom.org/x3dom/test/functional/dumpNodeTypeTree.html
*/





//******************************************************************************************************//
//	                                       X3D Abstract Types                                           //
//******************************************************************************************************//


//	### X3DSoundChannelNode ###
x3dom.registerNodeType("X3DSoundChannelNode", "X3DSoundNode", defineClass(x3dom.nodeTypes.X3DSoundNode, function (ctx) {
	x3dom.nodeTypes.X3DSoundChannelNode.superClass.call(this, ctx);

	this.addField_SFString(ctx, 'description', "");
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); //["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); //["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('X3DSoundChannelNode: ');
	}
}));


//	### X3DSoundDestinationNode ###
x3dom.registerNodeType("X3DSoundDestinationNode", "X3DSoundNode", defineClass(x3dom.nodeTypes.X3DSoundNode, function (ctx) {
	x3dom.nodeTypes.X3DSoundDestinationNode.superClass.call(this, ctx);

	this.addField_SFString(ctx, 'description', "");
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFString(ctx, 'mediaDeviceID', '');
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); //["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); //["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFInt32(ctx, 'channelCount', 0);
	

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('X3DSoundDestinationNode: ');
	}
}));


//	### X3DSoundNode ###
x3dom.registerNodeType("X3DSoundNode", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DChildNode, function (ctx) {
	x3dom.nodeTypes.X3DSoundNode.superClass.call(this, ctx);

	this.addField_SFString(ctx, 'description', "");
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('X3DSoundNode: ');
	}
}));


//	### X3DSoundProcessingNode ###
x3dom.registerNodeType("X3DSoundProcessingNode", "X3DTimeDependentNode", defineClass(x3dom.nodeTypes.X3DTimeDependentNode, function (ctx) {
	x3dom.nodeTypes.X3DSoundProcessingNode.superClass.call(this, ctx);

	this.addField_SFString(ctx, 'description', "");
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0);
	this.addField_SFTime(ctx, 'startTime', 0);
	this.addField_SFTime(ctx, 'stopTime', 0);
	this.addField_SFTime(ctx, 'tailTime', 0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); //["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); //["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('X3DSoundProcessingNode: ');
	}
}));


//	### X3DSoundSourceNode ###
x3dom.registerNodeType("X3DSoundSourceNode", "X3DTimeDependentNode", defineClass(x3dom.nodeTypes.X3DTimeDependentNode, function (ctx) {
	x3dom.nodeTypes.X3DSoundSourceNode.superClass.call(this, ctx);

	this.addField_SFString(ctx, 'description', "");
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0);
	this.addField_SFTime(ctx, 'startTime', 0);
	this.addField_SFTime(ctx, 'stopTime', 0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('X3DSoundSourceNode: ');
	}
}));


//******************************************************************************************************//
//	                                          X3D Node reference                                        //
//******************************************************************************************************//

//	### Analyser ###
x3dom.registerNodeType("Analyser", "X3DSoundProcessingNode", defineClass(x3dom.nodeTypes.X3DSoundProcessingNode, function (ctx) {
	x3dom.nodeTypes.Analyser.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFInt32(ctx, 'fftSize', 2048);
	this.addField_SFInt32(ctx, 'frequencyBinCount', 1024);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFFloat(ctx, 'minDecibels', -100);
	this.addField_SFFloat(ctx, 'maxDecibels', -30);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFFloat(ctx, 'smoothingTimeConstant', 0.8);
	this.addField_SFTime(ctx, 'tailTime', 0);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0);
	this.addField_SFTime(ctx, 'startTime', 0);
	this.addField_SFTime(ctx, 'stopTime', 0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); //["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); //["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]


}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('Analyser: ');
	}
}));


//	### AudioClip ###
x3dom.registerNodeType("AudioClip", "X3DSoundSourceNode", defineClass(x3dom.nodeTypes.X3DSoundSourceNode, function (ctx) {
	x3dom.nodeTypes.AudioClip.superClass.call(this, ctx);
	this.addField_SFTime(ctx, 'autoRefresh', 0);
	this.addField_SFTime(ctx, 'autoRefreshTimeLimit', 3600.0);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFBool(ctx, 'load', true);
	this.addField_SFBool(ctx, 'loop', false);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFFloat(ctx, 'pitch', 1.0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_MFString(ctx, 'url', []);
	this.addField_SFTime(ctx, 'duration_changed');
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('AudioClip: ');
	}
}));


//	### AudioDestination ###
x3dom.registerNodeType("AudioDestination", "X3DSoundDestinationNode", defineClass(x3dom.nodeTypes.X3DSoundDestinationNode, function (ctx) {
	x3dom.nodeTypes.AudioDestination.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFInt32(ctx, 'maxChannelCount', 2);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

	this.addField_SFString(ctx, 'mediaDeviceID', '');
	this.addField_SFBool(ctx, 'isActive', true);

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); //["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); //["speakers", "discrete"]
	
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('AudioDestination: ');
	}
}));


//	### BiquadFilter ###
x3dom.registerNodeType("BiquadFilter", "X3DSoundProcessingNode", defineClass(x3dom.nodeTypes.X3DSoundProcessingNode, function (ctx) {
	x3dom.nodeTypes.BiquadFilter.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFFloat(ctx, 'detune', 0.0);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'frequency', 350);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFFloat(ctx, 'qualityFactor', 1);
	this.addField_SFTime(ctx, 'tailTime', 0);
	this.addField_SFString(ctx, 'type', 'lowpass'); //["lowpass",   "highpass", "bandpass", "lowshelf", "highshelf", "peaking",  "notch",    "allpass"]

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFFloat(ctx, 'pitch', 1.0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); //["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); //["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('BiquadFilter: ');
	}
}));




//	### BufferAudioSource ###
x3dom.registerNodeType("BufferAudioSource", "X3DSoundSourceNode", defineClass(x3dom.nodeTypes.X3DSoundSourceNode, function (ctx) {
	x3dom.nodeTypes.BufferAudioSource.superClass.call(this, ctx);
	this.addField_SFTime(ctx, 'autoRefresh', 0.0);
	this.addField_SFTime(ctx, 'autoRefreshTimeLimit', 3600.0);
	this.addField_MFFloat(ctx, 'buffer', []);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFFloat(ctx, 'detune', 0);
	this.addField_SFFloat(ctx, 'bufferDuration', 0);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFBool(ctx, 'load', true);
	this.addField_SFBool(ctx, 'loop', false);
	this.addField_SFFloat(ctx, 'loopEnd', 0.0);
	this.addField_SFFloat(ctx, 'loopStart', 0.0);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

	this.addField_SFInt32(ctx, 'numberOfChannels', 0);
	this.addField_SFFloat(ctx, 'playbackRate', 1.0);
	this.addField_SFFloat(ctx, 'sampleRate', 0.0);
	this.addField_MFString(ctx, 'url', []);
	this.addField_SFInt32(ctx, 'bufferLength', 0);

	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');


	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); //["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); //["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]


}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('BufferAudioSource: ');
	}
}));


//	### ChannelMerger ###
x3dom.registerNodeType("ChannelMerger", "X3DSoundChannelNode", defineClass(x3dom.nodeTypes.X3DSoundChannelNode, function (ctx) {
	x3dom.nodeTypes.ChannelMerger.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
	

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('ChannelMerger: ');
	}
}));


//	### ChannelSelector ###
x3dom.registerNodeType("ChannelSelector", "X3DSoundChannelNode", defineClass(x3dom.nodeTypes.X3DSoundChannelNode, function (ctx) {
	x3dom.nodeTypes.ChannelSelector.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

	this.addField_SFInt32(ctx, 'channelSelection', 0);

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
	

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('ChannelSelector: ');
	}
}));



//	### ChannelSplitter ###
x3dom.registerNodeType("ChannelSplitter", "X3DSoundChannelNode", defineClass(x3dom.nodeTypes.X3DSoundChannelNode, function (ctx) {
	x3dom.nodeTypes.ChannelSplitter.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
	
	this.addField_MFNode('outputs', x3dom.nodeTypes.X3DSoundChannelNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('ChannelSplitter: ');
	}
}));



//	### Convolver ###
x3dom.registerNodeType("Convolver", "X3DSoundProcessingNode", defineClass(x3dom.nodeTypes.X3DSoundProcessingNode, function (ctx) {
	x3dom.nodeTypes.Convolver.superClass.call(this, ctx);
	this.addField_MFFloat(ctx, 'buffer', []);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFBool(ctx, 'normalize', false);
	this.addField_SFTime(ctx, 'tailTime', 0.0);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
	

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('Convolver: ');
	}
}));


//	### Delay ###
x3dom.registerNodeType("Delay", "X3DSoundProcessingNode", defineClass(x3dom.nodeTypes.X3DSoundProcessingNode, function (ctx) {
	x3dom.nodeTypes.Delay.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFInt32(ctx, 'delayTime', 0);
	this.addField_SFInt32(ctx, 'maxDelayTime', 1);
	this.addField_SFInt32(ctx, 'tailTime', 0);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('Delay: ');
	}
}));


//	### DynamicsCompressor ###
x3dom.registerNodeType("DynamicsCompressor", "X3DSoundProcessingNode", defineClass(x3dom.nodeTypes.X3DSoundProcessingNode, function (ctx) {
	x3dom.nodeTypes.DynamicsCompressor.superClass.call(this, ctx);
	this.addField_SFFloat(ctx, 'attack', 0.003);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFInt32(ctx, 'knee', 30);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFInt32(ctx, 'ratio', 12);
	this.addField_SFFloat(ctx, 'reduction', 0);
	this.addField_SFInt32(ctx, 'release', 0.25);
	this.addField_SFInt32(ctx, 'tailTime', 0);
	this.addField_SFFloat(ctx, 'threshold', -24);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('DynamicsCompressor: ');
	}
}));


//	### Gain ###
x3dom.registerNodeType("Gain", "X3DSoundProcessingNode", defineClass(x3dom.nodeTypes.X3DSoundProcessingNode, function (ctx) {
	x3dom.nodeTypes.Gain.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFInt32(ctx, 'tailTime', 0);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]


}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('Gain: ');
	}
}));


//	### ListenerPointSource ###
x3dom.registerNodeType("ListenerPointSource", "X3DSoundSourceNode", defineClass(x3dom.nodeTypes.X3DSoundSourceNode, function (ctx) {
	x3dom.nodeTypes.ListenerPointSource.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'dopplerEnabled', false);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFInt32(ctx, 'gain', 1);
	this.addField_SFFloat(ctx, 'interauralDistance ', 0);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);
	this.addField_SFVec3f(ctx, 'position', 0, 0, 0);
	this.addField_SFBool(ctx, 'trackCurrentView', false);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('ListenerPointSource: ');
	}
}));



//	### MicrophoneSource ###
x3dom.registerNodeType("MicrophoneSource", "X3DSoundSourceNode", defineClass(x3dom.nodeTypes.X3DSoundSourceNode, function (ctx) {
	x3dom.nodeTypes.MicrophoneSource.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFInt32(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFString(ctx, 'mediaDeviceID', '');

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('MicrophoneSource: ');
	}
}));


//	### OscillatorSource ###
x3dom.registerNodeType("OscillatorSource", "X3DSoundSourceNode", defineClass(x3dom.nodeTypes.X3DSoundSourceNode, function (ctx) {
	x3dom.nodeTypes.OscillatorSource.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFInt32(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFFloat(ctx, 'detune', 0.0);
	this.addField_SFInt32(ctx, 'frequency', 0);
	this.addField_SFNode('periodicWave', x3dom.nodeTypes.PeriodicWave);

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('OscillatorSource: ');
	}
}));



//	### PeriodicWave ###
x3dom.registerNodeType("PeriodicWave", "X3DSoundNode", defineClass(x3dom.nodeTypes.X3DSoundNode, function (ctx) {
	x3dom.nodeTypes.PeriodicWave.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_MFFloat(ctx, 'optionsReal', []);
	this.addField_MFFloat(ctx, 'optionsImag', []);
	this.addField_SFString(ctx, 'type', 'square'); //["sine", "square", "sawtooth", "triangle", "custom"]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('PeriodicWave: ');
	}
}));


//	### Sound ###
x3dom.registerNodeType("Sound", "X3DSoundNode", defineClass(x3dom.nodeTypes.X3DSoundNode, function (ctx) {
	x3dom.nodeTypes.Sound.superClass.call(this, ctx);
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFVec3f(ctx, 'direction', 0, 0, 1);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'intensity', 1);
	this.addField_SFVec3f(ctx, 'location', 0, 0, 0);
	this.addField_SFFloat(ctx, 'maxBack', 10);
	this.addField_SFFloat(ctx, 'maxFront', 10);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFFloat(ctx, 'minBack', 1);
	this.addField_SFFloat(ctx, 'minFront', 1);
	this.addField_SFFloat(ctx, 'priority', 0);
	this.addField_SFNode('source', x3dom.nodeTypes.X3DSoundSourceNode);
	this.addField_SFBool(ctx, 'spatialize', true);

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('Sound: ');
	}
}));


//	### SpatialSound ###
x3dom.registerNodeType("SpatialSound", "X3DSoundNode", defineClass(x3dom.nodeTypes.X3DSoundNode, function (ctx) {
	x3dom.nodeTypes.SpatialSound.superClass.call(this, ctx);
	this.addField_SFFloat(ctx, 'coneInnerAngle', 6.2832);
	this.addField_SFFloat(ctx, 'coneOuterAngle', 6.2832);
	this.addField_SFFloat(ctx, 'coneOuterGain', 0);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFVec3f(ctx, 'direction', 0, 0, 1);
	this.addField_SFString(ctx, 'distanceModel', 'INVERSE'); //["LINEAR" "INVERSE" "EXPONENTIAL"]
	this.addField_SFBool(ctx, 'dopplerEnabled', false);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFBool(ctx, 'enableHRTF', false);
	this.addField_SFInt32(ctx, 'gain', 1);
	this.addField_SFFloat(ctx, 'intensity', 1);
	this.addField_SFVec3f(ctx, 'location', 0, 0, 0);
	this.addField_SFFloat(ctx, 'maxDistance', 10000);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFFloat(ctx, 'priority', 0);
	this.addField_SFFloat(ctx, 'referenceDistance', 1);
	this.addField_SFFloat(ctx, 'rolloffFactor', 1);
	this.addField_SFBool(ctx, 'spatialize', true);
	
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]
	

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('SpatialSound: ');
	}
}));





//	### StreamAudioDestination ###
x3dom.registerNodeType("StreamAudioDestination", "X3DSoundDestinationNode", defineClass(x3dom.nodeTypes.X3DSoundDestinationNode, function (ctx) {
	x3dom.nodeTypes.StreamAudioDestination.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFInt32(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_MFString(ctx, 'streamIdentifier', []);
	this.addField_SFString(ctx, 'mediaDeviceID', '');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('StreamAudioDestination: ');
	}
}));



//	### StreamAudioSource ###
x3dom.registerNodeType("StreamAudioSource", "X3DSoundSourceNode", defineClass(x3dom.nodeTypes.X3DSoundSourceNode, function (ctx) {
	x3dom.nodeTypes.StreamAudioSource.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'description', '');
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFInt32(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_MFString(ctx, 'streamIdentifier', []);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('StreamAudioSource: ');
	}
}));


//	### WaveShaper ###
x3dom.registerNodeType("WaveShaper", "X3DSoundProcessingNode", defineClass(x3dom.nodeTypes.X3DSoundProcessingNode, function (ctx) {
	x3dom.nodeTypes.WaveShaper.superClass.call(this, ctx);

	this.addField_SFString(ctx, 'description', '');
	this.addField_MFFloat(ctx, 'curve', []);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFInt32(ctx, 'gain', 1);
	this.addField_SFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_SFString(ctx, 'oversample', 'none'); //["none", "2x", "4x"]
	this.addField_SFInt32(ctx, 'tailTime', 0);

	this.addField_SFTime(ctx, 'pauseTime', 0);
	this.addField_SFTime(ctx, 'resumeTime', 0.0);
	this.addField_SFTime(ctx, 'startTime', 0.0);
	this.addField_SFTime(ctx, 'stopTime', 0.0);
	this.addField_SFTime(ctx, 'elapsedTime');
	this.addField_SFBool(ctx, 'isActive');
	this.addField_SFBool(ctx, 'isPaused');

	this.addField_SFInt32(ctx, 'channelCount', 0);
	this.addField_SFString(ctx, 'channelCountMode', 'max'); // ["max", "clamped-max", "explicit"]
	this.addField_SFString(ctx, 'channelInterpretation', 'speakers'); // ["speakers", "discrete"]
	this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode); // [X3DSoundChannelNode,X3DSoundProcessingNode,X3DSoundSourceNode]

}, {
	nodeChanged: function () {
		x3dom.debug.logInfo('WaveShaper: ');
	}
}));