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
const { Contrib, Enums, Models, Serialize, Spec } = require('@cyclonedx/cyclonedx-library');
const { PackageURL, PurlQualifierNames } = require('packageurl-js');
const spdxExpressionParse = require('spdx-expression-parse');
const lockfile = require('@yarnpkg/lockfile');
const normalizePackageData = require('normalize-package-data');

const paths = require('./paths');

const BUNDLE = path.join(__dirname, ...paths.bundle);
const OUTPUT = path.join(__dirname, ...paths.published).replace(/\.js$/, '.cdx.json');
const REPO = 'thingsboard/gateway-management-extensions';
const DEFAULT_REGISTRY = /^https?:\/\/registry\.(?:npmjs\.org|yarnpkg\.com)(?:\/|$)/;

const { Builders, Factories, Utils } = Contrib.FromNodePackageJson;
const componentBuilder = new Builders.ComponentBuilder(
  new Factories.ExternalReferenceFactory(), new Contrib.License.Factories.LicenseFactory(spdxExpressionParse));
const locked = lockedPackages();

const commit = sourceCommit();
const version = git('status', '--porcelain') ? `${commit}-dirty` : commit;
const supplier = new Models.OrganizationalEntity({ name: 'ThingsBoard, Inc.', url: new Set([new URL('https://thingsboard.io')]) });

const bom = new Models.Bom();
bom.metadata.supplier = supplier;
bom.metadata.tools.components.add(componentBuilder.makeComponent(require('@cyclonedx/cyclonedx-library/package.json')));
bom.metadata.properties.add(new Models.Property('cdx:reproducible', 'true'));

const rootManifest = readManifest(__dirname);
const rootPurl = `pkg:github/${REPO}@${version}`;
const root = new Models.Component(Enums.ComponentType.Library, rootManifest.name, {
  bomRef: rootPurl,
  version,
  supplier,
  description: rootManifest.description,
  purl: rootPurl,
  licenses: new Models.LicenseRepository([new Models.SpdxLicense('Apache-2.0')]),
  externalReferences: new Models.ExternalReferenceRepository([
    new Models.ExternalReference(`https://github.com/${REPO}/tree/${commit}`, Enums.ExternalReferenceType.VCS)
  ])
});
const bundle = fs.readFileSync(BUNDLE);
for (const alg of ['SHA-256', 'SHA-512']) {
  root.hashes.set(alg, crypto.createHash(alg.replace('-', '')).update(bundle).digest('hex'));
}
bom.metadata.component = root;

const components = new Map();
for (const dir of new Set(bundledPackageDirs())) {
  const component = makeComponent(dir);
  components.set(dir, component);
  bom.components.add(component);
}
for (const [dir, component] of components) {
  for (const name of Object.keys(readManifest(dir).dependencies || {})) {
    const target = components.get(resolvePackageDir(dir, name));
    if (target) {
      component.dependencies.add(target.bomRef);
    }
  }
}
const byRef = new Map([...components.values()].map(component => [component.bomRef, component]));
const rootDeps = Object.keys({ ...rootManifest.dependencies, ...rootManifest.devDependencies })
  .map(name => components.get(path.join(__dirname, 'node_modules', name)))
  .filter(Boolean);
const reachable = new Set(rootDeps);
for (const component of reachable) {
  component.dependencies.forEach(ref => reachable.add(byRef.get(ref)));
}
const orphans = [...components.values()].filter(component => !reachable.has(component));
[...rootDeps, ...orphans].forEach(component => root.dependencies.add(component.bomRef));

const serializer = new Serialize.JsonSerializer(new Serialize.JSON.Normalize.Factory(Spec.Spec1dot6));
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${serializer.serialize(bom, { sortLists: true, space: 2 })}\n`);
console.log(`Wrote ${OUTPUT} for ${version}: ${[...components.values()].map(c => c.purl).join(', ')}`);

function makeComponent(dir) {
  const packagePath = path.relative(__dirname, dir).split(path.sep).join('/');
  const manifest = readManifest(dir);
  const declaredVersion = manifest.version;
  normalizePackageData(manifest);
  manifest.version = declaredVersion;
  const component = componentBuilder.makeComponent(manifest);
  if (!component) {
    throw new Error(`Cannot build an SBOM component from ${packagePath}/package.json`);
  }
  component.licenses.forEach(license => {
    license.acknowledgement = Enums.LicenseAcknowledgement.Declared;
  });
  component.properties.add(new Models.Property('cdx:npm:package:path', packagePath));
  const lock = locked.get(`${manifest.name}@${manifest.version}`);
  if (!lock) {
    throw new Error(`The bundle contains ${manifest.name}@${manifest.version}, which yarn.lock does not list`);
  }
  const resolved = lock.resolved.replace(/#.*$/, '');
  const qualifiers = DEFAULT_REGISTRY.test(resolved) ? {} : { [PurlQualifierNames.DownloadUrl]: resolved };
  component.purl = new PackageURL('npm', component.group, component.name, manifest.version, qualifiers, undefined).toString();
  component.bomRef.value = component.purl;
  const dist = new Models.ExternalReference(resolved, Enums.ExternalReferenceType.Distribution,
    { comment: 'as detected from yarn.lock property "resolved"' });
  if (lock.integrity) {
    dist.hashes.set(...Utils.parsePackageIntegrity(lock.integrity));
  }
  component.externalReferences.add(dist);
  return component;
}

function lockedPackages() {
  const { type, object } = lockfile.parse(fs.readFileSync(path.join(__dirname, 'yarn.lock'), 'utf8'));
  if (type !== 'success') {
    throw new Error(`Cannot parse yarn.lock: ${type}`);
  }
  const result = new Map();
  for (const [spec, entry] of Object.entries(object)) {
    const name = spec.slice(0, spec.indexOf('@', 1));
    result.set(`${name}@${entry.version}`, entry);
  }
  return result;
}

function* bundledPackageDirs() {
  const map = JSON.parse(fs.readFileSync(`${BUNDLE}.map`, 'utf8'));
  for (const source of map.sources) {
    const dir = /^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(source)?.[1];
    if (dir) {
      yield path.resolve(path.dirname(BUNDLE), dir);
    }
  }
}

function resolvePackageDir(from, name) {
  for (let dir = from; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules', name);
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
    if (dir === __dirname || dir === path.dirname(dir)) {
      return undefined;
    }
  }
}

function readManifest(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
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
