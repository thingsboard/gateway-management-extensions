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

import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  FormBuilder,
} from '@angular/forms';
import {
  TruncateWithTooltipDirective
} from '../../../../../shared/directives/public-api';
import {
  ModbusProtocolType,
  ModbusSlaveInfo,
  SlaveConfig,
} from '../../../models/public-api';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { ModbusValuesComponent } from '../modbus-values/modbus-values.component';
import { ModbusSecurityConfigComponent } from '../modbus-security-config/modbus-security-config.component';
import { Store } from '@ngrx/store';
import { AppState, deleteNullProperties } from '@core/public-api';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ReportStrategyComponent
} from '../../../../../shared/components/public-api';
import {
  ModbusSlaveDialogAbstract
} from './modbus-slave-dialog.abstract';
import { GatewayPortTooltipPipe } from '../../../pipes/public-api';

@Component({
  selector: 'tb-modbus-slave-dialog',
  templateUrl: './modbus-slave-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ModbusValuesComponent,
    ModbusSecurityConfigComponent,
    GatewayPortTooltipPipe,
    ReportStrategyComponent,
    TruncateWithTooltipDirective,
  ],
  styleUrls: ['./modbus-slave-dialog.component.scss'],
})
export class ModbusSlaveDialogComponent extends ModbusSlaveDialogAbstract<ModbusSlaveDialogComponent, SlaveConfig> {

  constructor(
    protected fb: FormBuilder,
    protected store: Store<AppState>,
    protected router: Router,
    @Inject(MAT_DIALOG_DATA) public data: ModbusSlaveInfo,
    public dialogRef: MatDialogRef<ModbusSlaveDialogComponent, SlaveConfig>,
  ) {
    super(fb, store, router, data, dialogRef);
  }

  protected override getSlaveResultData(): SlaveConfig {
    const { values, type, serialPort, ...rest } = this.slaveConfigFormGroup.value;
    const slaveResult = { ...rest, type, ...values };

    if (type === ModbusProtocolType.Serial) {
      slaveResult.port = serialPort;
    }

    if (!slaveResult.reportStrategy) {
      delete slaveResult.reportStrategy;
    }

    deleteNullProperties(slaveResult);
    return slaveResult;
  }

  protected override addFieldsToFormGroup(): void {
    this.slaveConfigFormGroup.addControl('reportStrategy', this.fb.control(null));
  }
}
