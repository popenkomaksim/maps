const { rm } = require('./utils/download');
const { tilesDestDirectory } = require('./constants');
const {
  compressFolder,
  readAndUploadFileToS3,
} = require('./utils/upload');
const { getFolders, getDirectories, log, error } = require('./utils/common');
const _ = require('lodash');

const fromFilePathToNumber = (filePath) => {
  let fileYCoord = filePath.split('.');
  fileYCoord = fileYCoord[fileYCoord.length - 2];

  fileYCoord = fileYCoord.split('/');
  fileYCoord = fileYCoord.pop();

  return fileYCoord;
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

const generateZipName = (xCoord, yCoordsFrom, yCoordsTo) => {
  return `${xCoord}__${yCoordsFrom}_${yCoordsTo}.zip`;
}

const generateZipPath = (source, zoom, xCoord, yCoordsFrom, yCoordsTo) => {
  return `${source}/${zoom}/${generateZipName(xCoord, yCoordsFrom, yCoordsTo)}`;
}

const main = async () => {
  const sources = await getFolders(`./${tilesDestDirectory}/`);

  for(const source of sources) {

    const zooms = await getFolders(`./${tilesDestDirectory}/${source}`);
    for(const zoom of zooms) {

      xCoords = await getFolders(`./${tilesDestDirectory}/${source}/${zoom}`);
      for(const xCoord of xCoords) {

        const yCoords = await getDirectories(`./${tilesDestDirectory}/${source}/${zoom}/${xCoord}`);
        let yCoordsFrom = yCoords.shift();
        let yCoordsTo = yCoords.pop();
        if (!yCoordsTo) {
          yCoordsTo = yCoordsFrom;
        }

        yCoordsFrom = fromFilePathToNumber(yCoordsFrom);
        yCoordsTo = fromFilePathToNumber(yCoordsTo);

        const zipPath = generateZipPath(source, zoom, xCoord, yCoordsFrom, yCoordsTo);
        const generatedZipName = zipPath.replaceAll('/', '_');

        try {
          await compressFolder(`./${tilesDestDirectory}/${source}/${zoom}/${xCoord}`, generatedZipName);
          log(`Compressed ${zipPath}`);
        } catch(e) {
          error(`Failed Compress ${zipPath}, ${e}`)
        }

        try {
          await readAndUploadFileToS3(`${generatedZipName}`, zipPath);
          log(`Uploaded ${zipPath}`);
        } catch(e) {
          error(`Failed upload ${zipPath}, ${e}`)
        }
        rm(generatedZipName);
      }
    }
  }
}

main();
