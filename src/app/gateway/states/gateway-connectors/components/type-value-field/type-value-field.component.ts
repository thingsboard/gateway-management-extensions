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

import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import {
  integerRegex,
  mappingValueTypesMap,
  MappingValueType,
  noLeadTrailSpacesRegex,
  ValueType
} from '../../../../shared/models/public-api';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { coerceBoolean, SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tb-type-value-field',
  templateUrl: './type-value-field.component.html',
  styleUrls: ['./type-value-field.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeValueFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TypeValueFieldComponent),
      multi: true
    }
  ],
  imports: [
    SharedModule,
    CommonModule,
  ]
})
export class TypeValueFieldComponent implements ControlValueAccessor, Validator, OnDestroy {

  @Input() @coerceBoolean() rawData: boolean;
  @Input() helpLink: string;

  valueTypeKeys: MappingValueType[] = Object.values(MappingValueType) as MappingValueType[];
  valueTypeFormGroup: UntypedFormGroup;
  valueTypes = mappingValueTypesMap;
  readonly MappingValueType = MappingValueType;

  private destroy$ = new Subject<void>();
  private onChange = (_: ValueType) => {};

  constructor(private fb: UntypedFormBuilder) {
    this.valueTypeFormGroup = this.fb.group({
      type: [MappingValueType.STRING],
      stringValue: [{ value: '', disabled: this.rawData }, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      integerValue: [{ value: 0, disabled: true }, [Validators.required, Validators.pattern(integerRegex)]],
      doubleValue: [{ value: 0, disabled: true }, [Validators.required]],
      booleanValue: [{ value: false, disabled: true }, [Validators.required]],
      rawValue: [{ value: '', disabled: !this.rawData }, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    });
    this.valueTypeFormGroup.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(({ type, ...config }) => {
      this.onChange({ type, value: config[type + 'Value'] });
    });
    this.observeTypeChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private observeTypeChange(): void {
    this.valueTypeFormGroup.get('type').valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => this.toggleTypeInputs(type));
  }

  private toggleTypeInputs(type: MappingValueType | 'raw'): void {
    this.valueTypeFormGroup.disable({emitEvent: false});
    this.valueTypeFormGroup.get('type').enable({emitEvent: false});
    this.valueTypeFormGroup.get(type + 'Value').enable({emitEvent: false});
  }

  registerOnChange(fn: (v: ValueType) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => {}): void {}

  writeValue(valueTypeIn: ValueType): void {
    const valueType = this.getValueType(valueTypeIn?.value);
    const config = {
      stringValue: '',
      rawValue: '',
      integerValue: 0,
      doubleValue: 0,
      booleanValue: false,
      type: valueType,
    };
    config[valueType + 'Value'] = valueTypeIn?.value;
    this.toggleTypeInputs(valueType);

    this.valueTypeFormGroup.patchValue(config, {emitEvent: false})
  }

  validate(): ValidationErrors | null {
    return this.valueTypeFormGroup.valid ? null : {
      valueTypeFormGroup: { valid: false }
    };
  }

  private getValueType(arg: unknown): MappingValueType | 'raw' {
    if (this.rawData) {
      return 'raw';
    }
    switch (typeof arg) {
      case 'boolean':
        return MappingValueType.BOOLEAN;
      case 'number':
        return Number.isInteger(arg) ? MappingValueType.INTEGER : MappingValueType.DOUBLE;
      default:
        return MappingValueType.STRING;
    }
  }
}
