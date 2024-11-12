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
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeviceCredentials, DeviceCredentialsType, EntityId, SharedModule } from '@shared/public-api';
import {
  GatewayConfigSecurity,
  SecurityTypes, SecurityTypesTranslationsMap,
} from '../../../models/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DeviceService } from '@core/public-api';

@Component({
  selector: 'tb-gateway-security-configuration',
  templateUrl: './gateway-security-configuration.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GatewaySecurityConfigurationComponent),
    multi: true
  }],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class GatewaySecurityConfigurationComponent implements ControlValueAccessor {

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
    this.securityFormGroup = this.initSecurityFormGroup();
    this.securityFormGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      this.onChange(value);
    });
    this.observeSecurityPasswordChanges();
    this.observeSecurityTypeChanges();
  }

  writeValue(value: GatewayConfigSecurity): void {
    this.checkAndFetchCredentials(value ?? {} as GatewayConfigSecurity);
    this.securityFormGroup.patchValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (config: GatewayConfigSecurity) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => {}): void {}

  private initSecurityFormGroup(): FormGroup {
    return this.fb.group({
      type: [SecurityTypes.ACCESS_TOKEN, [Validators.required]],
      accessToken: [null, [Validators.required, Validators.pattern(/^[^.\s]+$/)]],
      clientId: [null, [Validators.pattern(/^[^.\s]+$/)]],
      username: [null, [Validators.pattern(/^[^.\s]+$/)]],
      password: [null, [Validators.pattern(/^[^.\s]+$/)]],
      caCert: [null],
      cert: [null],
      privateKey: [null]
    });
  }

  private observeSecurityPasswordChanges(): void {
    const securityUsername = this.securityFormGroup.get('username');
    this.securityFormGroup.get('password').valueChanges.pipe(takeUntilDestroyed()).subscribe(password => {
      if (password && password !== '') {
        securityUsername.setValidators([Validators.required]);
      } else {
        securityUsername.clearValidators();
      }
      securityUsername.updateValueAndValidity({ emitEvent: false });
    });
  }

  private observeSecurityTypeChanges(): void {
    const securityGroup = this.securityFormGroup as FormGroup;

    securityGroup.get('type').valueChanges.pipe(takeUntilDestroyed()).subscribe(type => {
      this.removeAllSecurityValidators();

      switch (type) {
        case SecurityTypes.ACCESS_TOKEN:
          this.addAccessTokenValidators(securityGroup);
          break;
        case SecurityTypes.TLS_PRIVATE_KEY:
          this.addTlsPrivateKeyValidators(securityGroup);
          break;
        case SecurityTypes.TLS_ACCESS_TOKEN:
          this.addTlsAccessTokenValidators(securityGroup);
          break;
        case SecurityTypes.USERNAME_PASSWORD:
          securityGroup.addValidators([this.atLeastOneRequired(Validators.required, ['clientId', 'username'])]);
          break;
      }

      securityGroup.updateValueAndValidity();
    });

    ['caCert', 'privateKey', 'cert'].forEach(field => {
      securityGroup.get(field).valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.cd.detectChanges());
    });
  }

  private addTlsPrivateKeyValidators(group: FormGroup): void {
    ['caCert', 'privateKey', 'cert'].forEach(field => {
      group.get(field).addValidators([Validators.required]);
      group.get(field).updateValueAndValidity();
    });
  }

  private addTlsAccessTokenValidators(group: FormGroup): void {
    this.addAccessTokenValidators(group);
    group.get('caCert').addValidators([Validators.required]);
    group.get('caCert').updateValueAndValidity();
  }

  private addAccessTokenValidators(group: FormGroup): void {
    group.get('accessToken').addValidators([Validators.required, Validators.pattern(/^[^.\s]+$/)]);
    group.get('accessToken').updateValueAndValidity();
  }

  private removeAllSecurityValidators(): void {
    const securityGroup = this.securityFormGroup as FormGroup;
    securityGroup.clearValidators();
    for (const controlsKey in securityGroup.controls) {
      if (controlsKey !== 'type') {
        securityGroup.controls[controlsKey].clearValidators();
        securityGroup.controls[controlsKey].setErrors(null);
        securityGroup.controls[controlsKey].updateValueAndValidity();
      }
    }
  }

  private atLeastOneRequired(validator: ValidatorFn, controls: string[] = null) {
    return (group: FormGroup): ValidationErrors | null => {
      if (!controls) {
        controls = Object.keys(group.controls);
      }
      const hasAtLeastOne = group?.controls && controls.some(k => !validator(group.controls[k]));

      return hasAtLeastOne ? null : {atLeastOne: true};
    };
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
    const isAccessToken = credentials.credentialsType === DeviceCredentialsType.ACCESS_TOKEN
      || security.type === SecurityTypes.TLS_ACCESS_TOKEN;
    const securityType = isAccessToken
      ? (security.type === SecurityTypes.TLS_ACCESS_TOKEN ? SecurityTypes.TLS_ACCESS_TOKEN : SecurityTypes.ACCESS_TOKEN)
      : (credentials.credentialsType === DeviceCredentialsType.MQTT_BASIC ? SecurityTypes.USERNAME_PASSWORD : null);

    if (securityType) {
      this.securityFormGroup.get('type').setValue(securityType, { emitEvent: false });
    }
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
    this.securityFormGroup.get('clientId').setValue(parsedValue.clientId, { emitEvent: false });
    this.securityFormGroup.get('username').setValue(parsedValue.userName, { emitEvent: false });
    this.securityFormGroup.get('password').setValue(parsedValue.password, { emitEvent: false });
  }
}
