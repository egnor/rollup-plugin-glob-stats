import { dataToEsm } from "@rollup/pluginutils";
import fg from "fast-glob";
import fs from "fs";
import path from "path";
import process from "process";

const PREFIX = "glob-stats:";

export default function rollupGlobStats() {
  return {
    name: "glob-stats",

    async resolveId(source, importer, options) {
      if (source.startsWith(PREFIX)) {
        this.debug(`Resolving "${source}"`);
        return `\0${source}\0${process.cwd()}`;
      } else {
        return null;
      }
    },

    async load(id) {
      if (id.startsWith("\0" + PREFIX)) {
        // Extract the embedded resolution base
        const [pattern, base] = id.slice(1 + PREFIX.length).split("\0");
        const files = await fg.async(pattern, { cwd: base });
        this.debug(`Found ${files.length} files for "${pattern}"`);

        // Return { path: { stats } } objects
        const output = {};
        await Promise.all(files.map(async file => {
          const fullPath = path.join(base, file);
          const stats = await fs.promises.lstat(fullPath);
          output[file] = { mtime: stats.mtimeMs };
          if (stats.isSymbolicLink()) {
            output[file].type = "symlink";
            const target = await fs.promises.readlink(fullPath);
            output[file].symlink = target;
          } else if (stats.isDirectory()) {
            output[file].type = "dir";
          } else if (stats.isFile()) {
            output[file].type = "file";
            output[file].size = stats.size;
          } else {
            output[file].type = "special";
          }
        }));

        return {
          code: dataToEsm(output, { preferConst: true }),
          map: { mappings: "" },
        };
      } else {
        return null;
      }
    },
  };
};
