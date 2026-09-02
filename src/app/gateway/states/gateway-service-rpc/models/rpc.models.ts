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
import { ConnectorType, MappingValueType, ModbusDataType, ValueType } from '../../../shared/models/public-api';

export interface RPCCommand {
  command: string;
  params: any;
  time: number;
}

export enum BACnetRequestTypes {
  WriteProperty = 'writeProperty',
  ReadProperty = 'readProperty'
}

export const BACnetRequestTypesTranslates = new Map<BACnetRequestTypes, string>([
  [BACnetRequestTypes.WriteProperty, 'gateway.rpc.write-property'],
  [BACnetRequestTypes.ReadProperty, 'gateway.rpc.read-property']
]);

export enum BACnetObjectTypes {
  BinaryInput = 'binaryInput',
  BinaryOutput = 'binaryOutput',
  AnalogInput = 'analogInput',
  AnalogOutput = 'analogOutput',
  BinaryValue = 'binaryValue',
  AnalogValue = 'analogValue'
}

export const BACnetObjectTypesTranslates = new Map<BACnetObjectTypes, string>([
  [BACnetObjectTypes.AnalogOutput, 'gateway.rpc.analog-output'],
  [BACnetObjectTypes.AnalogInput, 'gateway.rpc.analog-input'],
  [BACnetObjectTypes.BinaryOutput, 'gateway.rpc.binary-output'],
  [BACnetObjectTypes.BinaryInput, 'gateway.rpc.binary-input'],
  [BACnetObjectTypes.BinaryValue, 'gateway.rpc.binary-value'],
  [BACnetObjectTypes.AnalogValue, 'gateway.rpc.analog-value']
]);

export enum BLEMethods {
  WRITE = 'write',
  READ = 'read',
  SCAN = 'scan'
}

export const BLEMethodsTranslates = new Map<BLEMethods, string>([
  [BLEMethods.WRITE, 'gateway.rpc.write'],
  [BLEMethods.READ, 'gateway.rpc.read'],
  [BLEMethods.SCAN, 'gateway.rpc.scan'],
]);

export enum CANByteOrders {
  LITTLE = 'LITTLE',
  BIG = 'BIG'
}

export enum SocketMethodProcessings {
  WRITE = 'write',
  READ = 'read'
}

export const SocketMethodProcessingsTranslates = new Map<SocketMethodProcessings, string>([
  [SocketMethodProcessings.WRITE, 'gateway.rpc.write'],
  [SocketMethodProcessings.READ, 'gateway.rpc.read']
]);

export enum SNMPMethods {
  SET = 'set',
  MULTISET = 'multiset',
  GET = 'get',
  BULKWALK = 'bulkwalk',
  TABLE = 'table',
  MULTIGET = 'multiget',
  GETNEXT = 'getnext',
  BULKGET = 'bulkget',
  WALKS = 'walk'
}

export const SNMPMethodsTranslations = new Map<SNMPMethods, string>([
  [SNMPMethods.SET, 'gateway.rpc.set'],
  [SNMPMethods.MULTISET, 'gateway.rpc.multiset'],
  [SNMPMethods.GET, 'gateway.rpc.get'],
  [SNMPMethods.BULKWALK, 'gateway.rpc.bulk-walk'],
  [SNMPMethods.TABLE, 'gateway.rpc.table'],
  [SNMPMethods.MULTIGET, 'gateway.rpc.multi-get'],
  [SNMPMethods.GETNEXT, 'gateway.rpc.get-next'],
  [SNMPMethods.BULKGET, 'gateway.rpc.bulk-get'],
  [SNMPMethods.WALKS, 'gateway.rpc.walk']
]);

export enum SocketEncodings {
  UTF_8 = 'utf-8'
}

export interface RPCTemplate {
  name?: string;
  config: RPCTemplateConfig;
  type: ConnectorType;
}

export interface RPCTemplateConfig {
  [key: string]: any;
}

export interface RPCTemplateConfigMQTT {
  methodFilter: string;
  requestTopicExpression: string;
  responseTopicExpression?: string;
  responseTimeout?: number;
  valueExpression: string;
  withResponse: boolean;
}

export interface RPCTemplateConfigModbus {
  tag: string;
  type: ModbusDataType;
  functionCode?: number;
  objectsCount: number;
  address: number;
  value?: string;
}

export interface RPCTemplateConfigSocket {
  methodRPC: string;
  methodProcessing: SocketMethodProcessings;
  encoding: SocketEncodings;
  withResponse: boolean;
}

export interface RPCTemplateConfigOPC {
  method: string;
  arguments: ValueType[];
}

export interface OPCTypeValue {
  type: MappingValueType;
  booleanValue?: boolean;
  doubleValue?: number;
  integerValue?: number;
  stringValue?: string;
}

export enum S7DeviceType {
  PLC = 'PLC',
  LOGO = 'LOGO'
}

export enum S7RequestType {
  READ = 'read',
  WRITE = 'write'
}

export const S7RequestTypeTranslates = new Map<S7RequestType, string>([
  [S7RequestType.READ, 'gateway.rpc.read'],
  [S7RequestType.WRITE, 'gateway.rpc.write']
]);

export enum S7AddressType {
  DATA = 'data',
  TAG = 'tag',
  VM = 'vm'
}

export const S7AddressTypeTranslates = new Map<S7AddressType, string>([
  [S7AddressType.DATA, 'gateway.rpc.data'],
  [S7AddressType.TAG, 'gateway.rpc.tag']
]);

export const S7SelectableAddressTypes: S7AddressType[] = [S7AddressType.DATA, S7AddressType.TAG];

export enum S7DataType {
  BOOLEAN = 'boolean',
  STRING = 'string',
  RAW = 'raw',
  BYTES = 'bytes',
  BIT = 'bit',
  BYTE = 'byte',
  USINT = 'usint',
  UINT8 = 'uint8',
  SINT = 'sint',
  INT8 = 'int8',
  INT = 'int',
  INT16 = 'int16',
  SHORT = 'short',
  UINT = 'uint',
  UINT16 = 'uint16',
  WORD = 'word',
  DINT = 'dint',
  INT32 = 'int32',
  UDINT = 'udint',
  UINT32 = 'uint32',
  DWORD = 'dword',
  REAL = 'real',
  FLOAT = 'float',
  FLOAT32 = 'float32',
  LREAL = 'lreal',
  DOUBLE = 'double',
  FLOAT64 = 'float64'
}

export const S7BooleanDataTypes: S7DataType[] = [S7DataType.BOOLEAN];

export interface RPCTemplateConfigS7 {
  deviceName: string;
  requestType: S7RequestType;
  type: S7AddressType;
  dataType?: S7DataType;
  dbNumber?: number;
  start?: number;
  size?: number;
  bit?: number;
  tag?: string;
  vmAddress?: string;
  value?: string;
}

export interface S7RpcFormValue extends RPCTemplateConfigS7 {
  deviceType: S7DeviceType;
}

export interface SaveRPCTemplateData {
  config: RPCTemplateConfig;
  templates: Array<RPCTemplate>;
}

export enum RestSecurityType {
  ANONYMOUS = 'anonymous',
  BASIC = 'basic',
}

export const RestSecurityTypeTranslationsMap = new Map<RestSecurityType, string>(
  [
    [RestSecurityType.ANONYMOUS, 'gateway.broker.security-types.anonymous'],
    [RestSecurityType.BASIC, 'gateway.broker.security-types.basic'],
  ]
);
