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
"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.execute = void 0;
const architect_1 = require("@angular-devkit/architect");
const express = require("express");
const http = require("http");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const ng_packagr_1 = require("ng-packagr");
let server = null;
function initialize(options, root) {
    return __awaiter(this, void 0, void 0, function* () {
        const packager = ng_packagr_1.ngPackagr();
        packager.forProject(path_1.resolve(root, options.project));
        if (options.tsConfig) {
            packager.withTsConfig(path_1.resolve(root, options.tsConfig));
        }
        return packager;
    });
}
function execute(options, context) {
    return rxjs_1.from(initialize(options, context.workspaceRoot)).pipe(operators_1.switchMap(packager => {
        return packager.watch().pipe(operators_1.tap(() => {
            createServer(options, context);
        }));
    }), operators_1.mapTo({ success: true }));
}
exports.execute = execute;
function createServer(options, context) {
    if (server) {
        server.close();
        server = null;
    }
    const app = express();
    const staticServeConfig = require(path_1.resolve(context.workspaceRoot, options.staticServeConfig));
    for (const path of Object.keys(staticServeConfig)) {
        const route = staticServeConfig[path];
        app.get(path, (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
            if (path.endsWith('*')) {
                const target = req.params[0];
                res.sendFile(path_1.resolve(context.workspaceRoot, route.target + target));
            }
            else {
                res.sendFile(path_1.resolve(context.workspaceRoot, route.target));
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
exports.createServer = createServer;
exports.default = architect_1.createBuilder(execute);
