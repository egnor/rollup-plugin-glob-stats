# rollup-plugin-glob-stats

This is a plugin for [the Rollup bundler](https://rollupjs.org/) which can expand arbitrary file globs at build time, capturing the list of files and their types and sizes as JSON data to use at runtime.

## Why?

In one use case, your website includes a set of downloadable binary files which are checked into the source and copied to the output for serving, and you want to make a nice list of the files and their sizes for the user to select from. You could maintain this directory of files and sizes as a data file but that's error prone, it's nicer to just list the files at build time.

In another use case, your website has a bunch of content entries (blog entries, articles, etc) and you have a system that makes pages out of them all, but you don't have a convenient way to list them all. By getting a list of the files you can know which pages are available. (In reality you'd probably want metadata like titles; perhaps this plugin should be expanded to support frontmatter lookup...??)

## Usage

Add this module:
```bash
$ npm i rollup-plugin-glob-stats
```

Configure Rollup to use it, in `rollup.config.js` or equivalent:
```js
import rollupGlobStats from "rollup-plugin-glob-stats";
...
export default {
  ...
  plugins: [
    ...
    rollupGlobStats(),
    ...
  ].
};
```

In a `.js` (or `.jsm` or `.ts` or `.jsx` or ...) modules, import a name starting with `glob-stats:` followed by a glob expression relative to the source file. The default export will be an object with filenames as keys and file stats as values:
```js
import myStuff from "glob-stats:*.stuff";
...
for (fn in myStuff) {
  document.body.innerHTML += `<div>${fn} - ${myStuff[fn].size} bytes</div>`
}
```

Glob expressions are evaluated with [fast-glob](https://github.com/mrmlnc/fast-glob#readme). They may reference any file available at build time. Each file's stats value will be an object in one of these formats:
- `{ type: "file", size: <bytes (int)>, mtime: <millis (int)> }`
- `{ type: "dir", mtime: <millis (int)> }`
- `{ type: "symlink", target: <symlink target (string)>, mtime: <millis (int)> }`
- `{ type: "special" }`
