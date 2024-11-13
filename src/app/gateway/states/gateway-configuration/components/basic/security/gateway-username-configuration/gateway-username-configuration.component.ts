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
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeviceCredentials, EntityId, SharedModule } from '@shared/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GatewayUsernamePasswordConfig } from '../../../../models/public-api';

@Component({
  selector: 'tb-gateway-username-configuration',
  templateUrl: './gateway-username-configuration.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GatewayUsernameConfigurationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GatewayUsernameConfigurationComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class GatewayUsernameConfigurationComponent implements ControlValueAccessor, Validators {

  @Input() device: EntityId;
  @Output() initialCredentialsUpdated = new EventEmitter<DeviceCredentials>();

  usernameFormGroup: FormGroup;

  private disabled = false;
  private onChange: (value: GatewayUsernamePasswordConfig) => void = () => {};

  constructor(
    private fb: FormBuilder,
  ) {
    this.initForm();
    this.usernameFormGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => this.onChange(value))
  }

  writeValue(value: GatewayUsernamePasswordConfig): void {
    this.usernameFormGroup.patchValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (config: GatewayUsernamePasswordConfig) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => {}): void {}

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(): ValidationErrors | null {
    const baseNotValid = !this.usernameFormGroup.valid;
    const atLeastOneRequired = !this.usernameFormGroup.get('username').value && !this.usernameFormGroup.get('clientId').value;
    const usernameRequired = !this.usernameFormGroup.get('username').value && this.usernameFormGroup.get('password').value;

    return baseNotValid || atLeastOneRequired || usernameRequired && !this.disabled ? { usernameFormGroup: false } : null;
  }

  private initForm(): void {
    this.usernameFormGroup = this.createSecurityFormGroup();
  }

  private createSecurityFormGroup(): FormGroup {
    return this.fb.group({
      clientId: [null, [Validators.pattern(/^[^.\s]+$/)]],
      username: [null, [Validators.pattern(/^[^.\s]+$/)]],
      password: [null, [Validators.pattern(/^[^.\s]+$/)]],
    });
  }
}
