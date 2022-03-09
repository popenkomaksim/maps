const fs = require("fs");
const { resultJsonFilePath, resultJsonFileName, tilesDestDirectory } = require("../constants");

const getResult = (resources) => {
  let result = {};

  if (fs.existsSync(resultJsonFilePath)) {
    const prevResultJSON = fs.readFileSync(resultJsonFilePath);
    result = prevResultJSON ? JSON.parse(prevResultJSON) : {};
  }

  return result;
};

const writeResult = (result) => {
  fs.writeFileSync(resultJsonFilePath, JSON.stringify(result), "utf8");
};

module.exports = {
  getResult,
  writeResult,
};
