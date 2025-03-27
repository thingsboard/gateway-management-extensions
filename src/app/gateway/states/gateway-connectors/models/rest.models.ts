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

import { ConnectorDeviceInfo, ConnectorSecurity } from './connectors.model';
import { Attribute, HTTPMethods, ReportStrategyConfig, Timeseries } from '../../../shared/models/public-api';

export enum RestConverterType {
  JSON = 'json',
  CUSTOM = 'custom'
}

export enum RestSourceType {
  REQUEST = 'request',
  CONST = 'constant'
}

export enum ResponseType {
  DEFAULT = 'default',
  CONST = 'constant',
  ADVANCED = 'advanced'
}

export enum ResponseStatus {
  OK = 'OK',
  ERROR = 'Error'
}

export const ResponseTypeTranslationsMap = new Map<ResponseType, string>(
  [
    [ResponseType.DEFAULT, 'gateway.rest.response-type.default'],
    [ResponseType.CONST, 'gateway.rest.response-type.const'],
    [ResponseType.ADVANCED, 'gateway.rest.response-type.advanced'],
  ]
);

export enum RestRequestType {
  ATTRIBUTE_REQUEST = 'attributeRequests',
  ATTRIBUTE_UPDATE = 'attributeUpdates',
  SERVER_SIDE_RPC = 'serverSideRpc'
}

export const RestRequestTypesTranslationsMap = new Map<RestRequestType, string>(
  [
    [RestRequestType.ATTRIBUTE_REQUEST, 'gateway.request.attribute-request'],
    [RestRequestType.ATTRIBUTE_UPDATE, 'gateway.request.attribute-update'],
    [RestRequestType.SERVER_SIDE_RPC, 'gateway.request.rpc-connection'],
  ]
);

export enum RestRequestsScopeType {
  Shared = 'shared',
  Client = 'client'
}

export const RestRequestTypeFieldsMap = new Map<RestRequestType | 'all', string[]>(
  [
    [RestRequestType.ATTRIBUTE_REQUEST, ['HTTPMethods', 'endpoint', 'type', 'deviceNameExpression', 'attributeNameExpression']],
    [
      RestRequestType.ATTRIBUTE_UPDATE,
      ['HTTPMethod', 'SSLVerify', 'deviceNameFilter', 'attributeFilter', 'requestUrlExpression', 'valueExpression', 'httpHeaders', 'tries', 'allowRedirects']
    ],
    [
      RestRequestType.SERVER_SIDE_RPC,
      ['HTTPMethod', 'deviceNameFilter', 'methodFilter', 'requestUrlExpression', 'valueExpression', 'responseTimeout', 'httpHeaders', 'tries']
    ],
    ['all', ['requestType', 'timeout', 'security']]
  ]
);

export type RestBasicConfig = RestBasicConfig_v3_7_2 | RestLegacyBasicConfig;

export interface RestBasicConfig_v3_7_2 {
  server: RestServerConfig;
  mapping: RestMapping[];
  requestsMapping: RestRequestsMapping | RestRequestMappingValue[];
}

export type RestRequestMappingData = RestAttributeRequest | RestAttributeUpdate | RestServerSideRpc;

export interface RestAttributeRequest {
  requestType?: RestRequestType;
  endpoint: string;
  type: RestRequestsScopeType;
  HTTPMethods: HTTPMethods[];
  security: ConnectorSecurity;
  timeout: number;
  deviceNameExpression: string;
  attributeNameExpression: string;
}

export interface RestResponse {
  type: ResponseType;
  successResponse?: ResponseStatus;
  unsuccessfulResponse?: ResponseStatus;
  responseExpected?: boolean;
  timeout?: number;
  responseAttribute?: string;
}

export interface RestConverter {
  type: RestConverterType;
  deviceInfo?: ConnectorDeviceInfo;
  attributes?: Attribute[];
  timeseries?: Timeseries[];
  extension?: string;
  extensionConfig?: Record<string, unknown>;
}

export interface RestLegacyConverter extends Omit<RestConverter, 'deviceInfo'>{
  deviceNameExpression?: string;
  deviceTypeExpression?: string;
}

export interface RestAttributeUpdate {
  requestType?: RestRequestType;
  HTTPMethods: HTTPMethods[];
  SSLVerify: boolean;
  httpHeaders?: Record<string, string>;
  security: ConnectorSecurity;
  timeout: number;
  tries: number;
  allowRedirects: boolean;
  deviceNameFilter: string;
  attributeFilter: string;
  requestUrlExpression: string;
  valueExpression: string;
}

export interface RestServerSideRpc {
  requestType?: RestRequestType;
  HTTPMethods: HTTPMethods[];
  security: ConnectorSecurity;
  deviceNameFilter: string;
  methodFilter: string;
  requestUrlExpression: string;
  valueExpression: string;
  timeout: number;
  tries: number;
  httpHeaders?: Record<string, string>;
}

export interface RestMapping {
  endpoint: string;
  HTTPMethods: HTTPMethods[];
  security: ConnectorSecurity;
  converter: RestConverter;
  response: RestResponse;
  reportStrategy?: ReportStrategyConfig;
}

export interface RestLegacyMapping extends Omit<RestMapping, 'converter'> {
  converter: RestLegacyConverter;
}

export interface RestRequestsMapping {
  attributeRequests: RestAttributeRequest[];
  attributeUpdates: RestAttributeUpdate[];
  serverSideRpc: RestServerSideRpc[];
}

export interface RestServerConfig {
  host: string;
  port: string;
  SSL: boolean;
  security: {
    cert: string;
    key: string;
  };
}

export interface RestLegacyBasicConfig extends RestServerConfig {
  mapping: RestLegacyMapping[];
  attributeRequests: RestAttributeRequest[];
  attributeUpdates: RestAttributeUpdate[];
  serverSideRpc: RestServerSideRpc[];
}

export interface RestRequestMappingValue {
  requestType: RestRequestType;
  requestValue: RestRequestMappingData;
}

export const RestConvertorTypeTranslationsMap = new Map<RestConverterType, string>(
  [
    [RestConverterType.JSON, 'gateway.JSON'],
    [RestConverterType.CUSTOM, 'gateway.custom']
  ]
);

export const RestDataConversionTranslationsMap = new Map<RestConverterType, string>(
  [
    [RestConverterType.JSON, 'gateway.hints.rest.JSON'],
    [RestConverterType.CUSTOM, 'gateway.custom-hint']
  ]
);

export interface RestMappingInfo<Mapping = RestMapping> {
  value: Mapping;
  buttonTitle: string;
  withReportStrategy: boolean;
  defaultRequestUrl?: string;
}

