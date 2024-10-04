///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ModbusBasicConfig_v3_5_2,
  ModbusMasterConfig,
  ModbusSlave,
  EllipsisChipListDirective
} from '../../../../../shared/public-api';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import { ModbusSlaveConfigComponent } from '../modbus-slave-config/modbus-slave-config.component';
import { ModbusMasterTableComponent } from '../modbus-master-table/modbus-master-table.component';
import {
  ModbusBasicConfigDirective
} from './modbus-basic-config.abstract';

@Component({
  selector: 'tb-modbus-basic-config',
  templateUrl: './modbus-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModbusBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ModbusBasicConfigComponent),
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
export class ModbusBasicConfigComponent extends ModbusBasicConfigDirective<ModbusBasicConfig_v3_5_2, ModbusBasicConfig_v3_5_2> {

  isLegacy = false;

  protected override mapConfigToFormValue({ master, slave }: ModbusBasicConfig_v3_5_2): ModbusBasicConfig_v3_5_2 {
    return {
      master: master?.slaves ? master : { slaves: [] } as ModbusMasterConfig,
      slave: slave ?? {} as ModbusSlave,
    };
  }

  protected override getMappedValue(value: ModbusBasicConfig_v3_5_2): ModbusBasicConfig_v3_5_2 {
    return {
      master: value.master,
      slave: value.slave,
    };
  }
}
