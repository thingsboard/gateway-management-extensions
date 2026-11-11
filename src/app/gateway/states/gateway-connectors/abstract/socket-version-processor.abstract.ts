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
  SocketBasicConfig,
  SocketBasicConfig_v3_6,
  SocketLegacyBasicConfig,
} from '../models/public-api';
import { GatewayConnectorVersionProcessor } from './gateway-connector-version-processor.abstract';
import { GatewayConnectorVersionMappingUtil, SocketVersionMappingUtil } from '../utils/public-api';
import { GatewayConnector, GatewayVersion } from '../../../shared/models/public-api';

export class SocketVersionProcessor extends GatewayConnectorVersionProcessor<SocketBasicConfig> {

  constructor(
    protected gatewayVersionIn: string,
    protected connector: GatewayConnector<any>
  ) {
    super(gatewayVersionIn, connector);
  }

  getProcessedByVersion(): GatewayConnector<SocketBasicConfig> {
    const connector = super.getProcessedByVersion();
    if (!this.gatewayVersion || this.gatewayVersion >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.v3_8_6)) {
      return connector;
    }
    return {
      ...connector,
      configurationJson: SocketVersionMappingUtil.mapRpcMethodsToPre386Version(connector.configurationJson),
    } as GatewayConnector<SocketBasicConfig>;
  }

  getUpgradedVersion(): GatewayConnector<SocketBasicConfig_v3_6> {
    const configurationJson = this.connector.configurationJson;
    return {
      ...this.connector,
      configurationJson: {
        socket: configurationJson ? SocketVersionMappingUtil.mapSocketToUpgradedVersion(configurationJson) : {},
        devices: configurationJson?.devices ? SocketVersionMappingUtil.mapDevicesToUpgradedVersion(configurationJson.devices) : [],
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<SocketBasicConfig_v3_6>;
  }

  getDowngradedVersion(): GatewayConnector<SocketLegacyBasicConfig> {
    return {
      ...this.connector,
      configurationJson: SocketVersionMappingUtil.mapSocketToDowngradedVersion(this.connector.configurationJson),
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<SocketLegacyBasicConfig>;
  }
}
