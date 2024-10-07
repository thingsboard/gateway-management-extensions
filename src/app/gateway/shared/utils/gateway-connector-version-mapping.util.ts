///
/// Copyright © 2024 ThingsBoard, Inc.
///

import {
  ConnectorType,
  GatewayConnector,
  ModbusBasicConfig,
  MQTTBasicConfig,
  OPCBasicConfig,
} from '../../shared/public-api';
import { MqttVersionProcessor, OpcVersionProcessor, ModbusVersionProcessor } from '../abstract/public-api';
import { isNumber, isString } from '@core/public-api';

export abstract class GatewayConnectorVersionMappingUtil {

  static getConfig(connector: GatewayConnector, gatewayVersion: string): GatewayConnector {
    switch(connector.type) {
      case ConnectorType.MQTT:
        return new MqttVersionProcessor(gatewayVersion, connector as GatewayConnector<MQTTBasicConfig>).getProcessedByVersion();
      case ConnectorType.OPCUA:
        return new OpcVersionProcessor(gatewayVersion, connector as GatewayConnector<OPCBasicConfig>).getProcessedByVersion();
      case ConnectorType.MODBUS:
        return new ModbusVersionProcessor(gatewayVersion, connector as GatewayConnector<ModbusBasicConfig>).getProcessedByVersion();
      default:
        return connector;
    }
  }

  static parseVersion(version: string | number): number {
    if (isNumber(version)) {
      return version as number;
    }

    return isString(version) ? parseFloat((version as string).replace(/\./g, '').slice(0, 3)) / 100 : 0;
  }
}
