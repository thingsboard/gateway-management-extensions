///
/// Copyright © 2016-2025 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

const fse = require('fs-extra');
const path = require('path');

let _projectRoot = null;

(async () => {
  // Move the JavaScript file and its associated source map
  await moveFileWithSourceMap(sourcePackage(), targetPackage());
})();

// Function to move the main package and its source map
async function moveFileWithSourceMap(sourceFilePath, targetFilePath) {
  try {
    // Move the main JavaScript file
    await fse.move(sourceFilePath, targetFilePath, { overwrite: true });

    // Check if a source map exists and move it if found
    const sourceMapPath = `${sourceFilePath}.map`;
    const targetMapPath = `${targetFilePath}.map`;

    if (fse.pathExists(sourceMapPath)) {
      await fse.move(sourceMapPath, targetMapPath, { overwrite: true });
    }
  } catch (err) {
    console.error(`Error moving files: ${err.message}`);
  }
}

function projectRoot() {
  if (!_projectRoot) {
    _projectRoot = __dirname;
  }
  return _projectRoot;
}

function sourcePackage() {
  return path.join(projectRoot(), 'dist', 'gateway-extension', 'system', 'gateway-management-extension.js');
}

function targetPackage() {
  return path.join(projectRoot(), 'target', 'generated-resources', 'gateway-management-extension.js');
}
