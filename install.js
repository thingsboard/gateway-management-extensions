/*
 * Copyright © 2023 ThingsBoard, Inc.
 */
const fse = require('fs-extra');
const path = require('path');

let _projectRoot = null;

(async() => {
  await fse.move(sourcePackage(),
    targetPackage(),
    {overwrite: true});
})();

function projectRoot() {
  if (!_projectRoot) {
    _projectRoot = __dirname;
  }
  return _projectRoot;
}

function sourcePackage() {
  return path.join(projectRoot(), 'dist', 'gateway-extension', 'system', 'thingsboard-gateway-extension.js');
}

function targetPackage() {
  return path.join(projectRoot(), 'target', 'generated-resources', 'thingsboard-gateway-extension.js');
}
