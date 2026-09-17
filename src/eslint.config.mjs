/*
 * Copyright © 2016-2025 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {defineConfig, globalIgnores} from "eslint/config";
import eslintBaseConfig from "../eslint.config.mjs";

export default defineConfig([
  {
    extends: [eslintBaseConfig],
  },
  globalIgnores(["!**/*"]),
  {
    files: ["**/*.ts"],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        project: ["tsconfig.lib.json"],
        createDefaultProgram: true,
      },
    },

    rules: {
      "@angular-eslint/directive-selector": ["error", {
        type: "attribute",
        prefix: "tb",
        style: "camelCase",
      }],

      "@angular-eslint/component-selector": ["error", {
        type: "element",
        prefix: "tb",
        style: "kebab-case",
      }],
    },
  }, {
    files: ["**/*.html"],
    rules: {},
  }
]);
