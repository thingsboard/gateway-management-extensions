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

import {
  GatewayConnectorVersionMappingUtil
} from '../utils/public-api';
import { GatewayVersion } from '../../../shared/models/gateway.models';
import { ValidatorResult } from 'jsonschema';
import { parse } from 'json-source-map';

export abstract class ConnectorConfigValidationAbstract {
  gatewayVersion: number;
  configVersion: number;

  protected constructor(protected gatewayVersionIn: string | number, protected configurationJson: any) {
    this.gatewayVersion = GatewayConnectorVersionMappingUtil.parseVersion(this.gatewayVersionIn);
    this.configVersion = GatewayConnectorVersionMappingUtil.parseVersion(this.configurationJson?.configVersion ?? GatewayVersion.Legacy);
  }

  protected jsonPathToPointer(pathArray: (string | number)[]): string {
    if (!pathArray || pathArray.length === 0) return '';
    return (
      '/' +
      pathArray
        .map(segment =>
          typeof segment === 'number'
            ? segment
            : segment.replace(/~/g, '~0').replace(/\//g, '~1')
        )
        .join('/')
    );
  }

  protected mapValidatorErrorsToAceAnnotations(
    rawJson: string,
    validationResult: ValidatorResult
  ) {
    const annotations = [];

    const { pointers } = parse(rawJson);

    for (const error of validationResult.errors) {
      const pointerPath = this.jsonPathToPointer(error.path);
      const pointerInfo = pointers[pointerPath];

      if (pointerInfo?.key) {
        annotations.push({
          row: pointerInfo.key.line,
          column: pointerInfo.key.column,
          text: error.stack,
          type: 'error'
        });
      } else if (pointerInfo?.value) {
        annotations.push({
          row: pointerInfo.value.line,
          column: pointerInfo.value.column,
          text: error.stack,
          type: 'error'
        });
      } else {
        annotations.push({
          row: 0,
          column: 0,
          text: error.stack,
          type: 'error'
        });
      }
    }

    return annotations;
  }
}
