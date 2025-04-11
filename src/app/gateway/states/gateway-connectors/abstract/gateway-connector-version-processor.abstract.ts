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

import { ConnectorBaseInfo, GatewayConnectorConfigVersionMap } from '../models/public-api';
import {
  GatewayConnectorVersionMappingUtil
} from '../utils/public-api';
import { GatewayConnector } from '../../../shared/models/public-api';

export abstract class GatewayConnectorVersionProcessor<BasicConfig> {
  gatewayVersion: number;
  configVersion: number;

  protected constructor(protected gatewayVersionIn: string | number, protected connector: GatewayConnector<BasicConfig>) {
    this.gatewayVersion = GatewayConnectorVersionMappingUtil.parseVersion(this.gatewayVersionIn);
    this.configVersion = GatewayConnectorVersionMappingUtil.parseVersion(this.connector.configVersion ?? (this.connector.configurationJson as ConnectorBaseInfo).configVersion);
  }

  getProcessedByVersion(): GatewayConnector<BasicConfig> {
    if (!this.isVersionUpdateNeeded()) {
      return this.connector;
    }

    return this.processVersionUpdate();
  }

  private processVersionUpdate(): GatewayConnector<BasicConfig> {
    if (this.isVersionUpgradeNeeded()) {
      return this.getUpgradedVersion();
    } else if (this.isVersionDowngradeNeeded()) {
      return this.getDowngradedVersion();
    }

    return this.connector;
  }

  private isVersionUpdateNeeded(): boolean {
    if (!this.gatewayVersion) {
      return false;
    }

    return this.configVersion !== this.gatewayVersion;
  }

  private isVersionUpgradeNeeded(): boolean {
    const connectorTypeLastVersion = GatewayConnectorVersionMappingUtil.parseVersion(GatewayConnectorConfigVersionMap.get(this.connector.type));

    const isGatewayUpgradable = this.gatewayVersion >= connectorTypeLastVersion;
    const isConfigUpgradeNeeded = !this.configVersion ||
      (this.configVersion < this.gatewayVersion && this.configVersion < connectorTypeLastVersion);

    return isGatewayUpgradable && isConfigUpgradeNeeded;
  }

  private isVersionDowngradeNeeded(): boolean {
    const connectorExpectedVersion = GatewayConnectorVersionMappingUtil.parseVersion(GatewayConnectorConfigVersionMap.get(this.connector.type));
    return this.configVersion && this.configVersion >= connectorExpectedVersion
      && (connectorExpectedVersion > this.gatewayVersion);
  }

  protected abstract getDowngradedVersion(): GatewayConnector<BasicConfig>;
  protected abstract getUpgradedVersion(): GatewayConnector<BasicConfig>;
}
