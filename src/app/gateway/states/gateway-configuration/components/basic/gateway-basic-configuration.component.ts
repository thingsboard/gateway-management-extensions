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
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { coerceBoolean, DeviceCredentials, DeviceCredentialsType, EntityId, SharedModule } from '@shared/public-api';
import { MatDialog } from '@angular/material/dialog';
import {
  GatewayRemoteConfigurationDialogComponent,
  GatewayRemoteConfigurationDialogData
} from '../../../gateway-remote-shell/public-api';
import { DeviceService } from '@core/public-api';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import {
  ReportStrategyComponent,
  ReportStrategyDefaultValue,
  ReportStrategyType
} from '../../../../shared/public-api';
import { CommonModule } from '@angular/common';
import {
  GatewayBasicConfigTab,
  GatewayBasicConfigTabKey,
  GatewayConfigCommand,
  GatewayConfigSecurity,
  GatewayConfigValue,
  numberInputPattern,
  SecurityTypes,
  SecurityTypesTranslationsMap,
} from '../../models/public-api';
import { MatTabGroup } from '@angular/material/tabs';
import { GatewayStorageConfigurationComponent } from './storage/gateway-storage-configuration.component';
import { GatewayGrpcConfigurationComponent } from './grpc/gateway-grpc-configuration.component';
import { GatewayLogsConfigurationComponent } from './logs/gateway-logs-configuration.component';

@Component({
  selector: 'tb-gateway-basic-configuration',
  templateUrl: './gateway-basic-configuration.component.html',
  styleUrls: ['./gateway-basic-configuration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReportStrategyComponent,
    GatewayStorageConfigurationComponent,
    GatewayGrpcConfigurationComponent,
    GatewayLogsConfigurationComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GatewayBasicConfigurationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GatewayBasicConfigurationComponent),
      multi: true
    }
  ],
})
export class GatewayBasicConfigurationComponent implements OnChanges, AfterViewInit, OnDestroy, ControlValueAccessor, Validators {

  @Input() device: EntityId;
  @Input() defaultTab: GatewayBasicConfigTabKey;
  @Input() @coerceBoolean() dialogMode = false;
  @Input() @coerceBoolean() withReportStrategy = false;

  @Output() initialCredentialsUpdated = new EventEmitter<DeviceCredentials>();

  @ViewChild('configGroup') configGroup: MatTabGroup;

  readonly securityTypes = SecurityTypesTranslationsMap;
  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;

  basicFormGroup: FormGroup;

  private onChange: (value: GatewayConfigValue) => void = () => {};

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder,
              private deviceService: DeviceService,
              private cd: ChangeDetectorRef,
              private dialog: MatDialog) {
    this.initBasicFormGroup();
    this.observeFormChanges();
    this.basicFormGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onChange(value);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.withReportStrategy && !changes.withReportStrategy.firstChange && this.withReportStrategy) {
      this.basicFormGroup.get('thingsboard.reportStrategy').enable({emitEvent: false})
    }
  }

  ngAfterViewInit(): void {
    if (this.defaultTab) {
      this.configGroup.selectedIndex = GatewayBasicConfigTab[this.defaultTab];
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerOnChange(fn: (value: GatewayConfigValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {}

  writeValue(basicConfig: GatewayConfigValue): void {
    this.basicFormGroup.patchValue(basicConfig, {emitEvent: false});
    this.checkAndFetchCredentials(basicConfig?.thingsboard?.security ?? {} as GatewayConfigSecurity);
    const commands = basicConfig?.thingsboard?.statistics?.commands ?? [];
    commands.forEach((command: GatewayConfigCommand) => this.addCommand(command, false));
  }

  validate(): ValidationErrors | null {
    return this.basicFormGroup.valid ? null : {
      basicFormGroup: {valid: false}
    };
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

  commandFormArray(): FormArray {
    return this.basicFormGroup.get('thingsboard.statistics.commands') as FormArray;
  }

  removeCommandControl(index: number, event: PointerEvent): void {
    if (event.pointerType === '') {
      return;
    }
    this.commandFormArray().removeAt(index);
    this.basicFormGroup.markAsDirty();
  }

  private removeAllSecurityValidators(): void {
    const securityGroup = this.basicFormGroup.get('thingsboard.security') as FormGroup;
    securityGroup.clearValidators();
    for (const controlsKey in securityGroup.controls) {
      if (controlsKey !== 'type') {
        securityGroup.controls[controlsKey].clearValidators();
        securityGroup.controls[controlsKey].setErrors(null);
        securityGroup.controls[controlsKey].updateValueAndValidity();
      }
    }
  }

  private openConfigurationConfirmDialog(): void {
    this.deviceService.getDevice(this.device.id).pipe(takeUntil(this.destroy$)).subscribe(gateway => {
      this.dialog.open<GatewayRemoteConfigurationDialogComponent, GatewayRemoteConfigurationDialogData>
      (GatewayRemoteConfigurationDialogComponent, {
        disableClose: true,
        panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
        data: {
          gatewayName: gateway.name
        }
      }).afterClosed().pipe(take(1)).subscribe(
        (res) => {
          if (!res) {
            this.basicFormGroup.get('thingsboard.remoteConfiguration').setValue(true, {emitEvent: false});
          }
        }
      );
    });
  }

  addCommand(command?: GatewayConfigCommand, emitEvent: boolean = true): void {
    const { attributeOnGateway = null, command: cmd = null, timeout = null } = command || {};

    const commandFormGroup = this.fb.group({
      attributeOnGateway: [attributeOnGateway, [Validators.required, Validators.pattern(/^[^.\s]+$/)]],
      command: [cmd, [Validators.required, Validators.pattern(/^(?=\S).*\S$/)]],
      timeout: [timeout, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern), Validators.pattern(/^[^.\s]+$/)]]
    });

    this.commandFormArray().push(commandFormGroup, { emitEvent });
  }

  private initBasicFormGroup(): void {
    this.basicFormGroup = this.fb.group({
      thingsboard: this.initThingsboardFormGroup(),
      storage: [],
      grpc: [],
      connectors: this.fb.array([]),
      logs: [],
    });
  }

  private initThingsboardFormGroup(): FormGroup {
    return this.fb.group({
      host: [window.location.hostname, [Validators.required, Validators.pattern(/^[^\s]+$/)]],
      port: [1883, [Validators.required, Validators.min(1), Validators.max(65535), Validators.pattern(numberInputPattern)]],
      remoteShell: [false],
      remoteConfiguration: [true],
      checkConnectorsConfigurationInSeconds: [60, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]],
      statistics: this.fb.group({
        enable: [true],
        statsSendPeriodInSeconds: [3600, [Validators.required, Validators.min(60), Validators.pattern(numberInputPattern)]],
        commands: this.fb.array([])
      }),
      maxPayloadSizeBytes: [8196, [Validators.required, Validators.min(100), Validators.pattern(numberInputPattern)]],
      minPackSendDelayMS: [50, [Validators.required, Validators.min(10), Validators.pattern(numberInputPattern)]],
      minPackSizeToSend: [500, [Validators.required, Validators.min(100), Validators.pattern(numberInputPattern)]],
      handleDeviceRenaming: [true],
      checkingDeviceActivity: this.initCheckingDeviceActivityFormGroup(),
      security: this.initSecurityFormGroup(),
      qos: [1, [Validators.required, Validators.min(0), Validators.max(1), Validators.pattern(/^[^.\s]+$/)]],
      reportStrategy: [{
        value: { type: ReportStrategyType.OnReportPeriod, reportPeriod: ReportStrategyDefaultValue.Gateway },
        disabled: true
      }],
    });
  }

  private initCheckingDeviceActivityFormGroup(): FormGroup {
    return this.fb.group({
      checkDeviceInactivity: [false],
      inactivityTimeoutSeconds: [300, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      inactivityCheckPeriodSeconds: [10, [Validators.min(1), Validators.pattern(numberInputPattern)]]
    });
  }

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

  private observeFormChanges(): void {
    this.observeSecurityPasswordChanges();
    this.observeRemoteConfigurationChanges();
    this.observeDeviceActivityChanges();
    this.observeSecurityTypeChanges();
  }

  private observeSecurityPasswordChanges(): void {
    const securityUsername = this.basicFormGroup.get('thingsboard.security.username');
    this.basicFormGroup.get('thingsboard.security.password').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(password => {
      if (password && password !== '') {
        securityUsername.setValidators([Validators.required]);
      } else {
        securityUsername.clearValidators();
      }
      securityUsername.updateValueAndValidity({ emitEvent: false });
    });
  }

  private observeRemoteConfigurationChanges(): void {
    this.basicFormGroup.get('thingsboard.remoteConfiguration').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(enabled => {
      if (!enabled) {
        this.openConfigurationConfirmDialog();
      }
    });
  }

  private observeDeviceActivityChanges(): void {
    const checkingDeviceActivityGroup = this.basicFormGroup.get('thingsboard.checkingDeviceActivity') as FormGroup;
    checkingDeviceActivityGroup.get('checkDeviceInactivity').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(enabled => {
      checkingDeviceActivityGroup.updateValueAndValidity();
      const validators = [Validators.min(1), Validators.required, Validators.pattern(numberInputPattern)];

      if (enabled) {
        checkingDeviceActivityGroup.get('inactivityTimeoutSeconds').setValidators(validators);
        checkingDeviceActivityGroup.get('inactivityCheckPeriodSeconds').setValidators(validators);
      } else {
        checkingDeviceActivityGroup.get('inactivityTimeoutSeconds').clearValidators();
        checkingDeviceActivityGroup.get('inactivityCheckPeriodSeconds').clearValidators();
      }
      checkingDeviceActivityGroup.get('inactivityTimeoutSeconds').updateValueAndValidity({ emitEvent: false });
      checkingDeviceActivityGroup.get('inactivityCheckPeriodSeconds').updateValueAndValidity({ emitEvent: false });
    });
  }

  private observeSecurityTypeChanges(): void {
    const securityGroup = this.basicFormGroup.get('thingsboard.security') as FormGroup;

    securityGroup.get('type').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(type => {
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
      securityGroup.get(field).valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.cd.detectChanges());
    });
  }

  private addAccessTokenValidators(group: FormGroup): void {
    group.get('accessToken').addValidators([Validators.required, Validators.pattern(/^[^.\s]+$/)]);
    group.get('accessToken').updateValueAndValidity();
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

  private checkAndFetchCredentials(security: GatewayConfigSecurity): void {
    if (security.type === SecurityTypes.TLS_PRIVATE_KEY) {
      return;
    }

    this.deviceService.getDeviceCredentials(this.device.id).pipe(takeUntil(this.destroy$)).subscribe(credentials => {
      this.updateSecurityType(security, credentials);
      this.updateCredentials(credentials, security);
      this.basicFormGroup.updateValueAndValidity();
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
      this.basicFormGroup.get('thingsboard.security.type').setValue(securityType, { emitEvent: false });
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
    this.basicFormGroup.get('thingsboard.security.accessToken').setValue(credentials.credentialsId, { emitEvent: false });
    if (security.type === SecurityTypes.TLS_ACCESS_TOKEN) {
      this.basicFormGroup.get('thingsboard.security.caCert').setValue(security.caCert, { emitEvent: false });
    }
  }

  private updateMqttBasicCredentials(credentials: DeviceCredentials): void {
    const parsedValue = JSON.parse(credentials.credentialsValue);
    this.basicFormGroup.get('thingsboard.security.clientId').setValue(parsedValue.clientId, { emitEvent: false });
    this.basicFormGroup.get('thingsboard.security.username').setValue(parsedValue.userName, { emitEvent: false });
    this.basicFormGroup.get('thingsboard.security.password').setValue(parsedValue.password, { emitEvent: false });
  }
}
