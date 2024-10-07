///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { GatewayConnector, GatewayVersion } from '../models/public-api';
import {
  GatewayConnectorVersionMappingUtil
} from '../utils/public-api';

export abstract class GatewayConnectorVersionProcessor<BasicConfig> {
  gatewayVersion: number;
  configVersion: number;

  protected constructor(protected gatewayVersionIn: string | number, protected connector: GatewayConnector<BasicConfig>) {
    this.gatewayVersion = GatewayConnectorVersionMappingUtil.parseVersion(this.gatewayVersionIn);
    this.configVersion = GatewayConnectorVersionMappingUtil.parseVersion(this.connector.configVersion);
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
    return this.gatewayVersion >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.Current)
      && (!this.configVersion || this.configVersion < this.gatewayVersion);
  }

  private isVersionDowngradeNeeded(): boolean {
    return this.configVersion && this.configVersion >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.Current)
      && (this.configVersion > this.gatewayVersion);
  }

  protected abstract getDowngradedVersion(): GatewayConnector<BasicConfig>;
  protected abstract getUpgradedVersion(): GatewayConnector<BasicConfig>;
}
