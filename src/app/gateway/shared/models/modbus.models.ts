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
