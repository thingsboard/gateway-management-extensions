import { DevicesConfigMapping } from './connectors.model';

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

export type SocketBasicConfig = SocketBasicConfig_v3_5_3 | SocketLegacyBasicConfig;

export interface SocketBasicConfig_v3_5_3 {
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


