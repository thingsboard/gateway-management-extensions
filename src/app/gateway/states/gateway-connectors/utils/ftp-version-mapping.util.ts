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

import { FtpPath } from '../models/ftp.models';
import { Attribute, Timeseries } from '../../../shared/models/gateway.models';
import { MappingValueType } from '../../../shared/models/mapping.models';

export class FtpVersionMappingUtil {

  static mapPathsToUpgradedVersion(paths: FtpPath[] = []): FtpPath[] {
    return paths.map(({ timeseries = [], attributes = [], ...path }) => {
      return {
        ...path,
        timeseries: this.getUpgradedKeys(timeseries),
        attributes: this.getUpgradedKeys(attributes),
      }
    });
  }

  static mapPathsToDowngradedVersion(paths: FtpPath[] = []): FtpPath[] {
    return paths.map(({ timeseries = [], attributes = [], ...path }) => {
      return {
        ...path,
        timeseries: this.getDowngradedKeys(timeseries),
        attributes: this.getDowngradedKeys(attributes),
      }
    });
  }

  private static getUpgradedKeys(keys: Timeseries[] | Attribute[]): Timeseries[] | Attribute[] {
    return keys.map(({ type, ...key }) => {
      let updatedType: MappingValueType;
      switch (type) {
        case 'int':
          updatedType = MappingValueType.INTEGER;
          break;
        case 'bool':
          updatedType = MappingValueType.BOOLEAN;
          break;
        default:
          updatedType = MappingValueType.STRING;
      }
      return {
       ...key,
        type: updatedType,
      }
    });
  }

  private static getDowngradedKeys(keys: Timeseries[] | Attribute[]): Timeseries[] | Attribute[] {
    return keys.map(({ type, ...key }) => {
      let updatedType: string;
      switch (type) {
        case MappingValueType.INTEGER:
          updatedType = 'int';
          break;
        case MappingValueType.BOOLEAN:
          updatedType = 'bool';
          break;
        case MappingValueType.DOUBLE:
          updatedType = MappingValueType.STRING;
          break;
        default:
          updatedType = MappingValueType.STRING;
      }
      return {
        ...key,
        type: updatedType,
      }
    });
  }
}
