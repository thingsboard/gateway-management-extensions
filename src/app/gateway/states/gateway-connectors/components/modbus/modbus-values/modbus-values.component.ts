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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  forwardRef,
  Input,
  OnInit,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import {
  ModbusKeysAddKeyTranslationsMap,
  ModbusKeysDeleteKeyTranslationsMap,
  ModbusKeysNoKeysTextTranslationsMap,
  ModbusKeysPanelTitleTranslationsMap,
  ModbusRegisterTranslationsMap,
  ModbusRegisterType,
  ModbusRegisterValues,
  ModbusValue,
  ModbusValueKey,
  ModbusValues,
  ModbusValuesState,
} from '../../../models/public-api';
import { EllipsisChipListDirective } from '../../../../../shared/directives/public-api';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { TbPopoverService } from '@shared/components/popover.service';
import { ModbusDataKeysPanelComponent } from '../modbus-data-keys-panel/modbus-data-keys-panel.component';
import { coerceBoolean, SharedModule } from '@shared/public-api';
import { TbPopoverComponent } from '@shared/components/popover.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'tb-modbus-values',
  templateUrl: './modbus-values.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModbusValuesComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ModbusValuesComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
  ],
  styleUrls: ['./modbus-values.component.scss']
})

export class ModbusValuesComponent implements ControlValueAccessor, Validator, OnInit {

  @coerceBoolean()
  @Input() singleMode = false;

  @coerceBoolean()
  @Input() hideNewFields = false;

  disabled = false;
  modbusRegisterTypes: ModbusRegisterType[] = Object.values(ModbusRegisterType) as ModbusRegisterType[];
  modbusValueKeys = Object.values(ModbusValueKey);
  ModbusValuesTranslationsMap = ModbusRegisterTranslationsMap;
  ModbusValueKey = ModbusValueKey;
  valuesFormGroup: FormGroup;

  private onChange: (value: ModbusValuesState) => void;
  private onTouched: () => void;

  private popoverComponent: TbPopoverComponent<ModbusDataKeysPanelComponent>;

  constructor(private fb: FormBuilder,
              private popoverService: TbPopoverService,
              private renderer: Renderer2,
              private viewContainerRef: ViewContainerRef,
              private cdr: ChangeDetectorRef,
              private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.initializeValuesFormGroup();
    this.observeValuesChanges();
  }

  registerOnChange(fn: (value: ModbusValuesState) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(values: ModbusValuesState): void {
    if (this.singleMode) {
      this.valuesFormGroup.setValue(this.getSingleRegisterState(values as ModbusValues), { emitEvent: false });
    } else {
      const { holding_registers, coils_initializer, input_registers, discrete_inputs } = values as ModbusRegisterValues;
      this.valuesFormGroup.setValue({
        holding_registers: this.getSingleRegisterState(holding_registers),
        coils_initializer: this.getSingleRegisterState(coils_initializer),
        input_registers: this.getSingleRegisterState(input_registers),
        discrete_inputs: this.getSingleRegisterState(discrete_inputs),
      }, { emitEvent: false });
    }
    this.cdr.markForCheck();
  }

  validate(): ValidationErrors | null {
    return this.valuesFormGroup.valid ? null : {
      valuesFormGroup: {valid: false}
    };
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  getValueGroup(valueKey: ModbusValueKey, register?: ModbusRegisterType): FormGroup {
    return register
      ? this.valuesFormGroup.get(register).get(valueKey) as FormGroup
      : this.valuesFormGroup.get(valueKey) as FormGroup;
  }

  manageKeys($event: Event, matButton: MatButton, keysType: ModbusValueKey, register?: ModbusRegisterType): void {
    $event?.stopPropagation();
    if (this.popoverComponent && !this.popoverComponent.tbHidden) {
      this.popoverComponent.hide();
    }
    const trigger = matButton._elementRef.nativeElement;
    if (this.popoverService.hasPopover(trigger)) {
      this.popoverService.hidePopover(trigger);
      return;
    }

    const keysControl = this.getValueGroup(keysType, register);
    const ctx = {
      values: keysControl.value,
      isMaster: !this.singleMode,
      keysType,
      panelTitle: ModbusKeysPanelTitleTranslationsMap.get(keysType),
      addKeyTitle: ModbusKeysAddKeyTranslationsMap.get(keysType),
      deleteKeyTitle: ModbusKeysDeleteKeyTranslationsMap.get(keysType),
      noKeysText: ModbusKeysNoKeysTextTranslationsMap.get(keysType),
      hideNewFields: this.hideNewFields,
    };
    this.popoverComponent = this.popoverService.displayPopover(
      trigger,
      this.renderer,
      this.viewContainerRef,
      ModbusDataKeysPanelComponent,
      'leftBottom',
      false,
      null,
      ctx,
      {},
      {},
      {},
      true
    );
    this.popoverComponent.tbComponentRef.instance.keysDataApplied.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((keysData: ModbusValue[]) => {
      this.popoverComponent.hide();
      keysControl.patchValue(keysData);
      keysControl.markAsDirty();
      this.cdr.markForCheck();
    });
  }

  private initializeValuesFormGroup(): void {
    const getValuesFormGroup = () => this.fb.group(this.modbusValueKeys.reduce((acc, key) => {
      acc[key] = this.fb.control([[], []]);
      return acc;
    }, {}));

    if (this.singleMode) {
      this.valuesFormGroup = getValuesFormGroup();
    } else {
      this.valuesFormGroup = this.fb.group(
        this.modbusRegisterTypes.reduce((registersAcc, register) => {
          registersAcc[register] = getValuesFormGroup();
          return registersAcc;
        }, {})
      );
    }
  }


  private observeValuesChanges(): void {
    this.valuesFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onChange(value);
        this.onTouched();
      });
  }

  private getSingleRegisterState(values: ModbusValues): ModbusValues {
    return {
      attributes: values?.attributes ?? [],
      timeseries: values?.timeseries ?? [],
      attributeUpdates: values?.attributeUpdates ?? [],
      rpc: values?.rpc ?? [],
    };
  }
}
