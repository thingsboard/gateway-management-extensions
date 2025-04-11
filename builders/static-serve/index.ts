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

import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import * as express from 'express';
import * as http from 'http';
import { NgPackagrBuilderOptions } from '@angular-devkit/build-angular';
import { resolve } from 'path';
import { from, Observable } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';
import { NgPackagr, ngPackagr } from 'ng-packagr';
import { existsSync } from 'fs';
import { watch } from 'chokidar';
import { execSync } from 'child_process';

interface StaticServeOptions extends NgPackagrBuilderOptions {
  staticServeConfig: string;
  port: number;
}

interface StaticServeConfig {
  [path: string]: {
    target: string;
  };
}

let server: http.Server = null;

async function initialize(
  options: StaticServeOptions,
  root: string,
): Promise<NgPackagr> {
  const packager = ngPackagr();

  packager.forProject(resolve(root, options.project));

  if (options.tsConfig) {
    packager.withTsConfig(resolve(root, options.tsConfig));
  }

  return packager;
}


function watchStyles(options: StaticServeOptions,
                     context: BuilderContext) {
  const styleScss = resolve(context.workspaceRoot, 'src', 'app', 'scss', 'style.scss');
  if (existsSync(styleScss)) {
    const styleCompScss = resolve(context.workspaceRoot, 'src', 'app', 'scss', 'style.comp.scss');
    context.logger.info(`==> Watching library styles: ${styleScss}`);
    const postcss = resolve(context.workspaceRoot, 'node_modules', '.bin', 'postcss');
    watch(styleScss).on('change', () => {
      const compileStyleScssCommand = `${postcss} ${styleScss} -o ${styleCompScss}`;
      executeCliCommand(context, compileStyleScssCommand, 'Compile style.scss')
    });
  }
}

function executeCliCommand(context: BuilderContext,
                           cliCommand: string, description: string) {
  try {
    execSync(cliCommand, {
      stdio: 'inherit'
    });
  } catch (err) {
    context.logger.error(`==> ${description} failed`, err);
    process.exit(1);
  }
}

export function execute(
  options: StaticServeOptions,
  context: BuilderContext,
): Observable<BuilderOutput> {
  watchStyles(options, context);
  return from(initialize(options, context.workspaceRoot)).pipe(
    switchMap(packager => {
      return packager.watch().pipe(
        tap(() => {
          createServer(options, context);
        })
      );
    }),
    mapTo({ success: true }),
  );
}

export function createServer(options: StaticServeOptions, context: BuilderContext) {
  if (server) {
    server.close();
    server = null;
  }
  const app = express();

  const staticServeConfig: StaticServeConfig = require(resolve(context.workspaceRoot, options.staticServeConfig));
  for (const path of Object.keys(staticServeConfig)) {
    const route = staticServeConfig[path];
    app.get(path, (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
      if (path.endsWith('*')) {
        const target = req.params[0];
        res.sendFile(resolve(context.workspaceRoot, route.target + target));
      } else {
        res.sendFile(resolve(context.workspaceRoot, route.target));
      }
    });
  }

  /* app.get(options.path, (req, res) => {
    res.sendFile(resolve(context.workspaceRoot, options.source));
  });*/
  /*  app.get('/static/rulenode/rulenode-core-config.umd.js.map', (req, res) => {
      res.sendFile(resolve(context.workspaceRoot, 'dist/rulenode-core-config/bundles/rulenode-core-config.umd.js.map'));
    }); */

  server = http.createServer(app);
  const host = 'localhost';
  server.on('error', (error) => {
    context.logger.error(error.message);
  });
  server.listen(options.port, host, 511, () => {
    context.logger.info(`==> 🌎  Listening on port ${options.port}. Open up http://localhost:${options.port}/ in your browser.`);
  });
}

export default createBuilder<Record<string, string> & StaticServeOptions>(execute);
