///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  LegacySlaveConfig,
  ModbusBasicConfig,
  ModbusLegacyBasicConfig,
  ModbusLegacySlave,
  ModbusMasterConfig,
  ModbusSlave,
  ModbusVersionMappingUtil,
  EllipsisChipListDirective,
} from '../../../../../shared/public-api';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import { ModbusSlaveConfigComponent } from '../modbus-slave-config/modbus-slave-config.component';
import { ModbusMasterTableComponent } from '../modbus-master-table/modbus-master-table.component';
import {
  ModbusBasicConfigDirective
} from './modbus-basic-config.abstract';

@Component({
  selector: 'tb-modbus-legacy-basic-config',
  templateUrl: './modbus-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModbusLegacyBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ModbusLegacyBasicConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ModbusSlaveConfigComponent,
    ModbusMasterTableComponent,
    EllipsisChipListDirective,
  ],
  styleUrls: ['./modbus-basic-config.component.scss'],
})
export class ModbusLegacyBasicConfigComponent extends ModbusBasicConfigDirective<ModbusBasicConfig, ModbusLegacyBasicConfig> {

  isLegacy = true;

  protected override mapConfigToFormValue(config: ModbusLegacyBasicConfig): ModbusBasicConfig {
    return {
      master: config.master?.slaves ? config.master : { slaves: [] } as ModbusMasterConfig<LegacySlaveConfig>,
      slave: config.slave ? ModbusVersionMappingUtil.mapSlaveToUpgradedVersion(config.slave as ModbusLegacySlave) : {},
    } as ModbusBasicConfig;
  }

  protected override getMappedValue(value: ModbusBasicConfig): ModbusLegacyBasicConfig {
    return {
      master: value.master as ModbusMasterConfig<LegacySlaveConfig>,
      slave: value.slave ? ModbusVersionMappingUtil.mapSlaveToDowngradedVersion(value.slave as ModbusSlave) : {} as ModbusLegacySlave,
    };
  }
}
