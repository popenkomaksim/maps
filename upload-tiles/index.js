const { params } = require("./config");
const {
  buildConfigsByZoomLevel,
  fillCoordsArr,
} = require("./utils/buildDownloadTilesConfig");
const { download } = require("./utils/download");
const { coordToTile } = require("./utils/geo");
const { log, error } = require("./utils/common");
const _ = require('lodash');


function isFloatPoint({x, y}) {
  return ((x - Math.floor(x)) > 0) || ((y - Math.floor(y)) > 0)
}

const downloadAll = async () => {
  const { minZoomLevel, startZoomLevel, startCoords, resources } = params;


  if (!startCoords) {
    error("!!!ERROR!!!");
    error("Please set topLeft and bottomRight coords to config");
    error("!!!ERROR!!!");
    process.exit();
  }
  //if floating point coords provided convert it to tile coords
  if (isFloatPoint(startCoords.topLeft) || isFloatPoint(startCoords.bottomRight)) {
    startCoords.topLeft = coordToTile(startCoords.topLeft.x, startCoords.topLeft.y, startZoomLevel);
    startCoords.bottomRight = coordToTile(startCoords.bottomRight.x, startCoords.bottomRight.y, startZoomLevel);
  }

  log(`Downloading all tiles in bbox ((${startCoords.topLeft.x},${startCoords.topLeft.y}),(${startCoords.bottomRight.x},${startCoords.bottomRight.y})); zoom: ${startZoomLevel}`)

  const configsByZoomLevel = buildConfigsByZoomLevel(
    minZoomLevel,
    startZoomLevel,
    startCoords
  );
  let totaltiles = 0;
  let count = 0;
  let failed = 0;
  for await (const { zoomLevel: z, coords } of configsByZoomLevel) {
    if (params.skippedLevels && params.skippedLevels.indexOf(z) >= 0) {
      continue;
    }
    const topLeftCoords = coords.topLeft;
    const bottomRightCoords = coords.bottomRight;

    const XCoords = fillCoordsArr(topLeftCoords.x, bottomRightCoords.x);
    const YCoords = fillCoordsArr(topLeftCoords.y, bottomRightCoords.y);
    totaltiles += XCoords.length * YCoords.length;
    for (const x of XCoords) {
      for (const y of YCoords) {
        const locationParams = { z, x, y };

        try {
          await Promise.all(
            resources
            .map((resource) => download(resource, locationParams))
          );
        } catch (err) {
          failed++;
          error(err);
        } finally {
          count++;
          log(`Done: (${((count/totaltiles)*100).toFixed(2)}%) ${count}/${totaltiles}; failed: ${failed}`)
        }

      }
    }
  }
};

downloadAll();

const terminationHandler = () => {
  process.exit();
};

process.on("SIGINT", terminationHandler);
