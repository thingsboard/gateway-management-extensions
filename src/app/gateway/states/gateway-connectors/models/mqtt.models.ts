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
import { Attribute, Timeseries } from '../../../shared/models/public-api';
import { ConnectorDeviceInfo, ConnectorSecurity, ServerSideRpc } from './connectors.model';

export interface BrokerConfig {
  name: string;
  host: string;
  port: number;
  version: number;
  clientId: string;
  maxNumberOfWorkers: number;
  maxMessageNumberPerWorker: number;
  security: ConnectorSecurity;
}

export interface WorkersConfig {
  maxNumberOfWorkers: number;
  maxMessageNumberPerWorker: number;
}

export interface DataMapping {
  topicFilter: string;
  QoS: string | number;
  converter: Converter;
}

export interface Converter {
  type: MqttConverterType;
  deviceInfo?: ConnectorDeviceInfo;
  sendDataOnlyOnChange: boolean;
  timeout: number;
  attributes?: Attribute[];
  timeseries?: Timeseries[];
  extension?: string;
  cached?: boolean;
  extensionConfig?: Record<string, number>;
}

export enum MqttConverterType {
  JSON = 'json',
  BYTES = 'bytes',
  CUSTOM = 'custom'
}

export enum MQTTSourceType {
  MSG = 'message',
  TOPIC = 'topic',
  CONST = 'constant'
}

export const MqttVersions = [
  { name: 3.1, value: 3 },
  { name: 3.11, value: 4 },
  { name: 5, value: 5 }
];

export const QualityTypeTranslationsMap = new Map<number, string>(
  [
    [0, 'gateway.qos.at-most-once'],
    [1, 'gateway.qos.at-least-once'],
    [2, 'gateway.qos.exactly-once']
  ]
);

export type MQTTBasicConfig = MQTTBasicConfig_v3_5_2 | MQTTLegacyBasicConfig;

export interface MQTTBasicConfig_v3_5_2 {
  mapping: ConverterConnectorMapping[];
  requestsMapping: Record<RequestType, RequestMappingData[] | RequestMappingValue[]> | RequestMappingData[] | RequestMappingValue[];
  broker: BrokerConfig;
  workers?: WorkersConfig;
}

export interface MQTTLegacyBasicConfig {
  mapping: LegacyConverterConnectorMapping[];
  broker: BrokerConfig;
  workers?: WorkersConfig;
  connectRequests: LegacyRequestMappingData[];
  disconnectRequests: LegacyRequestMappingData[];
  attributeRequests: LegacyRequestMappingData[];
  attributeUpdates: LegacyRequestMappingData[];
  serverSideRpc: LegacyRequestMappingData[];
}

export interface ConverterConnectorMapping {
  topicFilter: string;
  subscriptionQos?: string | number;
  converter: Converter;
}

export const ConvertorTypeTranslationsMap = new Map<MqttConverterType, string>(
  [
    [MqttConverterType.JSON, 'gateway.JSON'],
    [MqttConverterType.BYTES, 'gateway.bytes'],
    [MqttConverterType.CUSTOM, 'gateway.custom']
  ]
);

export interface LegacyConverterConnectorMapping {
  topicFilter: string;
  subscriptionQos?: string | number;
  converter: LegacyConverter;
}

export interface RequestMappingValue {
  requestType: RequestType;
  requestValue: RequestMappingData;
}

export interface RequestMappingFormValue {
  requestType: RequestType;
  requestValue: Record<RequestType, RequestMappingData>;
}

export type RequestMappingData = ConnectRequest | DisconnectRequest | AttributeRequest | AttributeUpdate | ServerSideRpc;

export enum RequestType {
  CONNECT_REQUEST = 'connectRequests',
  DISCONNECT_REQUEST = 'disconnectRequests',
  ATTRIBUTE_REQUEST = 'attributeRequests',
  ATTRIBUTE_UPDATE = 'attributeUpdates',
  SERVER_SIDE_RPC = 'serverSideRpc'
}

export type LegacyRequestMappingData =
  LegacyConnectRequest
  | LegacyDisconnectRequest
  | LegacyAttributeRequest
  | LegacyAttributeUpdate
  | LegacyServerSideRpc;

export interface LegacyConverter extends Converter {
  deviceNameJsonExpression?: string;
  deviceTypeJsonExpression?: string;
  deviceNameTopicExpression?: string;
  deviceTypeTopicExpression?: string;
  deviceNameExpression?: string;
  deviceNameExpressionSource?: string;
  deviceTypeExpression?: string;
  deviceProfileExpression?: string;
  deviceProfileExpressionSource?: string;
  ['extension-config']?: Record<string, unknown>;
}

export interface ConnectRequest {
  topicFilter: string;
  deviceInfo: ConnectorDeviceInfo;
}

export interface DisconnectRequest {
  topicFilter: string;
  deviceInfo: ConnectorDeviceInfo;
}

export interface AttributeRequest {
  retain: boolean;
  topicFilter: string;
  deviceInfo: ConnectorDeviceInfo;
  attributeNameExpressionSource: MQTTSourceType;
  attributeNameExpression: string;
  topicExpression: string;
  valueExpression: string;
}

export interface AttributeUpdate {
  retain: boolean;
  deviceNameFilter: string;
  attributeFilter: string;
  topicExpression: string;
  valueExpression: string;
}

export interface LegacyConnectRequest {
  topicFilter: string;
  deviceNameJsonExpression?: string;
  deviceNameTopicExpression?: string;
}

interface LegacyDisconnectRequest {
  topicFilter: string;
  deviceNameJsonExpression?: string;
  deviceNameTopicExpression?: string;
}

interface LegacyAttributeRequest {
  retain: boolean;
  topicFilter: string;
  deviceNameJsonExpression: string;
  attributeNameJsonExpression: string;
  topicExpression: string;
  valueExpression: string;
}

interface LegacyAttributeUpdate {
  retain: boolean;
  deviceNameFilter: string;
  attributeFilter: string;
  topicExpression: string;
  valueExpression: string;
}

interface LegacyServerSideRpc {
  deviceNameFilter: string;
  methodFilter: string;
  requestTopicExpression: string;
  responseTopicExpression?: string;
  responseTimeout?: number;
  valueExpression: string;
}

export interface RequestsMapping {
  requestType: RequestType;
  type: string;
  details: string;
}

export const RequestTypesTranslationsMap = new Map<RequestType, string>(
  [
    [RequestType.CONNECT_REQUEST, 'gateway.request.connect-request'],
    [RequestType.DISCONNECT_REQUEST, 'gateway.request.disconnect-request'],
    [RequestType.ATTRIBUTE_REQUEST, 'gateway.request.attribute-request'],
    [RequestType.ATTRIBUTE_UPDATE, 'gateway.request.attribute-update'],
    [RequestType.SERVER_SIDE_RPC, 'gateway.request.rpc-connection'],
  ]
);

export type ConverterMappingFormValue = Omit<ConverterConnectorMapping, 'converter'> & {
  converter: {
    type: MqttConverterType;
  } & Record<MqttConverterType, Converter>;
};

export const DataConversionTranslationsMap = new Map<MqttConverterType, string>(
  [
    [MqttConverterType.JSON, 'gateway.JSON-hint'],
    [MqttConverterType.BYTES, 'gateway.bytes-hint'],
    [MqttConverterType.CUSTOM, 'gateway.custom-hint']
  ]
);
