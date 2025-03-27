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
  Component,
  DestroyRef,
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
  UntypedFormControl,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { coerceBoolean, EntityId, SharedModule } from '@shared/public-api';
import { MatDialog } from '@angular/material/dialog';
import {
  GatewayRemoteConfigurationDialogComponent,
  GatewayRemoteConfigurationDialogData
} from '../../../gateway-remote-shell/public-api';
import { DeviceService } from '@core/public-api';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import {
  GatewayConfigCommand,
  GatewayVersion,
  noLeadTrailSpacesRegex,
  numberInputPattern,
  ReportStrategyComponent,
  ReportStrategyDefaultValue,
  ReportStrategyType
} from '../../../../shared/public-api';
import { CommonModule } from '@angular/common';
import {
  GatewayBasicConfigTab,
  GatewayBasicConfigTabKey,
  GatewayConfigValue,
} from '../../models/public-api';
import { MatTabGroup } from '@angular/material/tabs';
import { GatewayStorageConfigurationComponent } from './storage/gateway-storage-configuration.component';
import { GatewayGrpcConfigurationComponent } from './grpc/gateway-grpc-configuration.component';
import { GatewayLogsConfigurationComponent } from './logs/gateway-logs-configuration.component';
import { GatewaySecurityConfigurationComponent } from './security/gateway-security-configuration.component';
import { GatewayDeviceCredentialsService } from '../../services/gateway-device-credentials.service';
import { GatewayConnectorVersionMappingUtil } from '../../../gateway-connectors/utils/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    GatewaySecurityConfigurationComponent,
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
  @Input() gatewayVersion: GatewayVersion = GatewayVersion.Legacy;
  @Input() @coerceBoolean() dialogMode = false;
  @Input() @coerceBoolean() withReportStrategy = false;

  @Output() initialized = new EventEmitter();

  @ViewChild('configGroup') configGroup: MatTabGroup;

  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;

  basicFormGroup: FormGroup;
  hasUpdatedStatistics: boolean;

  readonly initialCredentials$ = this.gatewayCredentialsService.initialCredentials$;

  private onChange: (value: GatewayConfigValue) => void = () => {};

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder,
              private deviceService: DeviceService,
              private gatewayCredentialsService: GatewayDeviceCredentialsService,
              private destroyRef: DestroyRef,
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
      this.basicFormGroup.get('thingsboard.reportStrategy').enable({emitEvent: false});
    }
    if (!changes.gatewayVersion.firstChange && changes.gatewayVersion?.previousValue !== changes.gatewayVersion.currentValue) {
      this.onVersionChange();
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
    const commands = basicConfig?.thingsboard?.statistics?.commands ?? [];
    this.commandFormArray().clear({emitEvent: false});
    commands.forEach((command: GatewayConfigCommand) => this.addCommand(command, false));
  }

  validate(): ValidationErrors | null {
    return this.basicFormGroup.valid ? null : {
      basicFormGroup: {valid: false}
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
    const { attributeOnGateway = null, command: cmd = null, timeout = 10, installCmd = '' } = command || {};

    const commandFormGroup = this.fb.group({
      attributeOnGateway: [attributeOnGateway, [Validators.required, Validators.pattern(/^[^.\s]+$/), this.uniqNameRequired()]],
      command: [cmd, [Validators.required, Validators.pattern(/^(?=\S).*\S$/)]],
      timeout: [timeout, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern), Validators.pattern(/^[^.\s]+$/)]],
      installCmd: [installCmd, Validators.pattern(noLeadTrailSpacesRegex)]
    });

    this.commandFormArray().push(commandFormGroup, { emitEvent });
  }

  private uniqNameRequired(): ValidatorFn {
    return (control: UntypedFormControl) => {
      const newName = control.value?.trim().toLowerCase();
      const isDuplicate = control.dirty && newName && this.commandFormArray().value.some(command => command.attributeOnGateway?.toLowerCase() === newName)

      return isDuplicate ? { duplicateName: { valid: false } } : null;
    };
  }

  onInitialized(value: GatewayConfigValue): void {
    this.basicFormGroup.patchValue(value, {emitEvent: false});
    this.initialized.emit(this.basicFormGroup.value);
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
        enableCustom: [{ value: false, disabled: true }],
        statsSendPeriodInSeconds: [3600, [Validators.required, Validators.min(60), Validators.pattern(numberInputPattern)]],
        customStatsSendPeriodInSeconds: [3600, [Validators.required, Validators.min(60), Validators.pattern(numberInputPattern)]],
        commands: this.fb.array([])
      }),
      maxPayloadSizeBytes: [8196, [Validators.required, Validators.min(100), Validators.pattern(numberInputPattern)]],
      minPackSendDelayMS: [50, [Validators.required, Validators.min(10), Validators.pattern(numberInputPattern)]],
      minPackSizeToSend: [500, [Validators.required, Validators.min(100), Validators.pattern(numberInputPattern)]],
      handleDeviceRenaming: [true],
      checkingDeviceActivity: this.initCheckingDeviceActivityFormGroup(),
      security: [],
      qos: [1],
      reportStrategy: [{
        value: { type: ReportStrategyType.OnReceived },
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

  private onVersionChange(): void {
    this.hasUpdatedStatistics = GatewayConnectorVersionMappingUtil.parseVersion(this.gatewayVersion) >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.v3_7_3);
    if (this.hasUpdatedStatistics) {
      const enableCustomControl = this.basicFormGroup.get('thingsboard.statistics.enableCustom');
      enableCustomControl.enable({emitEvent: false});
      this.basicFormGroup.get('thingsboard.statistics.enable').valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(enable => {
          if (!enable) {
            enableCustomControl.patchValue(false, {emitEvent: false});
          }
          enableCustomControl[enable ? 'enable' : 'disable']({emitEvent: false});
        });
    }
  }

  private observeFormChanges(): void {
    this.observeRemoteConfigurationChanges();
    this.observeDeviceActivityChanges();
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
}
