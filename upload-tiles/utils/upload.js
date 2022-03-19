const fs = require('fs');
const AWS = require('aws-sdk');
const { params } = require('../config');
const logger = require('./common');

const { spawn } = require('child_process');

// AWS SDK Configuration
AWS.config.update({
  secretAccessKey: params.awsS3.SECRET_ACCESS_KEY,
  accessKeyId: params.awsS3.ACCESS_KEY_ID,
  region: params.REGION,
});

const execPromise = (command) => {
  let arg = command.split(' ');
  command = arg.shift();

  const child = spawn(command, arg);

  return new Promise((resolve, reject) => {
    child.stdout.on('data', function (data) {
      // logger.log('stdout: ' + data);
    });

    child.stderr.on('data', function (data) {
      reject(data);
      return;
    });

    child.on('close', function (code) {
      resolve(code);
    });
  });
}

// Creating an S3 instance
const s3 = new AWS.S3({signatureVersion: 'v4'});

const uploadToS3 = (fileName, fileBody, bucketName) => {
  return new Promise((resolve, reject) => {
    let params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileBody
    };
    s3.upload(params, (err, result) => {
        if(err) {
          return reject(err);
        }
        resolve(result);
    })
  });
};

const readAndUploadFileToS3 = (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, async (err, fileBody) => {
      if(err) {
         return reject(err);
      }
      try {
        const result = await uploadToS3(fileName, fileBody, params.awsS3.BUCKET_NAME);
        resolve(result);
      } catch(e) {
        reject(e);
      }
    });
  });
};

const compressFolder = async (folderPath, zipName) => {
  if (zipName.split('.zip') == 1) {
    zipName = zipName + '.zip';
  }
  await execPromise(`zip -r -j ${zipName} ${folderPath}`);
};

module.exports = {
  compressFolder,
  readAndUploadFileToS3,
}
