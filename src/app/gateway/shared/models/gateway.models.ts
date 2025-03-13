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

import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  ConnectorBaseConfig_v3_5_2,
  ConnectorBaseConfig_v3_6,
  ConnectorBaseConfig_v3_6_2,
  ConnectorBaseConfig_v3_7_0,
  ConnectorLegacyConfig
} from '../../states/gateway-connectors/models/public-api';
import { ConfigurationModes, ReportStrategyConfig } from './report-strategy.models';

export const jsonRequired = (control: AbstractControl): ValidationErrors | null => !control.value ? {required: true} : null;

export enum GatewayLogLevel {
  NONE = 'NONE',
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE'
}

export enum GatewayVersion {
  v3_7_0 = '3.7',
  v3_6_3 = '3.6.3',
  v3_6_2 = '3.6.2',
  v3_6_0 = '3.6',
  v3_5_2 = '3.5.2',
  Legacy = 'legacy'
}

export enum ConnectorType {
  MQTT = 'mqtt',
  MODBUS = 'modbus',
  GRPC = 'grpc',
  OPCUA = 'opcua',
  BLE = 'ble',
  REQUEST = 'request',
  CAN = 'can',
  BACNET = 'bacnet',
  ODBC = 'odbc',
  REST = 'rest',
  SNMP = 'snmp',
  FTP = 'ftp',
  SOCKET = 'socket',
  XMPP = 'xmpp',
  OCPP = 'ocpp',
  CUSTOM = 'custom'
}

export const GatewayConnectorDefaultTypesTranslatesMap = new Map<ConnectorType, string>([
  [ConnectorType.MQTT, 'MQTT'],
  [ConnectorType.MODBUS, 'MODBUS'],
  [ConnectorType.GRPC, 'GRPC'],
  [ConnectorType.OPCUA, 'OPCUA'],
  [ConnectorType.BLE, 'BLE'],
  [ConnectorType.REQUEST, 'REQUEST'],
  [ConnectorType.CAN, 'CAN'],
  [ConnectorType.BACNET, 'BACNET'],
  [ConnectorType.ODBC, 'ODBC'],
  [ConnectorType.REST, 'REST'],
  [ConnectorType.SNMP, 'SNMP'],
  [ConnectorType.FTP, 'FTP'],
  [ConnectorType.SOCKET, 'SOCKET'],
  [ConnectorType.XMPP, 'XMPP'],
  [ConnectorType.OCPP, 'OCPP'],
  [ConnectorType.CUSTOM, 'CUSTOM']
]);

export type ConnectorBaseConfig = ConnectorLegacyConfig
  | ConnectorBaseConfig_v3_6_2
  | ConnectorBaseConfig_v3_6
  | ConnectorBaseConfig_v3_5_2
  | ConnectorBaseConfig_v3_7_0;

export interface GatewayConnector<BaseConfig = ConnectorBaseConfig> extends GatewayConnectorBase {
  configurationJson: BaseConfig;
  basicConfig?: BaseConfig;
}

export interface GatewayConnectorBase {
  name: string;
  type: ConnectorType;
  configuration?: string;
  logLevel: string;
  key?: string;
  class?: string;
  mode?: ConfigurationModes;
  configVersion?: string;
  reportStrategy?: ReportStrategyConfig;
  sendDataOnlyOnChange?: boolean;
  enableRemoteLogging?: boolean;
  ts?: number;
}

export interface GatewayVersionedDefaultConfig {
  legacy: GatewayConnector<ConnectorLegacyConfig>;
  '3.5.2'?: GatewayConnector<ConnectorBaseConfig_v3_5_2>;
  '3.6'?: GatewayConnector<ConnectorBaseConfig_v3_6>;
  '3.6.2'?: GatewayConnector<ConnectorBaseConfig_v3_6_2>;
}

export interface Attribute {
  key: string;
  type: string;
  value: string;
}

export interface Timeseries {
  key: string;
  type: string;
  value: string;
}

export enum SocketEncoding {
  UTF8 = 'utf-8',
  HEX = 'hex',
  UTF16 = 'utf-16',
  UTF32 = 'utf-32',
  UTF16BE = 'utf-16-be',
  UTF16LE = 'utf-16-le',
  UTF32BE = 'utf-32-be',
  UTF32LE = 'utf-32-le',
}

export interface GatewayConfigCommand {
  attributeOnGateway: string;
  command: string;
  timeout: number;
  installCmd?: string;
}

export enum HTTPMethods {
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE'
}
