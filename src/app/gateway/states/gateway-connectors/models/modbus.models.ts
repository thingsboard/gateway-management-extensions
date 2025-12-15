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
import { ModbusDataType, ReportStrategyConfig } from '../../../shared/models/public-api';
import { ValueTypeData } from '@shared/public-api';

export enum ModbusProtocolType {
  TCP = 'tcp',
  UDP = 'udp',
  Serial = 'serial',
}

export enum ModbusMethodType {
  SOCKET = 'socket',
  RTU = 'rtu',
}

export enum ModbusSerialMethodType {
  RTU = 'rtu',
  ASCII = 'ascii',
}

export enum ModbusParity {
  Even = 'E',
  Odd = 'O',
  None = 'N'
}

export enum ModbusOrderType {
  BIG = 'BIG',
  LITTLE = 'LITTLE',
}

export enum ModbusRegisterType {
  HoldingRegisters = 'holding_registers',
  CoilsInitializer = 'coils_initializer',
  InputRegisters = 'input_registers',
  DiscreteInputs = 'discrete_inputs'
}

export enum ModbusValueKey {
  ATTRIBUTES = 'attributes',
  TIMESERIES = 'timeseries',
  ATTRIBUTES_UPDATES = 'attributeUpdates',
  RPC_REQUESTS = 'rpc',
}

export interface ModbusMasterConfig<Slave = SlaveConfig> {
  slaves: Slave[];
}

export interface LegacySlaveConfig extends Omit<SlaveConfig, 'reportStrategy'> {
  sendDataOnlyOnChange: boolean;
}

export interface SlaveConfig {
  name: string;
  host?: string;
  port: string | number;
  serialPort?: string;
  type: ModbusProtocolType;
  method: ModbusMethodType;
  timeout: number;
  byteOrder: ModbusOrderType;
  wordOrder: ModbusOrderType;
  retries: number;
  retryOnEmpty: boolean;
  retryOnInvalid: boolean;
  pollPeriod: number;
  unitId: number;
  deviceName: string;
  deviceType?: string;
  reportStrategy: ReportStrategyConfig;
  connectAttemptTimeMs: number;
  connectAttemptCount: number;
  waitAfterFailedAttemptsMs: number;
  attributes: ModbusValue[];
  timeseries: ModbusValue[];
  attributeUpdates: ModbusValue[];
  rpc: ModbusValue[];
  security?: ModbusSecurity;
  baudrate?: number;
  stopbits?: number;
  bytesize?: number;
  parity?: ModbusParity;
  strict?: boolean;
}

export interface ModbusValue {
  tag: string;
  type: ModbusDataType;
  functionCode?: number;
  objectsCount: number;
  address: number;
  value?: string;
  reportStrategy?: ReportStrategyConfig;
  multiplier?: number;
  divider?: number;
  bit?: number;
  bitTargetType?: ModbusBitTargetType;
}

export const ModbusBaudrates = [4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];
export const ModbusByteSizes = [5, 6, 7, 8];
export const ModbusDefaultRetries = 3;

export const ModbusRegisterTranslationsMap = new Map<ModbusRegisterType, string>(
  [
    [ModbusRegisterType.HoldingRegisters, 'gateway.holding_registers'],
    [ModbusRegisterType.CoilsInitializer, 'gateway.coils_initializer'],
    [ModbusRegisterType.InputRegisters, 'gateway.input_registers'],
    [ModbusRegisterType.DiscreteInputs, 'gateway.discrete_inputs']
  ]
);

export type ModbusBasicConfig = ModbusBasicConfig_v3_5_2 | ModbusLegacyBasicConfig;

export interface ModbusBasicConfig_v3_5_2 {
  master: ModbusMasterConfig;
  slave: ModbusSlave;
}

export interface ModbusLegacyBasicConfig {
  master: ModbusMasterConfig<LegacySlaveConfig>;
  slave: ModbusLegacySlave;
}

export interface ModbusSlave {
  host?: string;
  type: ModbusProtocolType;
  method: ModbusMethodType;
  unitId: number;
  serialPort?: string;
  baudrate?: number;
  deviceName: string;
  deviceType: string;
  pollPeriod: number;
  sendDataToThingsBoard: boolean;
  byteOrder: ModbusOrderType;
  wordOrder: ModbusOrderType;
  identity: ModbusIdentity;
  values?: ModbusValuesState;
  port: string | number;
  security: ModbusSecurity;
}

export interface ModbusLegacySlave extends Omit<ModbusSlave, 'values'> {
  values?: ModbusLegacyRegisterValues;
}

export interface ModbusSecurity {
  certfile?: string;
  keyfile?: string;
  password?: string;
  server_hostname?: string;
  reqclicert?: boolean;
}

export enum ModbusBitTargetType {
  BooleanType = 'bool',
  IntegerType = 'int',
}

export const ModbusBitTargetTypeTranslationMap = new Map<ModbusBitTargetType, string>([
  [ModbusBitTargetType.BooleanType, 'gateway.boolean'],
  [ModbusBitTargetType.IntegerType, 'gateway.integer'],
]);

export const ModbusMethodLabelsMap = new Map<ModbusMethodType | ModbusSerialMethodType, string>(
  [
    [ModbusMethodType.SOCKET, 'Socket'],
    [ModbusMethodType.RTU, 'RTU'],
    [ModbusSerialMethodType.ASCII, 'ASCII'],
  ]
);

export const ModbusProtocolLabelsMap = new Map<ModbusProtocolType, string>(
  [
    [ModbusProtocolType.TCP, 'TCP'],
    [ModbusProtocolType.UDP, 'UDP'],
    [ModbusProtocolType.Serial, 'Serial'],
  ]
);

export interface ModbusRegisterValues {
  holding_registers: ModbusValues;
  coils_initializer: ModbusValues;
  input_registers: ModbusValues;
  discrete_inputs: ModbusValues;
}

export interface ModbusValues {
  attributes: ModbusValue[];
  timeseries: ModbusValue[];
  attributeUpdates: ModbusValue[];
  rpc: ModbusValue[];
}

export interface ModbusSlaveInfo<Slave = SlaveConfig> {
  value: Slave;
  buttonTitle: string;
  hideNewFields: boolean;
}

export const ModbusParityLabelsMap = new Map<ModbusParity, string>(
  [
    [ModbusParity.Even, 'Even'],
    [ModbusParity.Odd, 'Odd'],
    [ModbusParity.None, 'None'],
  ]
);

export const ModbusKeysPanelTitleTranslationsMap = new Map<ModbusValueKey, string>(
  [
    [ModbusValueKey.ATTRIBUTES, 'gateway.attributes'],
    [ModbusValueKey.TIMESERIES, 'gateway.timeseries'],
    [ModbusValueKey.ATTRIBUTES_UPDATES, 'gateway.attribute-updates'],
    [ModbusValueKey.RPC_REQUESTS, 'gateway.rpc-requests']
  ]
);

export const ModbusKeysAddKeyTranslationsMap = new Map<ModbusValueKey, string>(
  [
    [ModbusValueKey.ATTRIBUTES, 'gateway.add-attribute'],
    [ModbusValueKey.TIMESERIES, 'gateway.add-timeseries'],
    [ModbusValueKey.ATTRIBUTES_UPDATES, 'gateway.add-attribute-update'],
    [ModbusValueKey.RPC_REQUESTS, 'gateway.add-rpc-request']
  ]
);

export const ModbusKeysDeleteKeyTranslationsMap = new Map<ModbusValueKey, string>(
  [
    [ModbusValueKey.ATTRIBUTES, 'gateway.delete-attribute'],
    [ModbusValueKey.TIMESERIES, 'gateway.delete-timeseries'],
    [ModbusValueKey.ATTRIBUTES_UPDATES, 'gateway.delete-attribute-update'],
    [ModbusValueKey.RPC_REQUESTS, 'gateway.delete-rpc-request']
  ]
);

export const ModbusKeysNoKeysTextTranslationsMap = new Map<ModbusValueKey, string>(
  [
    [ModbusValueKey.ATTRIBUTES, 'gateway.no-attributes'],
    [ModbusValueKey.TIMESERIES, 'gateway.no-timeseries'],
    [ModbusValueKey.ATTRIBUTES_UPDATES, 'gateway.no-attribute-updates'],
    [ModbusValueKey.RPC_REQUESTS, 'gateway.no-rpc-requests']
  ]
);

export type ModbusValuesState = ModbusRegisterValues | ModbusValues;

export interface ModbusFormValue extends ModbusValue {
  modifierType?: ModifierType;
  modifierValue?: string;
}

export enum ModifierType {
  DIVIDER = 'divider',
  MULTIPLIER = 'multiplier',
}

export const ModifierTypesMap = new Map<ModifierType, ValueTypeData>(
  [
    [
      ModifierType.DIVIDER,
      {
        name: 'gateway.divider',
        icon: 'mdi:division'
      }
    ],
    [
      ModifierType.MULTIPLIER,
      {
        name: 'gateway.multiplier',
        icon: 'mdi:multiplication'
      }
    ],
  ]
);

export interface ModbusLegacyRegisterValues {
  holding_registers: ModbusValues[];
  coils_initializer: ModbusValues[];
  input_registers: ModbusValues[];
  discrete_inputs: ModbusValues[];
}

export interface ModbusIdentity {
  vendorName?: string;
  productCode?: string;
  vendorUrl?: string;
  productName?: string;
  modelName?: string;
}
