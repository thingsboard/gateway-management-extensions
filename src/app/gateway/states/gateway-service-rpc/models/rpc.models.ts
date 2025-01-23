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
