# rAF - <b>JavaScript animation library for CSS and SVG</b>

<b>It provides a structured, compact way to create and execute CSS or SVG animations of two types:</b><br>
&nbsp;• Gradual value changes, aka easing<br>
&nbsp;• Cue-based animations, where timing cues trigger animation events

<b>Goals, Assumptions, and Approach:</b><br>
&nbsp;• Normalize all things similar across CSS and SVG.<br>
&nbsp;• Allow for the animation of every property/attribute and function in full detail.<br>
&nbsp;• Create a minimal syntax that is both flexible and forgiving.<br>
&nbsp;• Make it fully object-oriented within the confines of JavaScript.<br>
&nbsp;• Assume a “modern browser” that supports ES6.<br>
&nbsp;• Build in callbacks for flexibility and the ability to meet as-yet-unknown requirements.<br>
&nbsp;• Use my home page animations as functional requirements and a test bed.  Ensure that all the exceptional situations are handled.  There are ~100 separate animations, most of which work together as parts of larger animations.
  
<b>Structure:</b><br>
raf.js has three sub-libraries that wrap each other like nesting dolls (inner to outer order):<br>
&nbsp;• prop.js defines the Prop, Func, and Ez classes<br>
&nbsp;• easy.js defines the Easy, Easee, Easer, Teaser, and Geaser classes<br>
&nbsp;• raf.js defines the ACues and AFrame classes

Each file is standalone.  easy.js contains all the prop.js code.  raf.js contains all the easy.js code.  I didn't want to get into JavaScript modules with something this small.  Standalone prop.js allows users to take advantage of its property/attribute setting features when they are not animating anything.  Standalone easy.js can be used to animate by integrating with your own requestAnimationFrame() calls and callbacks, not those provided by raf.js.

As a user of the library, you will not need to know all of these classes, and you will never  need to write: let myVar = new ClassName.<br>
Unless you are getting fancy, like pausing one animation to play another then resuming the paused animation, you only need one declared instance of each class.  So the libraries pre-declare an instance for you.  You'll see how that works in the examples.  Of course you are free to declare instances of any of these classes, but beware that with the AFrame class it means multiple requestAnimationFrame callback loops at runtime.
