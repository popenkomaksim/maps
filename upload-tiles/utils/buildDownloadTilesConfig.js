const times = require("lodash.times");

const fillCoordsArr = (start, end) => {
  const coordsNum = end - start;

  const resCoordsArr = [start];
  times(coordsNum, (i) => {
    resCoordsArr.push(start + i + 1);
  });

  return resCoordsArr;
};

const buildZoomLevels = (minZoomLevel, startZoomLevel) => {
  const zoomLevelsArr = [];

  times(startZoomLevel - minZoomLevel, (i) => {
    zoomLevelsArr.push(minZoomLevel + i);
  });

  zoomLevelsArr.push(startZoomLevel);
  zoomLevelsArr.reverse();

  return zoomLevelsArr;
};

const buildConfigsByZoomLevel = (minZoomLevel, startZoomLevel, startCoords) => {
  const zoomLevels = buildZoomLevels(minZoomLevel, startZoomLevel);

  return zoomLevels.map((zL) => {
    const zoomDiff = startZoomLevel - zL;
    const coordsDivider = Math.pow(2, zoomDiff);
    const startCoordsForZoomLevel =
      zoomDiff === 0
        ? startCoords
        : {
            topLeft: {
              x: Math.floor(startCoords.topLeft.x / coordsDivider),
              y: Math.floor(startCoords.topLeft.y / coordsDivider),
            },
            bottomRight: {
              x: Math.floor(startCoords.bottomRight.x / coordsDivider),
              y: Math.floor(startCoords.bottomRight.y / coordsDivider),
            },
          };

    return {
      zoomLevel: zL,
      coords: startCoordsForZoomLevel,
    };
  });
};

module.exports = {
  fillCoordsArr,
  buildConfigsByZoomLevel,
};
