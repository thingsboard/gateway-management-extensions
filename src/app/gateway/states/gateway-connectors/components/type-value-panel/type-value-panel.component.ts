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

import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormArray,
  UntypedFormBuilder,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MappingDataKey } from '../../models/public-api';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ValueType } from '../../../../shared/models/public-api';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import { TypeValueFieldComponent } from '../type-value-field/type-value-field.component';

@Component({
  selector: 'tb-type-value-panel',
  templateUrl: './type-value-panel.component.html',
  styleUrls: ['./type-value-panel.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeValuePanelComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TypeValuePanelComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TypeValueFieldComponent
  ]
})
export class TypeValuePanelComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {

  @Input() helpLink: string;

  valueListFormArray: UntypedFormArray;

  private destroy$ = new Subject<void>();
  private onChange = (_: { typeValue: ValueType }) => {};

  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.valueListFormArray = this.fb.array([]);
    this.valueListFormArray.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      this.onChange(value.map(({ typeValue }) => ({...typeValue})));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByKey(_: number, keyControl: AbstractControl): any {
    return keyControl;
  }

  addKey(): void {
    const dataKeyFormGroup = this.fb.group({
      typeValue: [],
    });
    this.valueListFormArray.push(dataKeyFormGroup);
  }

  deleteKey($event: Event, index: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.valueListFormArray.removeAt(index);
    this.valueListFormArray.markAsDirty();
  }

  registerOnChange(fn: (_: { typeValue: ValueType }) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {}

  writeValue(deviceInfoArray: Array<MappingDataKey>): void {
    for (const deviceInfo of deviceInfoArray) {
      const config = {
        typeValue: [deviceInfo],
      };

      const dataKeyFormGroup = this.fb.group(config);
      this.valueListFormArray.push(dataKeyFormGroup);
    }
  }

  validate(): ValidationErrors | null {
    return this.valueListFormArray.valid ? null : {
      valueListForm: { valid: false }
    };
  }
}
