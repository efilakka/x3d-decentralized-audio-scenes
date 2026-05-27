## Project Title 
Extending X3D Realism with Audio nodes

## Exampes
1. Exampe Split Channels: This X3D scene includes a simple sound source is inculded which can be moved right and left. Depending on the position of the sound source, the user can hear the produced sound from the corresponding output speaker.
2. Example Filters: This X3D scene involves three sound sources. Each of them is visualized by a 3D object (in our case is a sphere) that depicts the sound effects. Specifically, we have added filters through of them we are able to manage the different sound effects in an impressive way. Filters can be composed of a number of attributes, frequency, detune, gain and the quality factor which also known as Q. Furthermore, the filters are classified in some specific types, depending on the sound effects that produce. In detail, there is the Low-pass filter which can create more muffled sound. Another one is the High-pass filter, which is used to generate tinny sound. Equally important is the Band-pass filter, which cuts off low and high frequencies and passes through only these within a certain range. On the contrary, the Notch filter has exactly the opposite operation of the Band-pass filter. Then is the Low-shelf filter, its role is to change the amount of bass in a sound, as a result the frequencies that are lower than the current frequency get a boost, while them that are over it remain unchanged. Next, the High-shelf filter is responsible for the quantity of treble in a sound. Moreover, Peaking filter is used in order to handle the amount of midrange in a sound. Lastly, there is the All-pass filter, whose role is to introduce phaser effects.
3. Example Spatial Audio Camera Animation: In this X3D scene, there are two sound sources in different positions. Through the immersion in the X3D scene the user could attend a rational navigation. Whenever the camera moves in the direction of an existing sound source, the strength of this source increases, while the sound strength of the other (the second one) decreases and vice versa. Through this process, great realism of the scene is achieved, since it emulates the spatial sound in real world.

## Files
1. Exampe Split Channels:
- SplitChannels.xhtml: HTML  DOM. It is  essentially  an  X3D  scene,  directly  from  the X3DOM and no through JavaScript structure.
- soundController_SplitChannels.js:  JavaScript  Controller interacts with the HTML file, for the purpose of parsing the 3D scene and being updated on any potential change in the scene.

2. Example Filters:
- SpatialSoundFilter.xhtml: HTML  DOM. It is  essentially  an  X3D  scene,  directly  from  the X3DOM and no through JavaScript structure.
- soundController_SpatialSoundFilter.js:  JavaScript  Controller interacts with the HTML file, for the purpose of parsing the 3D scene and being updated on any potential change in the scene.

3. Example Spatial Audio Camera Animation:

- SpatialAudioCameraAnimation.xhtml: HTML  DOM. It is  essentially  an  X3D  scene,  directly  from  the X3DOM and no through JavaScript structure.
- soundController_SpatialAudioCameraAnimation.js:  JavaScript  Controller interacts with the HTML file, for the purpose of parsing the 3D scene and being updated on any potential change in the scene.

4. **Multi-Source Spatial Audio Navigation Scene** (X_ITE):

- MultiSourceSpatialAudioNavigationScene_XITE.xhtml: Four spatial audio sources, automated camera tour, live audio statistics, vis.js node graph.
- soundController_MultiSourceSpatialAudioNavigationScene_XITE.js: Web Audio / X3D spatial sound controller for X_ITE.
- scenes/: Chunked X3D files and manifest.json for IPFS / verifiable streaming (paper prototype).

5. SpatialSound.js: The registration of all new nodes in X3DOM.

## Run
It requires a local server. Open **MultiSourceSpatialAudioNavigationScene_XITE.xhtml** for the main demo, or index.html for all examples.
