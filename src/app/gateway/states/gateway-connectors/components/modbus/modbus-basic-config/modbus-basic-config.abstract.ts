///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Directive } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { isEqual } from '@core/public-api';
import {
  GatewayConnectorBasicConfigDirective,
  ModbusBasicConfig,
} from '../../../../../shared/public-api';

@Directive()
export abstract class ModbusBasicConfigDirective<InputBasicConfig, OutputBasicConfig>
  extends GatewayConnectorBasicConfigDirective<InputBasicConfig, OutputBasicConfig> {

  enableSlaveControl: FormControl<boolean> = new FormControl(false);

  constructor() {
    super();

    this.enableSlaveControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(enable => {
        this.updateSlaveEnabling(enable);
        this.basicFormGroup.get('slave').updateValueAndValidity({ emitEvent: !!this.onChange });
      });
  }

  override writeValue(basicConfig: OutputBasicConfig & ModbusBasicConfig): void {
    super.writeValue(basicConfig);
    this.onEnableSlaveControl(basicConfig);
  }

  override validate(): ValidationErrors | null {
    const { master, slave } = this.basicFormGroup.value;
    const isEmpty = !master?.slaves?.length && (isEqual(slave, {}) || !slave);
    if (!this.basicFormGroup.valid || isEmpty) {
      return { basicFormGroup: { valid: false } };
    }
    return null;
  }

  protected override initBasicFormGroup(): FormGroup {
    return this.fb.group({
      master: [],
      slave: [],
    });
  }

  private updateSlaveEnabling(isEnabled: boolean): void {
    if (isEnabled) {
      this.basicFormGroup.get('slave').enable({ emitEvent: false });
    } else {
      this.basicFormGroup.get('slave').disable({ emitEvent: false });
    }
  }

  private onEnableSlaveControl(basicConfig: ModbusBasicConfig): void {
    this.enableSlaveControl.setValue(!!basicConfig.slave && !isEqual(basicConfig.slave, {}));
  }
}
