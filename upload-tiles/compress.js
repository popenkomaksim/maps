const glob = require('glob');
const { tilesDestDirectory } = require('./constants');
const { minZoomLevel, startZoomLevel } = require('./config');
const fs = require('fs');
const _ = require('lodash');

const { exec } = require('child_process');

const getDirectories = function (src) {
  return new Promise((resolve, reject) => {
    glob(src + '/**/*', (err, res) => {
      if (err) {
        return reject(err);
      }

      resolve(res);
    });
  });
};

const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      if (stderr) {
        reject(stderr);
        return;
      }

      try {
        const parsedStdout = JSON.parse(stdout);
        resolve(parsedStdout);
      } catch (e) {
        resolve(stdout);
      }
    });
  });
}

const rm = (dest) => {
  (fs.rm && fs.rm(dest, { force: true }, (e)=>{})) || (fs.unlink && fs.unlink(dest, ()=>{}))
}

const compressFile = async (path, quality = '40', type = '.png') => {
  const filePathSplit = path.split(type);
  const filePathWithoutType = filePathSplit[0];

  if (filePathSplit.length == 1) {
    return false;
  }

  try {
    await execPromise(`convert ${path} -quality ${quality} ${filePathWithoutType}.jpg`);
    rm(path);
    console.log(`Converted file ${path}`)
  } catch(e) {
    console.log(`Error convert file ${path}`, e);
    return false;
  }

  return true;
}

const compressFiles = async (files, quality, type) => {
  const chunks = _.chunk(files, 10);

  for(let chunk of chunks) {
    await Promise.all(_.map(chunk, (file) => {
      return compressFile(file, quality, type);
    }));
  }
}

const main = async () => {
  for(let i = startZoomLevel; startZoomLevel >= minZoomLevel; i--) {
    let files = await getDirectories(`./${tilesDestDirectory}/HERE/${i}`);
    await compressFiles(files, 60, '.png');
  }

  for(let i = startZoomLevel; startZoomLevel >= minZoomLevel; i--) {
    files = await getDirectories(`./${tilesDestDirectory}/GS/${i}`);
    await compressFiles(files, 60, '.jpeg');
  }
};

main();
