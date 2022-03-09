const https = require("https");
const fs = require("fs");
const { tilesDestDirectory } = require("../constants");

const download = async (resource, locationParams, cb = () => {}) => {
  const {
    fileExt,
    downloadUrlPatter,
    name: resourceName,
  } = resource;
  const { x, y, z } = locationParams;
  const dir = `./${tilesDestDirectory}/${resourceName}/${z}/${x}`;
  const dest = `${dir}/${y}.${fileExt}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  //if file is there - skip
  if (fs.existsSync(dest)) {
    return;
  }

  const downloadUrl = downloadUrlPatter(locationParams);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    console.log(`Downloading file by URL ${downloadUrl} to dest ${dest}`);

    https.get(
      downloadUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        },
      },
      function (response) {
        response.pipe(file);
        file.on("finish", function () {
          file.close(cb);
          resolve({resource, coords: { x, y, z }});
        });
        file.on("error", function (err) {
          reject(err);
        });
      }
    );
  });
};

module.exports = {
  download,
};
