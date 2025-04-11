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
import {
  AttributesUpdate,
  ConnectorDeviceInfo,
  ConnectorSecurity,
  DevicesConfigMapping,
  LegacyAttribute,
  LegacyRpcMethod,
  LegacyTimeseries,
  OPCUaSourceType,
  RpcMethod
} from './connectors.model';
import { Attribute, Timeseries } from '../../../shared/models/gateway.models';

export interface ServerConfig {
  name: string;
  url: string;
  timeoutInMillis: number;
  scanPeriodInMillis: number;
  pollPeriodInMillis: number;
  enableSubscriptions: boolean;
  subCheckPeriodInMillis: number;
  showMap: boolean;
  security: string;
  identity: ConnectorSecurity;
}

export interface OpcUaMapping {
  deviceNodePattern?: string;
  deviceNamePattern?: string;
  deviceProfileExpression?: string;
}

export type OPCBasicConfig = OPCBasicConfig_v3_5_2 | OPCLegacyBasicConfig;

export interface OPCBasicConfig_v3_5_2 {
  mapping: DeviceConnectorMapping[];
  server: ServerConfig;
}

export interface OPCLegacyBasicConfig {
  server: LegacyServerConfig;
}

export interface LegacyServerConfig extends Omit<ServerConfig, 'enableSubscriptions'> {
  mapping: LegacyDeviceConnectorMapping[];
  disableSubscriptions: boolean;
}

export interface DeviceConnectorMapping {
  deviceNodePattern: string;
  deviceNodeSource: OPCUaSourceType;
  deviceInfo: ConnectorDeviceInfo;
  attributes?: Attribute[];
  timeseries?: Timeseries[];
  rpc_methods?: RpcMethod[];
  attributes_updates?: AttributesUpdate[];
}

export interface LegacyDeviceConnectorMapping {
  deviceNamePattern: string;
  deviceNodePattern: string;
  deviceTypePattern: string;
  attributes?: LegacyAttribute[];
  timeseries?: LegacyTimeseries[];
  rpc_methods?: LegacyRpcMethod[];
  attributes_updates?: LegacyDeviceAttributeUpdate[];
}

export enum DeviceInfoType {
  FULL = 'full',
  PARTIAL = 'partial'
}

export interface LegacyDeviceAttributeUpdate {
  attributeOnThingsBoard: string;
  attributeOnDevice: string;
}
