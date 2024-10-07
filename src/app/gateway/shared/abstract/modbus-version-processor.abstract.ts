///
/// Copyright © 2024 ThingsBoard, Inc.
///

import {
  GatewayConnector,
  LegacySlaveConfig,
  ModbusBasicConfig,
  ModbusBasicConfig_v3_5_2,
  ModbusLegacyBasicConfig,
  ModbusLegacySlave,
  ModbusMasterConfig,
  ModbusSlave,
} from '../../shared/public-api';
import { GatewayConnectorVersionProcessor } from './gateway-connector-version-processor.abstract';
import { ModbusVersionMappingUtil } from '../utils/public-api';

export class ModbusVersionProcessor extends GatewayConnectorVersionProcessor<any> {

  constructor(
    protected gatewayVersionIn: string,
    protected connector: GatewayConnector<ModbusBasicConfig>
  ) {
    super(gatewayVersionIn, connector);
  }

  getUpgradedVersion(): GatewayConnector<ModbusBasicConfig_v3_5_2> {
    const configurationJson = this.connector.configurationJson;
    return {
      ...this.connector,
      configurationJson: {
        master: configurationJson.master?.slaves
          ? ModbusVersionMappingUtil.mapMasterToUpgradedVersion(configurationJson.master as ModbusMasterConfig<LegacySlaveConfig>)
          : { slaves: [] },
        slave: configurationJson.slave
          ? ModbusVersionMappingUtil.mapSlaveToUpgradedVersion(configurationJson.slave as ModbusLegacySlave)
          : {} as ModbusSlave,
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<ModbusBasicConfig_v3_5_2>;
  }

  getDowngradedVersion(): GatewayConnector<ModbusLegacyBasicConfig> {
    const configurationJson = this.connector.configurationJson;
    return {
      ...this.connector,
      configurationJson: {
        ...configurationJson,
        slave: configurationJson.slave
          ? ModbusVersionMappingUtil.mapSlaveToDowngradedVersion(configurationJson.slave as ModbusSlave)
          : {} as ModbusLegacySlave,
        master: configurationJson.master?.slaves
          ? ModbusVersionMappingUtil.mapMasterToDowngradedVersion(configurationJson.master as ModbusMasterConfig)
          : { slaves: [] },
      },
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<ModbusLegacyBasicConfig>;
  }
}
