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
import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, forwardRef, Input, Output } from '@angular/core';
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
import { DeviceCredentials, DeviceCredentialsType, EntityId, SharedModule } from '@shared/public-api';
import {
  GatewayConfigSecurity,
  SecurityTypes,
  SecurityTypesTranslationsMap,
} from '../../../models/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DeviceService } from '@core/public-api';
import { GatewayUsernameConfigurationComponent } from './gateway-username-configuration/gateway-username-configuration.component';

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
export class GatewaySecurityConfigurationComponent implements ControlValueAccessor, Validators {

  @Input() device: EntityId;
  @Output() initialCredentialsUpdated = new EventEmitter<DeviceCredentials>();

  securityFormGroup: FormGroup;

  readonly securityTypes = SecurityTypesTranslationsMap;

  private onChange: (value: GatewayConfigSecurity) => void = () => {};

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private deviceService: DeviceService,
    private destroyRef: DestroyRef,
  ) {
    this.securityFormGroup = this.createSecurityFormGroup();
    this.setupFormListeners();
  }

  writeValue(value: GatewayConfigSecurity): void {
    this.checkAndFetchCredentials(value ?? {} as GatewayConfigSecurity);
    this.securityFormGroup.patchValue(value, { emitEvent: false });
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

  private createSecurityFormGroup(): FormGroup {
    return this.fb.group({
      type: [SecurityTypes.ACCESS_TOKEN, [Validators.required]],
      accessToken: [null, [Validators.required, Validators.pattern(/^[^.\s]+$/)]],
      caCert: [null, [Validators.required]],
      usernamePassword: [],
    });
  }

  private setupFormListeners(): void {
    this.securityFormGroup.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ usernamePassword, ...value }) => {
      if (this.securityFormGroup.get('type').value === SecurityTypes.USERNAME_PASSWORD) {
        this.onChange(usernamePassword);
      }
      this.onChange(value);
    });
    this.listenToSecurityTypeChanges();
    this.securityFormGroup.get('caCert').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cd.detectChanges());
  }

  private listenToSecurityTypeChanges(): void {
    this.securityFormGroup.get('type').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(type => {
      this.updateValidatorsBasedOnSecurityType(type);
    });
  }

  private updateValidatorsBasedOnSecurityType(type: SecurityTypes): void {
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

  private checkAndFetchCredentials(security: GatewayConfigSecurity): void {
    if (security.type === SecurityTypes.TLS_PRIVATE_KEY) {
      return;
    }

    this.deviceService.getDeviceCredentials(this.device.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(credentials => {
      this.updateSecurityType(security, credentials);
      this.updateCredentials(credentials, security);
      this.securityFormGroup.updateValueAndValidity();
      this.initialCredentialsUpdated.emit(credentials);
    });
  }

  private updateSecurityType(security: GatewayConfigSecurity, credentials: DeviceCredentials): void {
    const securityType = this.determineSecurityType(security, credentials);
    if (securityType) {
      this.securityFormGroup.get('type').setValue(securityType, { emitEvent: false });
      this.updateValidatorsBasedOnSecurityType(securityType);
    }
  }

  private determineSecurityType(security: GatewayConfigSecurity, credentials: DeviceCredentials): SecurityTypes | null {
    const isAccessToken = credentials.credentialsType === DeviceCredentialsType.ACCESS_TOKEN
      || security.type === SecurityTypes.TLS_ACCESS_TOKEN;
    if (isAccessToken) {
      return security.type === SecurityTypes.TLS_ACCESS_TOKEN ? SecurityTypes.TLS_ACCESS_TOKEN : SecurityTypes.ACCESS_TOKEN;
    }
    return credentials.credentialsType === DeviceCredentialsType.MQTT_BASIC ? SecurityTypes.USERNAME_PASSWORD : null;
  }

  private updateCredentials(credentials: DeviceCredentials, security: GatewayConfigSecurity): void {
    switch (credentials.credentialsType) {
      case DeviceCredentialsType.ACCESS_TOKEN:
        this.updateAccessTokenCredentials(credentials, security);
        break;
      case DeviceCredentialsType.MQTT_BASIC:
        this.updateMqttBasicCredentials(credentials);
        break;
      case DeviceCredentialsType.X509_CERTIFICATE:
        // Handle X509 certificate if needed
        break;
    }
  }

  private updateAccessTokenCredentials(credentials: DeviceCredentials, security: GatewayConfigSecurity): void {
    this.securityFormGroup.get('accessToken').setValue(credentials.credentialsId, { emitEvent: false });
    if (security.type === SecurityTypes.TLS_ACCESS_TOKEN) {
      this.securityFormGroup.get('caCert').setValue(security.caCert, { emitEvent: false });
    }
  }

  private updateMqttBasicCredentials(credentials: DeviceCredentials): void {
    const parsedValue = JSON.parse(credentials.credentialsValue);
    this.securityFormGroup.patchValue({
      clientId: parsedValue.clientId,
      username: parsedValue.userName,
      password: parsedValue.password
    }, { emitEvent: false });
  }
}
