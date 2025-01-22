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
  BacnetBasicConfig,
  ModbusBasicConfig,
  MQTTBasicConfig,
  OPCBasicConfig,
  RestBasicConfig,
  SocketBasicConfig,
} from '../models/public-api';
import {
  ConnectorType,
  GatewayConnector,
} from '../../../shared/models/public-api';
import {
  MqttVersionProcessor,
  OpcVersionProcessor,
  ModbusVersionProcessor,
  SocketVersionProcessor,
  BacnetVersionProcessor,
  RestVersionProcessor
} from '../abstract/public-api';
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
      case ConnectorType.SOCKET:
        return new SocketVersionProcessor(gatewayVersion, connector as GatewayConnector<SocketBasicConfig>).getProcessedByVersion();
      case ConnectorType.BACNET:
        return new BacnetVersionProcessor(gatewayVersion, connector as GatewayConnector<BacnetBasicConfig>).getProcessedByVersion();
      case ConnectorType.REST:
        return new RestVersionProcessor(gatewayVersion, connector as GatewayConnector<RestBasicConfig>).getProcessedByVersion();
      default:
        return connector;
    }
  }

  static parseVersion(version: string | number): number {
    if (isNumber(version)) return version as number;

    if (isString(version)) {
      const [major, minor = '0', patch = '0'] = (version as string).split('.');
      return parseFloat(`${major}.${minor}${patch.slice(0, 1)}`);
    }

    return 0;
  }
}
