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

import { DestroyRef, Directive, inject } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive()
export abstract class ControlValueAccessorBaseAbstract<InputFormValueType, OutputFormValueType = InputFormValueType> implements ControlValueAccessor, Validator {

  form: AbstractControl;

  protected onChange!: (value: OutputFormValueType) => void;
  protected fb = inject(FormBuilder);
  protected destroyRef = inject(DestroyRef);

  constructor() {
    this.form = this.initFormGroup();

    this.observeValueChanges();
  }

  registerOnChange(fn: (value: OutputFormValueType) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {}

  validate(): ValidationErrors | null {
    return this.form.valid ? null : {
      form: { valid: false }
    };
  }

  writeValue(value: OutputFormValueType): void {
    this.onWriteValue(value);
  }

  protected onWriteValue(value: OutputFormValueType): void {
    this.form.patchValue(value, { emitEvent: false });
  }

  protected mapOnChangeValue(value: unknown): OutputFormValueType {
    return value as OutputFormValueType;
  }

  protected observeValueChanges(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => this.onChange(this.mapOnChangeValue(value)));
  }

  protected abstract initFormGroup(): AbstractControl;
}
