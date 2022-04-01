import unzip from "node-unzip-2";
import Promise from 'bluebird';
import fs from "fs";
import { globby } from "globby";
import { rm as _rm, unlink } from 'fs';
import _ from "lodash";

let filesCount = 0;

const rm = (dest) => {
  (_rm && _rm(dest, { force: true }, (e)=>{})) || (unlink && unlink(dest, ()=>{}))
}

const main = async () => {
  const allFiles = await globby([
    // "../../123/**/*.zip",
    "../../COSM/**/*.zip",
    // "../../GS/**/*.zip",
    // "../../OSM/**/*.zip",
    // "../../HERE/**/*.zip",
    "!maps",
    "!COSM.zip",
    "!.Trashes",
    ".Spotlight-V100'",
  ]);
  console.log(allFiles);

  await Promise.map(allFiles, async (filePath) => {

    try {
      // await execPromise(
      //   `convert ${path} -quality ${quality} ${filePathWithoutType}.jpg`
      // );
      await fs
        .createReadStream(filePath)
        .pipe(unzip.Extract({ path: _.head(filePath.split("__")) }));
      rm(filePath);
      console.log(`Converted file ${filePath}. Fails count: ${filesCount}`);
    } catch (e) {
      console.log(
        `Error convert file ${filePath}. Fails count: ${filesCount}.`,
        e
      );
      rm(path);
      filesCount += 1;
      return false;
    }


  }, { concurrency: 100})
};

main();
