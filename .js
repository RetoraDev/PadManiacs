here is source code of my game

```javascript

```

Implement character systems

A customizable avatar system with 4 layers. All layers 100x100
- base: skin layer, uses base.png, an spritesheet with two frames, 0: Asian skin tone, 1: Afro skin tone, goes over back hair layer
- back hair: back hair layer, uses back_hair_${userSelectedBackHair}, base should be over this layer, this layer goes on bottom
- font hair: front hair layer, uses front_hair_${userSelectedBackHair}, goes over base layer
- eyes: uses eyes.png, goes over front hair layer, has 4 frames, the blinking animation, first is open eyes and last is closed eyes so blinking animation needs to play frames from 0 to 3 then in reverse from 3 to 0 [0, 1, 2, 3, 2, 1, 0]
- clothes: uses selected clothes sprite, goes over base layer

. src/assets/character/
├── back_hair_1.png
├── base.png
├── eyes.png
├── front_hair_1.png
├── headphones.png
└── school_uniform.png

hair is an untinted sprite, so user can select hair color using an slider, the game will apply hair color tint to the hair sprites automatically

i have 1 hair style and only 1 clothing but i'll make more sprites so define amount of front and back hairs i have so i can increase that constant 

define hairs unlocked by user
unlocked hairs = {
  front: ["1"],
  back: ["1"],
}

to load hairs
key: `character_front_hair_${i}` or `character_back_hair_${i}`
url: `assets/character/front_hair_${1}.png` or `assets/character/back_hair_${1}.png`

define items in object form 

in example:
{
  id: "item_id",
  name: "Item Display Name",
  description: "Item Description",
  type: "clothing", // like school uniform or accesory like headphones
  unlocksAtLevel: 0 // unlocked by default, 1 and above means items unlocks at that level, -1 means items can't be unlocked
}

to load items
key: `character_${item.type}_${item.id}`
url: `assets/character/${item.id}.png`

by default hair styles 1 to 3 and school_uniform are unlocked

We need a portrait and a close shoot. To get them crop the result this (x, y, w, h).
- portrait: 43, 11, 15×15
- close shot: 32, 15, 36×7

make a CharacterDisplay and extending it make CharacterCroppedDisplay, CharacterPortrait and CharacterCloseShot

How does the character system work:
User can have several characters. Max character name length is 4
A character with the name "EIRI" is created by default.

In main menu add a menu "Character Select" it will start character select game state 
In character select:
- a carousel menu to the left. displaying available characters to select. at the end has a button "+ ADD CHARACTER" to add a new character, selected character is displayed with a different color
- selected character display in center top
- character name, portait, selected skill and level, experience bar, skill points, characters stats to the right
- when you navigate the carousel it will automatically update 
- when confirmed in the carousel it wil display a new menu with options like 'SELECT' 'CUSTOMIZE' ... 'DELETE', 'SET SKILL'

Character Stats
- Level: Level of the character, starts in 1 and there is no limit
- Experience: Amount of experience, when it reaches some point, resets and level grows, just like an RPG system. Use an experience curve function to get the experience top (level) => return level * 10; quadratic experience curves are good
- Skill: How many times can this character use it's skill. Start's in 1 and it's limit is 5. when character levels up the possibility to increase this stat is:
  - 0% if the level <5 or if still not passed at least 5 levels since the last time this skill increased
  - 60% otherwise

Character skills
They are automatically activated when certain conditions are completed, they cannot be activated more times than a character's Skill stat. When activated they can slightly change the state of the game.
For example: A skill that is activated when the player fails a note. The Judgment becomes from "Miss" to "Boo"

In game display for characters and their skills.
2, 103, 36×7 is an area reserved for visualizers. however you can display character close shoot over it
