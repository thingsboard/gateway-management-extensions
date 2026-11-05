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

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const paths = require('./paths');

const BUNDLE = path.join(__dirname, ...paths.bundle);
const BUNDLE_DIR = path.dirname(BUNDLE);
const OUTPUT = path.join(__dirname, ...paths.published).replace(/\.js$/, '.cdx.json');
const SUPPLIER = { name: 'ThingsBoard, Inc.', url: ['https://thingsboard.io'] };

const bom = JSON.parse(fs.readFileSync(path.join(__dirname, 'target', 'sbom', 'npm.cdx.json'), 'utf8'));
const packagePath = component => component.properties?.find(property => property.name === 'cdx:npm:package:path')?.value;
const bundledDirs = new Set(bundledPackageDirs());
const components = bom.components
  .filter(component => bundledDirs.has(packagePath(component)))
  .map(({ scope, ...component }) => ({
    ...component,
    properties: component.properties?.filter(property => property.name !== 'cdx:npm:package:development')
  }));
const missing = [...bundledDirs].filter(dir => !components.some(component => packagePath(component) === dir));
if (missing.length > 0) {
  throw new Error(`The bundle contains packages that cyclonedx-npm did not report: ${missing.join(', ')}`);
}

const commit = sourceCommit();
const version = git('status', '--porcelain') ? `${commit}-dirty` : commit;
const npmRoot = bom.metadata.component;
const npmRootRef = npmRoot['bom-ref'];
const rootRef = `pkg:github/thingsboard/gateway-management-extensions@${version}`;

const refs = new Set(components.map(component => component['bom-ref']));
const dependencies = bom.dependencies
  .filter(dependency => refs.has(dependency.ref) || dependency.ref === npmRootRef)
  .map(dependency => ({
    ref: dependency.ref === npmRootRef ? rootRef : dependency.ref,
    dependsOn: (dependency.dependsOn || []).filter(target => refs.has(target))
  }));
const dependsOn = new Map(dependencies.map(dependency => [dependency.ref, dependency.dependsOn]));
const reachable = new Set([rootRef]);
for (const ref of reachable) {
  dependsOn.get(ref).forEach(target => reachable.add(target));
}
dependsOn.get(rootRef).push(...[...refs].filter(ref => !reachable.has(ref)));

const bundle = fs.readFileSync(BUNDLE);
bom.metadata.component = {
  type: 'library',
  'bom-ref': rootRef,
  supplier: SUPPLIER,
  name: npmRoot.name,
  version,
  description: npmRoot.description,
  hashes: [['SHA-256', 'sha256'], ['SHA-512', 'sha512']]
    .map(([alg, id]) => ({ alg, content: crypto.createHash(id).update(bundle).digest('hex') })),
  licenses: [{ license: { id: 'Apache-2.0' } }],
  purl: rootRef,
  externalReferences: [{ type: 'vcs', url: `https://github.com/thingsboard/gateway-management-extensions/tree/${commit}` }]
};
bom.metadata.supplier = SUPPLIER;
bom.components = components;
bom.dependencies = dependencies;
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(bom, null, 2)}\n`);
console.log(`Wrote ${OUTPUT} for ${version}: ${components.map(component => component.purl).join(', ')}`);

function* bundledPackageDirs() {
  const map = JSON.parse(fs.readFileSync(`${BUNDLE}.map`, 'utf8'));
  for (const source of map.sources) {
    const dir = /^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(source)?.[1];
    if (dir) {
      yield path.relative(__dirname, path.resolve(BUNDLE_DIR, dir)).split(path.sep).join('/');
    }
  }
}

function sourceCommit() {
  let cdup;
  try {
    cdup = git('rev-parse', '--show-cdup');
  } catch {
    cdup = null;
  }
  if (cdup !== '') {
    throw new Error(`${__dirname} is not a git checkout of gateway-management-extensions. The SBOM records the source commit, so build from a clone of the repository.`);
  }
  return git('rev-parse', 'HEAD');
}

function git(...args) {
  return execFileSync('git', args, { cwd: __dirname, encoding: 'utf8' }).trim();
}
