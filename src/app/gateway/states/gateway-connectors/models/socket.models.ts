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
import { DevicesConfigMapping } from './connectors.model';
import { ReportStrategyConfig, SocketEncoding } from '../../../shared/models/public-api';

export enum SocketType {
  TCP = 'TCP',
  UDP = 'UDP',
}

export enum SocketValueKey {
  TIMESERIES = 'telemetry',
  ATTRIBUTES = 'attributes',
  ATTRIBUTES_REQUESTS = 'attributeRequests',
  ATTRIBUTES_UPDATES = 'attributeUpdates',
  RPC_METHODS = 'serverSideRpc',
}

export interface SocketConfig {
  address: string;
  type: SocketType;
  port: number;
  bufferSize: number;
}

export interface DeviceAttributesUpdate {
  encoding: SocketEncoding;
  attributeOnThingsBoard: string;
}

export interface DeviceDataKey {
  key: string;
  byteFrom: number;
  byteTo: number;
  reportStrategy: ReportStrategyConfig;
}

export interface DeviceRpcMethod {
  methodRPC: string;
  withResponse: boolean;
  encoding: SocketEncoding;
}

export const SocketKeysPanelTitleTranslationsMap = new Map<SocketValueKey, string>(
  [
    [SocketValueKey.ATTRIBUTES, 'gateway.attributes'],
    [SocketValueKey.TIMESERIES, 'gateway.timeseries'],
    [SocketValueKey.ATTRIBUTES_REQUESTS, 'gateway.attribute-requests'],
    [SocketValueKey.ATTRIBUTES_UPDATES, 'gateway.attribute-updates'],
    [SocketValueKey.RPC_METHODS, 'gateway.rpc-methods']
  ]
);

export type SocketBasicConfig = SocketBasicConfig_v3_6 | SocketLegacyBasicConfig;

export interface SocketBasicConfig_v3_6 {
  socket: SocketConfig;
  devices: DevicesConfigMapping[];
}

export interface SocketLegacyBasicConfig extends SocketConfig {
  devices: LegacyDevicesConfigMapping[];
}

export interface LegacyDevicesConfigMapping extends Omit<DevicesConfigMapping, 'attributesRequests'> {
  attributeRequests: LegacyDeviceAttributesRequests[];
}

export type LegacyDeviceAttributesRequests = Omit<DeviceAttributesRequests, 'requestExpressionSource'> & Omit<DeviceAttributesRequests, 'attributeNameExpressionSource'>;

export interface DeviceAttributesRequests {
  type: RequestsType;
  expressionType: ExpressionType;
  requestExpression: string;
  attributeNameExpression: string;
  requestExpressionSource: ExpressionType;
  attributeNameExpressionSource: ExpressionType;
}

export enum RequestsType {
  Shared = 'shared',
  Client = 'client'
}

export enum ExpressionType {
  Constant = 'constant',
  Expression = 'expression'
}

export const SocketKeysAddKeyTranslationsMap = new Map<SocketValueKey, string>(
  [
    [SocketValueKey.ATTRIBUTES, 'gateway.add-attribute'],
    [SocketValueKey.TIMESERIES, 'gateway.add-timeseries'],
    [SocketValueKey.ATTRIBUTES_REQUESTS, 'gateway.add-attribute-request'],
    [SocketValueKey.ATTRIBUTES_UPDATES, 'gateway.add-attribute-update'],
    [SocketValueKey.RPC_METHODS, 'gateway.add-rpc-method']
  ]
);

export const SocketKeysDeleteKeyTranslationsMap = new Map<SocketValueKey, string>(
  [
    [SocketValueKey.ATTRIBUTES, 'gateway.delete-attribute'],
    [SocketValueKey.TIMESERIES, 'gateway.delete-timeseries'],
    [SocketValueKey.ATTRIBUTES_REQUESTS, 'gateway.delete-attribute-request'],
    [SocketValueKey.ATTRIBUTES_UPDATES, 'gateway.delete-attribute-update'],
    [SocketValueKey.RPC_METHODS, 'gateway.delete-rpc-method']
  ]
);

export const SocketKeysNoKeysTextTranslationsMap = new Map<SocketValueKey, string>(
  [
    [SocketValueKey.ATTRIBUTES, 'gateway.no-attributes'],
    [SocketValueKey.TIMESERIES, 'gateway.no-timeseries'],
    [SocketValueKey.ATTRIBUTES_REQUESTS, 'gateway.no-attribute-requests'],
    [SocketValueKey.ATTRIBUTES_UPDATES, 'gateway.no-attribute-updates'],
    [SocketValueKey.RPC_METHODS, 'gateway.no-rpc-methods']
  ]
);

export interface SocketAttributeUpdates {
  encoding: SocketEncoding;
  attributeOnThingsBoard: string;
}

export type SocketDeviceKeys = DeviceDataKey | DeviceRpcMethod | SocketAttributeUpdates | DeviceAttributesRequests


