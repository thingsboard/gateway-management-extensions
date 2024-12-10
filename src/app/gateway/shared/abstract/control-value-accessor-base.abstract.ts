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

import { DestroyRef, Directive, inject } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive()
export abstract class ControlValueAccessorBaseAbstract<FormValueType> implements ControlValueAccessor, Validator {

  formGroup: FormGroup;

  protected onChange!: (value: FormValueType) => void;
  protected fb = inject(FormBuilder);
  protected destroyRef = inject(DestroyRef);

  constructor() {
    this.formGroup = this.initFormGroup();

    this.observeValueChanges();
  }

  registerOnChange(fn: (value: FormValueType) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {}

  validate(): ValidationErrors | null {
    return this.formGroup.valid ? null : {
      formGroup: { valid: false }
    };
  }

  writeValue(value: FormValueType): void {
    this.onWriteValue(value);
  }

  protected onWriteValue(value: FormValueType): void {
    this.formGroup.patchValue(value, { emitEvent: false });
  }

  protected mapOnChangeValue(value: unknown): FormValueType {
    return value as FormValueType;
  }

  protected observeValueChanges(): void {
    this.formGroup.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => this.onChange(this.mapOnChangeValue(value)));
  }

  protected abstract initFormGroup(): FormGroup;
}
