///
/// Copyright © 2016-2024 The Thingsboard Authors
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

import { Pipe, PipeTransform } from '@angular/core';
import { ConnectorType, GatewayVersion } from '../../../shared/public-api';
import { GatewayConnectorVersionMappingUtil } from '../utils/public-api';

@Pipe({
  name: 'withReportStrategy',
  standalone: true,
})
export class ReportStrategyVersionPipe implements PipeTransform {
  transform(configVersion: number | string, type?: ConnectorType): boolean {
    const parsedConfigVersion = GatewayConnectorVersionMappingUtil.parseVersion(configVersion);
    if (type === ConnectorType.MODBUS) {
      return parsedConfigVersion >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.v3_5_2);
    }

    return parsedConfigVersion
      >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.Current);
  }
}
