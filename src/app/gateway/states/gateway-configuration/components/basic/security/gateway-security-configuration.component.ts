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
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Output
} from '@angular/core';
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
import { SharedModule } from '@shared/public-api';
import {
  GatewayConfigSecurity,
  SecurityTypes,
  SecurityTypesTranslationsMap,
} from '../../../models/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GatewayUsernameConfigurationComponent } from './gateway-username-configuration/gateway-username-configuration.component';
import { GatewayDeviceCredentialsService } from '../../../services/gateway-device-credentials.service';
import { generateSecret } from '@core/public-api';

@Component({
  selector: 'tb-gateway-security-configuration',
  templateUrl: './gateway-security-configuration.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GatewaySecurityConfigurationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GatewaySecurityConfigurationComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    GatewayUsernameConfigurationComponent,
  ]
})
export class GatewaySecurityConfigurationComponent implements AfterViewInit, ControlValueAccessor, Validators {

  @Output() initialized = new EventEmitter();

  securityFormGroup: FormGroup;

  readonly securityTypes = SecurityTypesTranslationsMap;

  private onChange: (value: GatewayConfigSecurity) => void = () => {};

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private gatewayCredentialsService: GatewayDeviceCredentialsService,
  ) {
    this.securityFormGroup = this.createSecurityFormGroup();
    this.setupFormListeners();
  }

  ngAfterViewInit(): void {
    const { usernamePassword, ...value } = this.securityFormGroup.value;
    this.initialized.emit({ thingsboard: { security: usernamePassword ? { ...value, ...usernamePassword } : value } });
  }

  writeValue(value: GatewayConfigSecurity): void {
    if (value) {
      this.updateFormBySecurityConfig(value);
    } else {
      this.updateFormBySecurityConfig(this.gatewayCredentialsService.credentialsToSecurityConfig(this.gatewayCredentialsService.initialCredentials));
    }
  }

  registerOnChange(fn: (config: GatewayConfigSecurity) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => {}): void {}

  validate(): ValidationErrors | null {
    return this.securityFormGroup.valid ? null : {
      securityFormGroup: {valid: false}
    };
  }

  private updateFormBySecurityConfig(securityConfig: GatewayConfigSecurity): void {
    const { clientId, username, password, ...security } = securityConfig ?? {} as GatewayConfigSecurity;
    if (security?.type === SecurityTypes.USERNAME_PASSWORD) {
      this.securityFormGroup.patchValue({...security, usernamePassword: { clientId, username, password } }, { emitEvent: false });
    } else {
      this.securityFormGroup.patchValue(security, { emitEvent: false });
    }
    this.toggleBySecurityType(this.securityFormGroup.get('type').value);
  }

  private createSecurityFormGroup(): FormGroup {
    return this.fb.group({
      type: [SecurityTypes.ACCESS_TOKEN, [Validators.required]],
      accessToken: [null, [Validators.required, Validators.pattern(/^[^.\s]+$/)]],
      caCert: [null, [Validators.required]],
      usernamePassword: [],
    });
  }

  private setupFormListeners(): void {
    this.securityFormGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(({ usernamePassword, ...value }) => {
      this.onChange(usernamePassword ? { ...value, ...usernamePassword } : value);
    });
    this.securityFormGroup.get('type').valueChanges.pipe(takeUntilDestroyed()).subscribe(type => {
      this.toggleBySecurityType(type);
    });
    this.securityFormGroup.get('caCert').valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.cd.detectChanges());
  }

  private toggleBySecurityType(type: SecurityTypes): void {
    this.securityFormGroup.disable({ emitEvent: false });
    this.securityFormGroup.get('type').enable({ emitEvent: false });
    switch (type) {
      case SecurityTypes.ACCESS_TOKEN:
        this.securityFormGroup.get('accessToken').enable({ emitEvent: false });
        break;
      case SecurityTypes.TLS_PRIVATE_KEY:
        this.securityFormGroup.get('caCert').enable({ emitEvent: false });
        break;
      case SecurityTypes.TLS_ACCESS_TOKEN:
        this.securityFormGroup.get('accessToken').enable({ emitEvent: false });
        this.securityFormGroup.get('caCert').enable({ emitEvent: false });
        break;
      case SecurityTypes.USERNAME_PASSWORD:
        this.securityFormGroup.get('usernamePassword').enable({ emitEvent: false });
        break;
    }
  }

  public generateAccessToken(): void{
    this.securityFormGroup.get('accessToken').patchValue(generateSecret(20));
  }
}
