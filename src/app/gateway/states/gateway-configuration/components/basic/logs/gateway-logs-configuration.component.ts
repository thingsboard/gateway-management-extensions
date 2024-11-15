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
import { AfterViewInit, Component, EventEmitter, forwardRef, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import {
  GatewayLogsConfig,
  LocalLogsConfigs,
  LocalLogsConfigTranslateMap,
  LogConfig,
  LogSavingPeriod,
  LogSavingPeriodTranslations,
} from '../../../models/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GatewayLogLevel } from '../../../../../shared/models/public-api';

@Component({
  selector: 'tb-gateway-logs-configuration',
  templateUrl: './gateway-logs-configuration.component.html',
  styleUrls: ['./gateway-logs-configuration.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GatewayLogsConfigurationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GatewayLogsConfigurationComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class GatewayLogsConfigurationComponent implements AfterViewInit, Validators, ControlValueAccessor {

  @Output() initialized = new EventEmitter();

  logsFormGroup: FormGroup;
  logSelector: FormControl;
  showRemoteLogsControl: FormControl<boolean>;

  readonly logSavingPeriods = LogSavingPeriodTranslations;
  readonly localLogsConfigs = Object.keys(LocalLogsConfigs) as LocalLogsConfigs[];
  readonly localLogsConfigTranslateMap = LocalLogsConfigTranslateMap;
  readonly gatewayLogLevel = Object.values(GatewayLogLevel);
  readonly remoteLogLevel = Object.values(GatewayLogLevel).filter(key => key !== GatewayLogLevel.NONE);

  private onChange: (value: GatewayLogsConfig) => void = () => {};

  constructor(private fb: FormBuilder) {
    this.logsFormGroup = this.initLogsFormGroup();
    this.showRemoteLogsControl = this.fb.control(false);
    this.logsFormGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      this.onChange(value);
    });
    this.logSelector = this.fb.control(LocalLogsConfigs.service);
    for (const key of Object.keys(LocalLogsConfigs)) {
      this.addLocalLogConfig(key, {} as LogConfig);
    }
    this.showRemoteLogsControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(enable => this.logsFormGroup.get('logLevel')[enable ? 'enable' : 'disable']());
  }

  ngAfterViewInit(): void {
    this.initialized.emit({ logs: this.logsFormGroup.value });
  }

  writeValue(value: GatewayLogsConfig): void {
    this.logsFormGroup.patchValue(value, { emitEvent: false });
    this.updateRemoteLogs(value?.logLevel ?? GatewayLogLevel.NONE);
  }

  registerOnChange(fn: (config: GatewayLogsConfig) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => {}): void {}

  getLogFormGroup(value: string): FormGroup {
    return this.logsFormGroup.get(`local.${value}`) as FormGroup;
  }

  validate(): ValidationErrors | null {
    return this.logsFormGroup.valid ? null : {
      logsFormGroup: {valid: false}
    };
  }

  private initLogsFormGroup(): FormGroup {
    return this.fb.group({
      dateFormat: ['%Y-%m-%d %H:%M:%S', [Validators.required, Validators.pattern(/^[^\s].*[^\s]$/)]],
      logFormat: [
        '%(asctime)s - |%(levelname)s| - [%(filename)s] - %(module)s - %(funcName)s - %(lineno)d - %(message)s',
        [Validators.required, Validators.pattern(/^[^\s].*[^\s]$/)]
      ],
      type: ['remote', [Validators.required]],
      logLevel: [GatewayLogLevel.INFO],
      local: this.fb.group({})
    });
  }

  private addLocalLogConfig(name: string, config: LogConfig): void {
    const localLogsFormGroup = this.logsFormGroup.get('local') as FormGroup;
    const configGroup = this.fb.group({
      logLevel: [config.logLevel || GatewayLogLevel.INFO, [Validators.required]],
      filePath: [config.filePath || './logs', [Validators.required]],
      backupCount: [config.backupCount || 7, [Validators.required, Validators.min(0)]],
      savingTime: [config.savingTime || 3, [Validators.required, Validators.min(0)]],
      savingPeriod: [config.savingPeriod || LogSavingPeriod.days, [Validators.required]]
    });
    localLogsFormGroup.addControl(name, configGroup, {emitEvent: false});
  }

  private updateRemoteLogs(logLevel: GatewayLogLevel): void {
    this.showRemoteLogsControl.patchValue(logLevel && logLevel !== GatewayLogLevel.NONE, {emitEvent: false});
    this.logsFormGroup.get('logLevel').patchValue(logLevel === GatewayLogLevel.NONE ? GatewayLogLevel.INFO : logLevel, {emitEvent: false});
  }
}
