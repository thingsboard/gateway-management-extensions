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
import socket from '../../assets/connector-default-configs/socket.json';
import mqtt from '../../assets/connector-default-configs/mqtt.json';
import modbus from '../../assets/connector-default-configs/modbus.json';
import opcua from '../../assets/connector-default-configs/opcua.json';
import ble from '../../assets/connector-default-configs/ble.json';
import request from '../../assets/connector-default-configs/request.json';
import can from '../../assets/connector-default-configs/can.json';
import bacnet from '../../assets/connector-default-configs/bacnet.json';
import odbc from '../../assets/connector-default-configs/odbc.json';
import rest from '../../assets/connector-default-configs/rest.json';
import snmp from '../../assets/connector-default-configs/snmp.json';
import ftp from '../../assets/connector-default-configs/ftp.json';
import xmpp from '../../assets/connector-default-configs/xmpp.json';
import ocpp from '../../assets/connector-default-configs/ocpp.json';

import { ConnectorType, GatewayConnector, GatewayVersionedDefaultConfig } from './public-api';

export const connectorConfigs = {
  [ConnectorType.MQTT]: mqtt,
  [ConnectorType.MODBUS]: modbus,
  [ConnectorType.OPCUA]: opcua,
  [ConnectorType.BLE]: ble,
  [ConnectorType.REQUEST]: request,
  [ConnectorType.CAN]: can,
  [ConnectorType.BACNET]: bacnet,
  [ConnectorType.ODBC]: odbc,
  [ConnectorType.REST]: rest,
  [ConnectorType.SNMP]: snmp,
  [ConnectorType.FTP]: ftp,
  [ConnectorType.SOCKET]: socket,
  [ConnectorType.XMPP]: xmpp,
  [ConnectorType.OCPP]: ocpp,
};

export function getDefaultConfig(type: ConnectorType): GatewayVersionedDefaultConfig | GatewayConnector {
  const config = connectorConfigs[type];
  if (!config) {
    throw new Error(`No default config found`);
  }
  return config;
}
