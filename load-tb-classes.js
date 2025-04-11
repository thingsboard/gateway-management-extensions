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
const fs = require('fs');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const path = require("path");

const tbStylesCss = path.resolve(path.join('.', 'node_modules', 'thingsboard', 'src', 'styles.css'));
const distDir = path.resolve(path.join('.', 'dist'));
const tbClassesJson = path.resolve(path.join(distDir, 'tbClasses.json'));
const classes = new Set();

const collectClassesPlugin = (opts = {}) => {
  return {
    postcssPlugin: 'collect-classes',
    Once (root, { result }) {
      root.walkRules((rule) => {
        selectorParser((selectors) => {
          selectors.walkClasses((classNode) => {
            classes.add(classNode.value);
          });
        }).processSync(rule.selector);
      });
    }
  }
}

collectClassesPlugin.postcss = true;

const plugin = (opts = {}) => {
  return {
    postcssPlugin: 'collect-tb-classes',
    async Once (root, { result }) {
      const css = fs.readFileSync(tbStylesCss, 'utf8');
      await postcss([collectClassesPlugin])
        .process(css, {from: tbStylesCss}).then(() => {
        const classesArray = Array.from(classes);
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir);
        }
        fs.writeFileSync(tbClassesJson, JSON.stringify(classesArray, null, 2), 'utf8');
      }).catch((error) => {
        console.error('Error in CSS:', error);
      });
    }
  }
}

plugin.postcss = true;

module.exports = plugin;
