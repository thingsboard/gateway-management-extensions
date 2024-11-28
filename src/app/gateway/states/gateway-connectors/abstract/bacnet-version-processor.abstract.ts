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

import { GatewayConnectorVersionProcessor } from './gateway-connector-version-processor.abstract';
import { BacnetVersionMappingUtil } from '../utils/public-api';
import { GatewayConnector } from '../../../shared/models/public-api';
import { BacnetBasicConfig, BacnetBasicConfig_v3_6_2, BacnetLegacyBasicConfig } from '../models/public-api';

export class BacnetVersionProcessor extends GatewayConnectorVersionProcessor<BacnetBasicConfig> {

  constructor(
    protected gatewayVersionIn: string,
    protected connector: GatewayConnector<BacnetBasicConfig>
  ) {
    super(gatewayVersionIn, connector);
  }

  getUpgradedVersion(): GatewayConnector<BacnetBasicConfig_v3_6_2> {
    const configurationJson = this.connector.configurationJson as BacnetLegacyBasicConfig;
    return {
      ...this.connector,
      configurationJson: {
        application: configurationJson ? BacnetVersionMappingUtil.mapApplicationToUpgradedVersion(configurationJson.general) : {},
        devices: configurationJson?.devices ? BacnetVersionMappingUtil.mapDevicesToUpgradedVersion(configurationJson.devices) : [],
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<BacnetBasicConfig_v3_6_2>;
  }

  getDowngradedVersion(): GatewayConnector<BacnetLegacyBasicConfig> {
    const configurationJson = this.connector.configurationJson as BacnetBasicConfig_v3_6_2;
    return {
      ...this.connector,
      configurationJson: {
        general: configurationJson ? BacnetVersionMappingUtil.mapApplicationToDowngradedVersion(configurationJson.application) : {},
        devices: configurationJson?.devices ? BacnetVersionMappingUtil.mapDevicesToDowngradedVersion(configurationJson.devices) : [],
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<BacnetLegacyBasicConfig>;
  }
}
