const https = require("https");
const fs = require("fs");
const { tilesDestDirectory } = require("../constants");
const { log } = require("./common");
const { setFlagsFromString } = require("v8");
const path = require("path");

const download = (resource, locationParams, cb = () => {}) => {
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
  if (fs.existsSync(dest) || fs.existsSync(`${dir}/${y}.jpeg`) || fs.existsSync(`${dir}/${y}.jpg`)) {
    return new Promise((resolve) => {
      resolve({resource, coords: { x, y, z }});
    })
  }

  const downloadUrl = downloadUrlPatter(locationParams);

  return new Promise((resolve, reject) => {
    log(`Downloading file by URL ${downloadUrl} to dest ${dest}`);
    const file = fs.createWriteStream(dest);
    https.get(
      downloadUrl,
      {
        timeout: 5000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        },
      },
      function (response) {
        if (response.statusCode > 200){
          if (response.statusCode == 404) {
            file.write('Error 404 (Not Found)');
            file.close(cb);
            return resolve({resource, coords: { x, y, z }});
          }
          file.close(cb);
          rm(dest);
          return reject(`${downloadUrl} resulted in ${response.statusCode}`);
        }
        response.pipe(file);
        file.on("finish", function () {
          file.close(cb);
          resolve({resource, coords: { x, y, z }});
        });
        file.on("error", function (err) {
          file.close(cb);
          rm(dest);
          reject(err);
        });
      }
    ).on('error', (err) => {
      file.close(cb);
      rm(dest);
      reject(err);
    });
  });
};

function rm(dest) {
  (fs.rm && fs.rm(dest, { force: true }, (e)=>{})) || (fs.unlink && fs.unlink(dest, ()=>{}))
}

module.exports = {
  download,
};
