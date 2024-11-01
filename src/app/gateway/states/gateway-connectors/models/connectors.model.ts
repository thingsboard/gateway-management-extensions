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
import { AttributeData, helpBaseUrl } from '@shared/public-api';
import {
  GatewayLogLevel,
  ConnectorType,
  GatewayVersion,
  ReportStrategyConfig,
  ValueType,
  MappingValueType
} from '../../../shared/models/public-api';
import {
  ConverterConnectorMapping,
  ConverterMappingFormValue,
  DataMapping,
  MQTTBasicConfig_v3_5_2,
  MQTTLegacyBasicConfig,
  RequestMappingFormValue,
  RequestMappingValue,
  RequestsMapping,
  SourceType
} from './mqtt.models';
import { DeviceConnectorMapping, OPCBasicConfig_v3_5_2, OPCLegacyBasicConfig, OpcUaMapping } from './opc.models';
import { ModbusBasicConfig_v3_5_2, ModbusLegacyBasicConfig } from './modbus.models';
import {
  DeviceAttributesRequests,
  DeviceAttributesUpdate,
  DeviceDataKey,
  DeviceRpcMethod,
  SocketBasicConfig_v3_6,
  SocketEncoding,
  SocketLegacyBasicConfig
} from './socket.models';

export interface ConnectorBaseInfo {
  name: string;
  id: string;
  enableRemoteLogging: boolean;
  logLevel: GatewayLogLevel;
  configVersion: string | number;
  reportStrategy?: ReportStrategyConfig;
}

export interface GatewayAttributeData extends AttributeData {
  skipSync?: boolean;
}

export interface AddConnectorConfigData {
  dataSourceData: Array<any>;
  gatewayVersion: string;
}

export interface CreatedConnectorConfigData {
  type: ConnectorType;
  name: string;
  logLevel: GatewayLogLevel;
  useDefaults: boolean;
  sendDataOnlyOnChange: boolean;
  configurationJson?: {[key: string]: any};
}

export enum PortLimits {
  MIN = 1,
  MAX = 65535
}

export const GatewayConnectorConfigVersionMap = new Map<ConnectorType, GatewayVersion>([
  [ConnectorType.SOCKET, GatewayVersion.Current],
  [ConnectorType.MQTT, GatewayVersion.v3_5_2],
  [ConnectorType.OPCUA, GatewayVersion.v3_5_2],
  [ConnectorType.MODBUS, GatewayVersion.v3_5_2],
]);

export interface ConnectorDeviceInfo {
  deviceNameExpression: string;
  deviceNameExpressionSource: SourceType | OPCUaSourceType;
  deviceProfileExpression: string;
  deviceProfileExpressionSource: SourceType | OPCUaSourceType;
}

export enum OPCUaSourceType {
  PATH = 'path',
  IDENTIFIER = 'identifier',
  CONST = 'constant'
}

export interface ConnectorSecurity {
  type: SecurityType;
  username?: string;
  password?: string;
  pathToCACert?: string;
  pathToPrivateKey?: string;
  pathToClientCert?: string;
  mode?: ModeType;
}

export enum SecurityType {
  ANONYMOUS = 'anonymous',
  BASIC = 'basic',
  CERTIFICATES = 'certificates'
}

export enum ModeType {
  NONE = 'None',
  SIGN = 'Sign',
  SIGNANDENCRYPT = 'SignAndEncrypt'
}

export enum MappingType {
  DATA = 'data',
  REQUESTS = 'requests',
  OPCUA = 'OPCua'
}

export interface RpcMethod {
  method: string;
  arguments: ValueType[];
}

export interface LegacyRpcMethod {
  method: string;
  arguments: unknown[];
}

export interface MappingInfo {
  mappingType: MappingType;
  value: {[key: string]: any};
  buttonTitle: string;
  withReportStrategy: boolean;
}

export type ConnectorMapping = DeviceConnectorMapping | RequestMappingValue | ConverterConnectorMapping;

export const MappingTypeTranslationsMap = new Map<MappingType, string>(
  [
    [MappingType.DATA, 'gateway.data-mapping'],
    [MappingType.REQUESTS, 'gateway.requests-mapping'],
    [MappingType.OPCUA, 'gateway.data-mapping']
  ]
);

export type MappingValue = DataMapping | RequestsMapping | OpcUaMapping;

export enum SecurityPolicy {
  BASIC128 = 'Basic128Rsa15',
  BASIC256 = 'Basic256',
  BASIC256SHA = 'Basic256Sha256'
}

export const SecurityPolicyTypes = [
  { value: SecurityPolicy.BASIC128, name: 'Basic128RSA15' },
  { value: SecurityPolicy.BASIC256, name: 'Basic256' },
  { value: SecurityPolicy.BASIC256SHA, name: 'Basic256SHA256' }
];

export const SecurityTypeTranslationsMap = new Map<SecurityType, string>(
  [
    [SecurityType.ANONYMOUS, 'gateway.broker.security-types.anonymous'],
    [SecurityType.BASIC, 'gateway.broker.security-types.basic'],
    [SecurityType.CERTIFICATES, 'gateway.broker.security-types.certificates']
  ]
);

export interface MappingDataKey {
  key: string;
  value: any;
  type: MappingValueType;
}

export const SourceTypeTranslationsMap = new Map<SourceType | OPCUaSourceType, string>(
  [
    [SourceType.MSG, 'gateway.source-type.msg'],
    [SourceType.TOPIC, 'gateway.source-type.topic'],
    [SourceType.CONST, 'gateway.source-type.const'],
    [OPCUaSourceType.PATH, 'gateway.source-type.path'],
    [OPCUaSourceType.IDENTIFIER, 'gateway.source-type.identifier'],
    [OPCUaSourceType.CONST, 'gateway.source-type.const']
  ]
);

export enum MappingKeysType {
  ATTRIBUTES = 'attributes',
  TIMESERIES = 'timeseries',
  CUSTOM = 'extensionConfig',
  RPC_METHODS = 'rpc_methods',
  ATTRIBUTES_UPDATES = 'attributes_updates'
}

export const MappingKeysPanelTitleTranslationsMap = new Map<MappingKeysType, string>(
  [
    [MappingKeysType.ATTRIBUTES, 'gateway.attributes'],
    [MappingKeysType.TIMESERIES, 'gateway.timeseries'],
    [MappingKeysType.CUSTOM, 'gateway.keys'],
    [MappingKeysType.ATTRIBUTES_UPDATES, 'gateway.attribute-updates'],
    [MappingKeysType.RPC_METHODS, 'gateway.rpc-methods']
  ]
);

export const MappingKeysAddKeyTranslationsMap = new Map<MappingKeysType, string>(
  [
    [MappingKeysType.ATTRIBUTES, 'gateway.add-attribute'],
    [MappingKeysType.TIMESERIES, 'gateway.add-timeseries'],
    [MappingKeysType.CUSTOM, 'gateway.add-key'],
    [MappingKeysType.ATTRIBUTES_UPDATES, 'gateway.add-attribute-update'],
    [MappingKeysType.RPC_METHODS, 'gateway.add-rpc-method']
  ]
);

export const MappingKeysDeleteKeyTranslationsMap = new Map<MappingKeysType, string>(
  [
    [MappingKeysType.ATTRIBUTES, 'gateway.delete-attribute'],
    [MappingKeysType.TIMESERIES, 'gateway.delete-timeseries'],
    [MappingKeysType.CUSTOM, 'gateway.delete-key'],
    [MappingKeysType.ATTRIBUTES_UPDATES, 'gateway.delete-attribute-update'],
    [MappingKeysType.RPC_METHODS, 'gateway.delete-rpc-method']
  ]
);

export const MappingKeysNoKeysTextTranslationsMap = new Map<MappingKeysType, string>(
  [
    [MappingKeysType.ATTRIBUTES, 'gateway.no-attributes'],
    [MappingKeysType.TIMESERIES, 'gateway.no-timeseries'],
    [MappingKeysType.CUSTOM, 'gateway.no-keys'],
    [MappingKeysType.ATTRIBUTES_UPDATES, 'gateway.no-attribute-updates'],
    [MappingKeysType.RPC_METHODS, 'gateway.no-rpc-methods']
  ]
);

export interface AttributesUpdate {
  key: string;
  type: string;
  value: string;
}

export const QualityTypes = [0, 1 ,2];

export type ConnectorMappingFormValue = DeviceConnectorMapping | RequestMappingFormValue | ConverterMappingFormValue;

export enum ServerSideRpcType {
  WithResponse = 'twoWay',
  WithoutResponse = 'oneWay'
}
export const HelpLinkByMappingTypeMap = new Map<MappingType, string>(
  [
    [MappingType.DATA, helpBaseUrl + '/docs/iot-gateway/config/mqtt/#section-mapping'],
    [MappingType.OPCUA, helpBaseUrl + '/docs/iot-gateway/config/opc-ua/#section-mapping'],
    [MappingType.REQUESTS, helpBaseUrl + '/docs/iot-gateway/config/mqtt/#requests-mapping']
  ]
);

export const MappingHintTranslationsMap = new Map<MappingType, string>(
  [
    [MappingType.DATA, 'gateway.data-mapping-hint'],
    [MappingType.OPCUA, 'gateway.opcua-data-mapping-hint'],
    [MappingType.REQUESTS, 'gateway.requests-mapping-hint']
  ]
);

export enum ServerSideRPCType {
  ONE_WAY = 'oneWay',
  TWO_WAY = 'twoWay'
}

export interface RpcMethodsMapping {
  method: string;
  arguments: Array<MappingDataKey>;
}

export interface LegacyAttribute {
  key: string;
  path: string;
}

export interface LegacyTimeseries {
  key: string;
  path: string;
}

export interface ServerSideRpc {
  type: ServerSideRpcType;
  deviceNameFilter: string;
  methodFilter: string;
  requestTopicExpression: string;
  responseTopicExpression?: string;
  responseTopicQoS?: number;
  responseTimeout?: number;
  valueExpression: string;
}

export type ConnectorLegacyConfig = ConnectorBaseInfo | MQTTLegacyBasicConfig | OPCLegacyBasicConfig | ModbusLegacyBasicConfig | SocketLegacyBasicConfig;

export type ConnectorBaseConfig_v3_5_2 = ConnectorBaseInfo | MQTTBasicConfig_v3_5_2 | OPCBasicConfig_v3_5_2 | ModbusBasicConfig_v3_5_2;

export type ConnectorBaseConfig_v3_6 = ConnectorBaseInfo | SocketBasicConfig_v3_6;

export interface DevicesConfigMapping {
  address: string;
  deviceName: string;
  deviceType: string;
  encoding: SocketEncoding;
  telemetry: DeviceDataKey[];
  attributes: DeviceDataKey[];
  attributeRequests: DeviceAttributesRequests[];
  attributeUpdates: DeviceAttributesUpdate[];
  serverSideRpc: DeviceRpcMethod[];
}


