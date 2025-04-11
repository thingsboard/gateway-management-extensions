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
  Attribute,
  Timeseries,
  ReportStrategyConfig,
} from '../../../shared/models/public-api';
import { ConnectorSecurity } from './connectors.model';

export type FtpBasicConfig = FtpBasicConfig_v3_7_4 | FtpLegacyBasicConfig;

export interface FtpParameters {
  host: string;
  port: number;
  TLSSupport: boolean;
  security: ConnectorSecurity;
}

export interface FtpRequestsMapping {
  attributeUpdates: FtpAttributeUpdate[];
  serverSideRpc: FtpServerSideRpc[];
}

export interface FtpBasicConfig_v3_7_4 {
  parameters: FtpParameters;
  paths: FtpPath[];
  requestsMapping: FtpRequestMappingValue[] | FtpRequestsMapping;
}

export interface FtpLegacyBasicConfig extends FtpParameters {
  paths: FtpPath[];
  attributeUpdates: any[];
  serverSideRpc: any[]
}

export enum FtpFileDataViewType {
  TABLE = 'TABLE',
  SLICED = 'SLICED'
}

export enum FtpReadModeType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL'
}

export interface FtpPath {
  devicePatternName: string;
  devicePatternType: string;
  delimiter: string;
  path: string;
  readMode: FtpReadModeType;
  maxFileSize: number;
  pollPeriod: number;
  txtFileDataView: FtpFileDataViewType;
  withSortingFiles: boolean;
  attributes: Attribute[];
  timeseries: Timeseries[];
  reportStrategy?: ReportStrategyConfig,
}

export enum FtpRequestType {
  ATTRIBUTE_UPDATE = 'attributeUpdates',
  SERVER_SIDE_RPC = 'serverSideRpc'
}

export const FtpRequestTypesTranslationsMap = new Map<FtpRequestType, string>(
  [
    [FtpRequestType.ATTRIBUTE_UPDATE, 'gateway.request.attribute-update'],
    [FtpRequestType.SERVER_SIDE_RPC, 'gateway.request.rpc-connection'],
  ]
);

export enum FtpAttributeUpdateWritingMode {
  OVERRIDE = 'OVERRIDE',
  WRITE = 'WRITE',
}

export enum FtpServerSideRpcMethodFilter {
  read = 'read',
  write = 'write',
  override = 'override',
}

export interface FtpAttributeUpdate {
  requestType: FtpRequestType;
  path: string;
  deviceNameFilter: string;
  valueExpression: string;
  attributeFilter: string;
  writingMode: FtpAttributeUpdateWritingMode;
}

export interface FtpServerSideRpc {
  requestType: FtpRequestType;
  deviceNameFilter: string;
  methodFilter: string;
  writingMode?: FtpServerSideRpcMethodFilter;
  methodWritingMode?: FtpServerSideRpcMethodFilter;
  valueExpression: string;
}

export type FtpRequestMappingData = FtpAttributeUpdate | FtpServerSideRpc;

export interface FtpRequestMappingValue {
  requestType: FtpRequestType;
  requestValue: FtpRequestMappingData;
}

export interface FtpPathInfo {
  value: FtpPath;
  buttonTitle: string;
  withReportStrategy: boolean;
}

export interface FtpMappingInfo {
  value: FtpRequestMappingData;
  buttonTitle: string;
  withReportStrategy: boolean;
}
