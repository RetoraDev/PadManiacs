```
   ___          ____  ___          _      _  __
  / _ \___ ____/ /  |/  /__ ____  (_)__ _| |/_/
 / ___/ _ `/ _  / /|_/ / _ `/ _ \/ / _ `/>  <
/_/   \_,_/\_,_/_/  /_/\_,_/_//_/_/\_,_/_/|_|
```

A pocket-sized cross-platform pixel art StepMania clone.

## About

PadManiacs is a lightweight rhythm game that brings the StepMania experience to web and mobile devices with a retro pixel art aesthetic. The game features core rhythm gameplay mechanics from StepMania, a popular open-source rhythm game.

[Play Latest Development Version](https://retoradev.github.io/PadManiacs/dist/)

[Play Stable Version on Itch.io](https://retora.itch.io/padmaniacs)

### Keyboard Controls

**Directional Inputs:**
- **WASD**: Directional input
- **A/S/J/K**: Dance pad layout

**Action Buttons:**
- **J**: B button / Up column
- **K**: A button / Right column
- **Shift**: Select button
- **Enter**: Start button

**Player 2:**
- **Cursor Keys**: Directional Input
- **Numpad 1**: B button / Up column
- **Numpad 2**: A button / Right column
- **Numpad +**: Select button
- **Numpad -**: Start button

They're all rebindable. Gamepad and touchscreen supported

## Loading Your StepMania charts

**Desktop/Local Files:**
Place song folders in: `Path/To/PadManiacs/data/Songs/`

**Android Devices:**
Place song folders in: `Internal Storage/PadManiacs/Songs/`

Then go to user songs menu and hit "Load External Songs"

You can add as many songs as desired.

> Note in browser you can't load songs this way. Use "Load Single Song" instead

### AVI background videos

Browsers can't play `.AVI` backgrounds natively. When a song references one, the game offers to decode it to MP4 with [ffmpeg-wasm-lite](https://github.com/devilanirudh/ffmpeg-wasm-lite) (a minimal FFmpeg.wasm build by devilanirudh) before playing. Decoded videos are cached in memory for the rest of the session, so you only decode each video once. On desktop/Android you can also pick "Decode & Edit SM File" to write the MP4s next to the song and update its chart permanently. Decoding can be cancelled anytime with SELECT + B.

## Character System

You can customize and level up your own avatar with RPG-style progression. Create characters with unique appearances, unlock items, skills, and watch them grow as you play.

## Chart Editor

The game includes a very complete chart editor similar to Arrow Vortex. You can easily create/import, edit, playtest and export charts in StepMania format or project file format.

Editor controls:
- **UP/DOWN**: Navigate in time
- **LEFT/RIGHT**: Change column
- **A**: Add note under cursor to selection
- **B**: Place/Remove not
- **Hold A + UP/DOWN**: Area selection
- **Hold A + LEFT/RIGHT**: Change beat snap
- **Hold B + UP/DOWN**: Place hold note, release to create it
- **SELECT**: Toggle playback
- **START**: Show context menu

The editor is accessible from **Extras** menu

## Modding & Add-ons

PadManiacs supports community-created modifications through an add-on system. Add-ons can:
- Replace game assets (arrows, backgrounds, UI elements)
- Add new behaviors and gameplay mechanics
- Extend the game with new features

See [Modding API Documentation](https://retoradev.github.io/PadManiacs/docs/) for complete modding information.

### The Add-on Manager
Accessible from the main menu, the Add-on Manager allows you to:
- Install add-ons from ZIP files
- Enable/disable installed add-ons
- Hibernate add-ons to prevent loading
- Toggle safe mode to disable all add-ons

## Known Limitations

- SSC chart format support is not implemented
- .AVI background videos are not playable by browsers directly; they are decoded to MP4 with ffmpeg-wasm-lite on demand, which can take a few minutes for long videos
- Web version requires manual song loading
- Double charts are not supported since it's hard to implement Single Player Doubles on mobile
- Most mobile file browsers may require selecting individual files one by one
- Limited HTML5 gamepad API makes some gamepads unusable with the game. In such case, users will need to use X360CE and similar programs
- **WebView requirements:** On desktop (Neutralino.js builds) you need WebView2 installed. On Android you need Android System WebView installed and up to date. Without a working WebView, the game may not function correctly.
- **NW.js builds:** NW.js binaries are not included in the repo. Download NW.js v0.88.0 for your platform and put the contents into `src/static/nw/` (keep `locales/`, `www/`, `padmaniacs.exe`, and `package.json` as needed). Then build with `node build.js --platform nwjs` or the NW.js build target.

## License

Copyright © 2026 RETORA

PadManiacs is free software licensed under the GNU General Public License version 3 (or any later version), with an additional permission requiring that the attribution "PadManiacs by RETORA" be preserved in all copies and modified versions. Modified versions may not be distributed under the name "PadManiacs" or any confusingly similar name. See the LICENSE file for complete terms.

## Music Disclaimer

The game includes 16 Vocaloid songs. While the code is GPL and the game is free, this does not make the audio libre. I do not have explicit licenses from all of the producers for these tracks. I assume this risk and, if I receive a valid takedown/request, I will resolve it by removing the affected songs or seeking permission. These songs will remain until the project matures and obtains original music. The risk is low but real. If any rights holder dislikes their song being in this game, I will remove it in good faith. See [NOTICE](NOTICE) for details.

Third-party components:
- Uses StepMania chart format specification
- Includes Phaser CE, Eruda.js, Terser.js, and JSZip libraries
- Includes [ffmpeg-wasm-lite](https://github.com/devilanirudh/ffmpeg-wasm-lite) by devilanirudh (GPL-2.0-or-later) for decoding AVI background videos to MP4 in the browser
- Desktop builds are packaged with [NW.js](https://nwjs.io) (MIT License) as the application runtime
- All third-party content remains under their original licenses

## Contributing

PadManiacs is the work of RETORA and is developed in the open. Bug reports, fixes, documentation improvements, and other contributions are welcome.

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/RetoraDev/PadManiacs.git
   cd PadManiacs
   ```

2. **Download NW.js v0.88.0**

   NW.js binaries are not committed to the repository (see the NW.js section below). Download the Windows x64 build and extract it into `src/static/nw/` **without replacing existing files**:

   - Download: [nwjs-v0.88.0-win-x64.zip](https://dl.nwjs.io/v0.88.0/nwjs-v0.88.0-win-x64.zip)

   Then extract it on top of `src/static/nw/`. The archive contains the large binaries (`nw.dll`, `ffmpeg.dll`, `resources.pak`, etc.) that the game needs at runtime, but not the small tracked files (`package.json`, `credits.html`, `padmaniacs.exe`, `locales/`, `www/`), so existing files are preserved automatically. Do not overwrite if your extractor asks to replace any of the tracked files listed in the NW.js section below.

3. **Install the shared Git hooks (optional)**

   The repository ships a set of Git hooks in `.githooks/` that protect files under `src/static/nw/` from being deleted by branch or commit checkouts. Git does not run them automatically for security reasons, so enable them once after cloning:

   ```bash
   git config core.hooksPath .githooks
   ```

   The hooks are optional. They never modify tracked files. They back up `src/static/nw/` to `.nw-backup/` (gitignored) and restore any file a checkout would otherwise delete. Skip this step if you don't plan to touch NW.js builds.

4. **Build and run**

   The project includes an interactive build interface. Start it with:

   ```bash
   npm run interface
   ```

   This launches a terminal menu where you can choose build targets, serve the project, scan for code reminders, and more. Alternatively, use the direct npm scripts:

   ```bash
   npm run build:web          # Web platform
   npm run build:cordova      # Android APK
   npm run build:nwjs         # Desktop (NW.js)
   npm run build:release      # All platforms, minified
   npm run serve              # Serve dist/ on localhost:3000
   npm run serve:src          # Serve src/ for development
   ```

   Run `npm run help` to see all available options.

### Making Changes

- Create a topic branch for your work, e.g. `git checkout -b fix-song-select-banner`.
- Keep changes focused and scoped to the issue you're solving. Avoid drive-by reformatting, unrelated refactors, or "cleanup" that touches code you didn't need to change.
- Test your change locally on the platforms you have access to. If you can, verify it in the browser build (`npm run serve:src`) before opening a pull request.
- Write commit messages that explain *why* the change was made, not just *what* changed. One logical change per commit is ideal.
- Open a pull request describing what you changed, why, and how you tested it. Screenshots or short clips are very helpful for UI changes.

### NW.js Binaries Are Not Tracked

The NW.js desktop build depends on several large files that live inside `src/static/nw/`, including `nw.dll`, `ffmpeg.dll`, `libEGL.dll`, `libGLESv2.dll`, `node.dll`, `nw_elf.dll`, `resources.pak`, `nw_100_percent.pak`, `nw_200_percent.pak`, `icudtl.dat`, `v8_context_snapshot.bin`, `d3dcompiler_47.dll`, `vk_swiftshader.dll`, `vulkan-1.dll`, `notification_helper.exe`, and others.

These files total well over 300 MB, and several of them are chromium source artifacts rather than something PadManiacs itself builds. Tracking them in Git was not practical for two reasons:

- **Repository size.** Every clone, every fetch, and every branch checkout would carry the full weight of chromium's runtime. This slows down contribution and makes forks painful.
- **Build workflow.** Vendoring chromium source code and setting up a full chromium build pipeline just to ship the desktop runtime is far beyond the scope of this project. It would turn a small rhythm game into a chromium fork, which is not what PadManiacs is.

Because of that, **NW.js files are deliberately not committed**. Only the small, hand-maintained files are tracked:

- `src/static/nw/credits.html`
- `src/static/nw/package.json`
- `src/static/nw/padmaniacs.exe`
- `src/static/nw/locales/en-US.pak`
- `src/static/nw/locales/en-US.pak.info`
- `src/static/nw/www/`
- `src/static/nw/.gitkeep`

Everything else inside `src/static/nw/` is ignored via `.gitignore`.

If you want to build or run the NW.js target locally:

1. Download NW.js **v0.88.0** for your platform from the official releases page.
2. Extract the archive into `src/static/nw/` **without replacing existing files**, so the tracked files listed above stay untouched.
3. Build with:

   ```bash
   npm run build:nwjs
   ```

   Or use the interactive interface with `npm run interface` and choose the NW.js target.

**Do not commit the NW.js binaries.** If you accidentally stage them, unstage them with `git restore --staged src/static/nw/` and confirm `.gitignore` is intact. Pull requests that add chromium or NW.js artifacts will not be merged.

The shared hooks in `.githooks/` will automatically restore any `src/static/nw/` files that a checkout would otherwise delete, and they keep a rolling backup in `.nw-backup/` (which is gitignored). This is how the repository stays usable across branches and old commits without committing the large binaries.

### Rules

- **No rebranding or forking-as-PadManiacs.** Do not redistribute PadManiacs, or any modified version of it, under the name "PadManiacs" or any confusingly similar name without prior written permission from RETORA. Forks and derivative works must use a clearly different name and must not imply endorsement by or affiliation with RETORA.
- **Don't mess up the code.** Keep changes focused and minimal. Do not reformat, rewrite, or "clean up" unrelated code, and do not introduce gratuitous changes. Respect the existing architecture, conventions, and style.
- **Preserve attribution.** All copies and modified versions must keep the attribution "PadManiacs by RETORA" and the complete license notice.

These requirements reflect the additional permissions in the LICENSE file. If you intend to fork, rebrand, or heavily modify PadManiacs, please reach out to RETORA first.