[heading: "Introduction"]
<p>PadManiaX is a lightweight rhythm game that brings the StepMania experience to web and mobile devices with a retro pixel art aesthetic. The game features core rhythm gameplay mechanics of StepMania, a popular open source rhythm game.</p>

<p><a href="https://github.com/RetoraDev/PadManiacs">Explore Source code</a></p>
<p><a href="https://retora.itch.io/padmaniacs">Play on itch.io</a></p>

<p>PadManiaX supports community-created modifications through an add-on system. Add-ons can:</p>
[list]
* Replace game assets (arrows, backgrounds, UI elements)
* Add new behaviors and gameplay mechanics
* Extend the game with new features
[/list]

[heading: "How addons work"]
<p>An addon is a folder that contains data that the game loads at startup, overwriting the assets and default game behavior.</p>

<p>In order for an addon to be considered valid, it must include the [code: "manifest.json"] file, a file that defines metadata, which parts of the game must be modified or extended, as well as the data and the code that must be loaded.</p>

<p>Add-ons are stored at a subfolder [code: "Addons/"] under local storage folder. All Addons you develop must be inside this folder so you can test them in the game.</p>

<p>You can download working sample add-ons to load in the game from <a href="https://retora.itch.io/padmaniacs/download/eyJleHBpcmVzIjoxNzc2MzA4MjQ4LCJpZCI6Mzk4OTgwNX0=.QIot74UL0TfHP+txH4R4uBGggY4=">itch.io</a>.</p>

[heading: "Tutorials"]
<p>Learn how to create and modify PadManiaX with these step-by-step tutorials.</p>

[list]
* <a href="tutorials/getting_started.html">Getting Started with Modding</a> - Learn the basics of creating your first addon
* <a href="tutorials/manifest_format.html">Understanding the Manifest Format</a> - Complete guide to manifest.json structure
* <a href="tutorials/asset_replacement.html">Asset Replacement Tutorial</a> - How to replace game graphics and sounds
* <a href="tutorials/behavior_scripts.html">Creating Behavior Scripts</a> - Adding custom gameplay logic
* <a href="tutorials/ui_modification.html">UI Modification Guide</a> - Customizing menus and interfaces
* <a href="tutorials/character_system.html">Character System Guide</a> - Understanding characters, skills, and leveling
* <a href="tutorials/achievements.html">Achievements System Guide</a> - Working with achievements and stats
[/list]

[heading: "Global Scope"]
<p>The game exposes a large set of global constants, variables, and functions that are available throughout the game and can be used in addons. These include version and environment information, font configurations, song folders, judgment windows, score values, character and achievement data, input systems, and more. For the complete reference, see the <a href="globals.html">Global Constants, Variables and Functions</a> page.</p>

[heading: "API"]
<p>PadManiaX was built using <a href="https://github.com/photonstorm/phaser-ce">Phaser CE</a>, with Cordova for native mobile support and <a href="https://https://nwjs.io/">NW.js</a> for desktop builds. See the documentation: <a href="https://cordova.apache.org/docs/en/latest/">Cordova Docs</a>, <a href="https://nwjs.io/">NW.js Docs</a>, and <a href="https://phaserjs.github.io/phaser-ce/">Phaser CE Docs</a>.</p>

<p>The game code is divided into different classes. All classes are accessible in the scope of addon file. Each of them plays a role, some more important than others. For example game screens visual or abstract elements, data managers, etc.</p>
