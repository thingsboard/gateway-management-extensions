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

import {
  GatewayConnector,
  SocketBasicConfig,
  SocketBasicConfig_v3_5_3,
  SocketLegacyBasicConfig,
} from '../models/public-api';
import { GatewayConnectorVersionProcessor } from './gateway-connector-version-processor.abstract';
import { SocketVersionMappingUtil } from '../utils/public-api';

export class SocketVersionProcessor extends GatewayConnectorVersionProcessor<SocketBasicConfig> {

  constructor(
    protected gatewayVersionIn: string,
    protected connector: GatewayConnector<any>
  ) {
    super(gatewayVersionIn, connector);
  }

  getUpgradedVersion(): GatewayConnector<SocketBasicConfig_v3_5_3> {
    const configurationJson = this.connector.configurationJson;
    return {
      ...this.connector,
      configurationJson: {
        socket: configurationJson ? SocketVersionMappingUtil.mapSocketToUpgradedVersion(configurationJson) : {},
        devices: configurationJson?.devices ? SocketVersionMappingUtil.mapDevicesToUpgradedVersion(configurationJson.devices) : [],
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<SocketBasicConfig_v3_5_3>;
  }

  getDowngradedVersion(): GatewayConnector<SocketLegacyBasicConfig> {
    return {
      ...this.connector,
      configurationJson: SocketVersionMappingUtil.mapSocketToDowngradedVersion(this.connector.configurationJson),
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<SocketLegacyBasicConfig>;
  }
}
