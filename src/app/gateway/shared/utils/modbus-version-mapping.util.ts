///
/// Copyright © 2024 ThingsBoard, Inc.
///

import {
  LegacySlaveConfig,
  ModbusDataType,
  ModbusLegacyRegisterValues,
  ModbusLegacySlave,
  ModbusMasterConfig,
  ModbusRegisterValues,
  ModbusSlave,
  ModbusValue,
  ModbusValues,
  ReportStrategyType,
  SlaveConfig
} from '../../shared/public-api';

export class ModbusVersionMappingUtil {

  static mapMasterToUpgradedVersion(master: ModbusMasterConfig<LegacySlaveConfig>): ModbusMasterConfig {
    return {
      slaves: master.slaves.map((slave: LegacySlaveConfig) => {
        const { sendDataOnlyOnChange, ...restSlave } = slave;
        return {
          ...restSlave,
          deviceType: slave.deviceType ?? 'default',
          reportStrategy: sendDataOnlyOnChange
            ? { type: ReportStrategyType.OnChange }
            : { type: ReportStrategyType.OnReportPeriod, reportPeriod: slave.pollPeriod }
        };
      })
    };
  }

  static mapMasterToDowngradedVersion(master: ModbusMasterConfig): ModbusMasterConfig<LegacySlaveConfig> {
    return {
      slaves: master.slaves.map((slave: SlaveConfig) => {
        const { reportStrategy, ...restSlave } = slave;
        return {
          ...restSlave,
          sendDataOnlyOnChange: reportStrategy?.type !== ReportStrategyType.OnReportPeriod
        };
      })
    };
  }

  static mapSlaveToDowngradedVersion(slave: ModbusSlave): ModbusLegacySlave {
    if (!slave?.values) {
      return slave as Omit<ModbusLegacySlave, 'values'>;
    }
    const values = Object.keys(slave.values).reduce((acc, valueKey) => {
      acc = {
        ...acc,
        [valueKey]: [
          slave.values[valueKey]
        ]
      };
      return acc;
    }, {} as ModbusLegacyRegisterValues);
    return {
      ...slave,
      values
    };
  }

  static mapSlaveToUpgradedVersion(slave: ModbusLegacySlave): ModbusSlave {
    if (!slave?.values) {
      return slave as Omit<ModbusSlave, 'values'>;
    }
    const values = Object.keys(slave.values).reduce((acc, valueKey) => {
      acc = {
        ...acc,
        [valueKey]: this.mapValuesToUpgradedVersion(slave.values[valueKey][0])
      };
      return acc;
    }, {} as ModbusRegisterValues);
    return {
      ...slave,
      values
    };
  }

  private static mapValuesToUpgradedVersion(registerValues: ModbusValues): ModbusValues {
    return Object.keys(registerValues).reduce((acc, valueKey) => {
      acc = {
       ...acc,
        [valueKey]: registerValues[valueKey].map((value: ModbusValue) =>
          ({ ...value, type: (value.type as string) === 'int' ? ModbusDataType.INT16 : value.type }))
      };
      return acc;
    }, {} as ModbusValues);
  }
}
