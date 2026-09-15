# PadManiaX Docs - Source Tutorials

This folder contains the tutorial pages that are included in the API documentation website.

Each `.html` file here is a complete, self-contained tutorial page (with the `doki-loader` script and `[heading]`/`[codeblock]` markup consumed by the docs theme). They are static content and are not generated from code.

When the docs are built (`npm run docs` -> `node docs-generator.js`), every `.html` file in this folder is copied verbatim into `docs/tutorials/` on the generated website. Files with any other extension (e.g. this `README.md`) are ignored and never copied.

To add a new tutorial:
1. Create `<name>.html` in this folder using one of the existing tutorials as a template.
2. Add a link to it from the Tutorials section in `docs-generator.js` (`INDEX_STATIC`).
3. Regenerate the docs with `npm run docs`.