///
/// Copyright © 2024 ThingsBoard, Inc.
///

import {
  GatewayConnector,
  LegacyServerConfig,
  OPCBasicConfig,
  OPCBasicConfig_v3_5_2,
  OPCLegacyBasicConfig,
} from '../models/public-api';
import { GatewayConnectorVersionProcessor } from './gateway-connector-version-processor.abstract';
import { OpcVersionMappingUtil } from '../utils/public-api';

export class OpcVersionProcessor extends GatewayConnectorVersionProcessor<OPCBasicConfig> {

  constructor(
    protected gatewayVersionIn: string,
    protected connector: GatewayConnector<OPCBasicConfig>
  ) {
    super(gatewayVersionIn, connector);
  }

  getUpgradedVersion(): GatewayConnector<OPCBasicConfig_v3_5_2> {
    const server = this.connector.configurationJson.server as LegacyServerConfig;
    return {
      ...this.connector,
      configurationJson: {
        server: server ? OpcVersionMappingUtil.mapServerToUpgradedVersion(server) : {},
        mapping: server?.mapping ? OpcVersionMappingUtil.mapMappingToUpgradedVersion(server.mapping) : [],
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<OPCBasicConfig_v3_5_2>;
  }

  getDowngradedVersion(): GatewayConnector<OPCLegacyBasicConfig> {
    return {
      ...this.connector,
      configurationJson: {
        server: OpcVersionMappingUtil.mapServerToDowngradedVersion(this.connector.configurationJson as OPCBasicConfig_v3_5_2)
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<OPCLegacyBasicConfig>;
  }
}
