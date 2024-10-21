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
export enum ModbusDataType {
  STRING = 'string',
  BYTES = 'bytes',
  BITS = 'bits',
  INT8 = '8int',
  UINT8 = '8uint',
  FLOAT8 = '8float',
  INT16 = '16int',
  UINT16 = '16uint',
  FLOAT16 = '16float',
  INT32 = '32int',
  UINT32 = '32uint',
  FLOAT32 = '32float',
  INT64 = '64int',
  UINT64 = '64uint',
  FLOAT64 = '64float'
}

export const ModbusEditableDataTypes = [ModbusDataType.BYTES, ModbusDataType.BITS, ModbusDataType.STRING];

export enum ModbusObjectCountByDataType {
  '8int' = 1,
  '8uint' = 1,
  '8float' = 1,
  '16int' = 1,
  '16uint' = 1,
  '16float' = 1,
  '32int' = 2,
  '32uint' = 2,
  '32float' = 2,
  '64int' = 4,
  '64uint' = 4,
  '64float' = 4,
}
