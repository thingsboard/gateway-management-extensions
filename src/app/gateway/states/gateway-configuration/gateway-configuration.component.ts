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

import { ChangeDetectorRef, Component, Input, AfterViewInit, DestroyRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { filter, mergeMap, switchMap, take } from 'rxjs/operators';
import {
  GatewayLogLevel,
  ConfigurationModes,
  GatewayVersion,
  Attribute,
  ReportStrategyVersionPipe,
} from '../../shared/public-api';
import { deepTrim, isEqual, AttributeService } from '@core/public-api';
import {
  GatewayBasicConfigTabKey,
  GatewayConfigValue,
  GatewayLogsConfig,
  LocalLogs,
  LocalLogsConfigs,
  LogAttribute,
  LogConfig,
  LogSavingPeriod,
  logsHandlerClass,
  logsLegacyHandlerClass,
} from './models/public-api';
import {
  DeviceId,
  NULL_UUID,
  EntityId,
  AttributeData,
  AttributeScope,
  SharedModule
} from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { GatewayBasicConfigurationComponent, GatewayAdvancedConfigurationComponent } from './components/public-api';
import { GatewayDeviceCredentialsService } from './services/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GatewayConnectorVersionMappingUtil } from '../gateway-connectors/utils/public-api';

@Component({
  selector: 'tb-gateway-configuration',
  templateUrl: './gateway-configuration.component.html',
  styleUrls: ['./gateway-configuration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReportStrategyVersionPipe,
    GatewayBasicConfigurationComponent,
    GatewayAdvancedConfigurationComponent,
  ],
  providers: [GatewayDeviceCredentialsService]
})
export class GatewayConfigurationComponent implements AfterViewInit {

  @Input() device: DeviceId;
  @Input() defaultTab: GatewayBasicConfigTabKey;

  @Input() dialogRef: MatDialogRef<GatewayConfigurationComponent>;

  gatewayConfigGroup: FormGroup;
  ConfigurationModes = ConfigurationModes;
  gatewayVersion: GatewayVersion;

  private readonly gatewayConfigAttributeKeys =
    ['general_configuration', 'grpc_configuration', 'logs_configuration', 'storage_configuration', 'RemoteLoggingLevel', 'mode'];
  private useUpdatedLogs = false;

  constructor(private fb: FormBuilder,
              private attributeService: AttributeService,
              private cd: ChangeDetectorRef,
              private gatewayCredentialsService: GatewayDeviceCredentialsService,
              private destroyRef: DestroyRef
  ) {

    this.gatewayConfigGroup = this.fb.group({
      basicConfig: [],
      advancedConfig: [],
      mode: [ConfigurationModes.BASIC],
    });

    this.observeAlignConfigs();
  }

  ngAfterViewInit(): void {
    this.fetchConfigAttribute(this.device);
  }

  saveConfig(): void {
    const { mode, advancedConfig } = deepTrim(this.removeEmpty(this.gatewayConfigGroup.value));
    const value = { mode, ...advancedConfig as GatewayConfigValue };
    value.thingsboard.statistics.commands = Object.values(value.thingsboard.statistics.commands ?? []);
    const attributes = this.generateAttributes(value);

    this.attributeService.saveEntityAttributes(this.device, AttributeScope.SHARED_SCOPE, attributes).pipe(
      switchMap(_ => this.gatewayCredentialsService.updateCredentials(value.thingsboard.security)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      if (this.dialogRef) {
        this.dialogRef.close();
      } else {
        this.gatewayConfigGroup.markAsPristine();
        this.cd.detectChanges();
      }
    });
  }

  onInitialized(value: GatewayConfigValue): void {
    this.gatewayConfigGroup.get('basicConfig').patchValue(value, {emitEvent: false});
    this.gatewayConfigGroup.get('advancedConfig').patchValue(value, {emitEvent: false});
  }

  private observeAlignConfigs(): void {
    this.gatewayConfigGroup.get('basicConfig').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      const advancedControl = this.gatewayConfigGroup.get('advancedConfig');

      if (!isEqual(advancedControl.value, value) && this.gatewayConfigGroup.get('mode').value === ConfigurationModes.BASIC) {
        advancedControl.patchValue(value, {emitEvent: false});
      }
    });

    this.gatewayConfigGroup.get('advancedConfig').valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      const basicControl = this.gatewayConfigGroup.get('basicConfig');

      if (!isEqual(basicControl.value, value) && this.gatewayConfigGroup.get('mode').value === ConfigurationModes.ADVANCED) {
        basicControl.patchValue(value, {emitEvent: false});
      }
    });
  }

  private generateAttributes(value: GatewayConfigValue): Attribute[] {
    const attributes = [];

    const addAttribute = (key: string, val: unknown) => {
      attributes.push({ key, value: val });
    };

    const addTimestampedAttribute = (key: string, val: unknown) => {
      val = {...val as Record<string, unknown>, ts: new Date().getTime()};
      addAttribute(key, val);
    };

    addAttribute('RemoteLoggingLevel', value.logs?.logLevel ?? GatewayLogLevel.NONE);

    delete value.connectors;
    addAttribute('logs_configuration', this.generateLogsFile(value.logs));

    addTimestampedAttribute('grpc_configuration', value.grpc);
    addTimestampedAttribute('storage_configuration', value.storage);
    addTimestampedAttribute('general_configuration', value.thingsboard);

    addAttribute('mode', value.mode);

    return attributes;
  }

  cancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  private removeEmpty(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v != null)
        .map(([k, v]) => [k, v === Object(v) ? this.removeEmpty(v as Record<string, unknown>) : v])
    );
  }

  private generateLogsFile(logsObj: GatewayLogsConfig): LogAttribute {
    const logAttrObj = {
      version: 1,
      disable_existing_loggers: false,
      formatters: {
        LogFormatter: {
          class: 'logging.Formatter',
          format: logsObj.logFormat,
          datefmt: logsObj.dateFormat,
        }
      },
      handlers: {
        consoleHandler: {
          class: 'logging.StreamHandler',
          formatter: 'LogFormatter',
          level: 0,
          stream: 'ext://sys.stdout'
        },
        ...(this.useUpdatedLogs ? {}
          : {
            databaseHandler: {
              class: this.useUpdatedLogs ? logsHandlerClass : logsLegacyHandlerClass,
              formatter: 'LogFormatter',
              filename: './logs/database.log',
              backupCount: 1,
              encoding: 'utf-8'
            }
          })
      },
      loggers: {
        ...(this.useUpdatedLogs ? {}
          : {
            database: {
              handlers: ['databaseHandler', 'consoleHandler'],
              level: 'DEBUG',
              propagate: false
            }
          })
      },
      root: {
        level: 'ERROR',
        handlers: [
          'consoleHandler'
        ]
      },
      ts: new Date().getTime()
    };

    this.addLocalLoggers(logAttrObj, logsObj?.local);

    return logAttrObj;
  }

  private addLocalLoggers(logAttrObj: LogAttribute, localLogs: LocalLogs): void {
    if (localLogs) {
      for (const key of Object.keys(localLogs)) {
        logAttrObj.handlers[key + 'Handler'] = this.createHandlerObj(localLogs[key], key);
        logAttrObj.loggers[key] = this.createLoggerObj(localLogs[key], key);
      }
    }
  }

  private createHandlerObj(logObj: LogConfig, key: string) {
    return {
      class: this.useUpdatedLogs ? logsHandlerClass : logsLegacyHandlerClass,
      formatter: 'LogFormatter',
      filename: `${logObj.filePath}/${key}.log`,
      backupCount: logObj.backupCount,
      interval: logObj.savingTime,
      when: logObj.savingPeriod,
      encoding: 'utf-8'
    };
  }

  private createLoggerObj(logObj: LogConfig, key: string) {
    return {
      handlers: [`${key}Handler`, 'consoleHandler'],
      level: logObj.logLevel,
      propagate: false
    };
  }

  private fetchConfigAttribute(entityId: EntityId): void {
    if (entityId.id === NULL_UUID) {
      return;
    }

    this.attributeService.getEntityAttributes(entityId, AttributeScope.CLIENT_SCOPE,
      )
      .pipe(
        mergeMap(attributes => attributes.length ? of(attributes) : this.attributeService.getEntityAttributes(
          entityId, AttributeScope.SHARED_SCOPE, this.gatewayConfigAttributeKeys)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(attributes => {
        this.gatewayVersion = attributes.find(attribute => attribute.key === 'Version')?.value;
        this.useUpdatedLogs = GatewayConnectorVersionMappingUtil.parseVersion(this.gatewayVersion ?? GatewayVersion.Legacy)
          >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.v3_6_3);
        this.updateConfigs(attributes);
        this.cd.detectChanges();
      });
  }

  private updateConfigs(attributes: AttributeData[]): void {
    let formValue = {} as GatewayConfigValue;
    let logLevel = GatewayLogLevel.NONE;

    this.gatewayCredentialsService.setInitialCredentials(this.device);

    attributes.forEach(attr => {
      switch (attr.key) {
        case 'general_configuration':
          if (attr.value) {
            formValue = { ...formValue, thingsboard: attr.value };
          }
          break;
        case 'grpc_configuration':
          if (attr.value) {
            formValue = { ...formValue, grpc: attr.value };
          }
          break;
        case 'logs_configuration':
          if (attr.value) {
            formValue = { ...formValue, logs: this.logsToObj(attr.value) };
          }
          break;
        case 'storage_configuration':
          if (attr.value) {
            formValue = { ...formValue, storage: attr.value };
          }
          break;
        case 'mode':
          formValue = { ...formValue, mode: attr.value ?? ConfigurationModes.BASIC };
          break;
        case 'RemoteLoggingLevel':
          if (attr.value) {
            logLevel = attr.value;
          }
      }
    });
    if (formValue.logs) {
      formValue = { ...formValue, logs: {...formValue.logs, logLevel } };
    }

    if (formValue.thingsboard?.security) {
      this.gatewayCredentialsService.initialCredentials$.pipe(filter(Boolean), take(1), takeUntilDestroyed(this.destroyRef)).subscribe(credentials => {
        if (this.gatewayCredentialsService.shouldUpdateSecurityConfig(formValue.thingsboard.security)) {
          formValue.thingsboard.security = this.gatewayCredentialsService.credentialsToSecurityConfig(credentials);
        }
        this.gatewayConfigGroup.get('basicConfig').patchValue(formValue, { emitEvent: false });
        this.gatewayConfigGroup.get('advancedConfig').patchValue(formValue, { emitEvent: false });
      });
    } else {
      this.gatewayConfigGroup.get('basicConfig').patchValue(formValue, { emitEvent: false });
      this.gatewayConfigGroup.get('advancedConfig').patchValue(formValue, { emitEvent: false });
    }
  }

  private logsToObj(logsConfig: LogAttribute): GatewayLogsConfig {
    const { format: logFormat, datefmt: dateFormat } = logsConfig.formatters.LogFormatter;

    const localLogs = Object.keys(LocalLogsConfigs).reduce((acc, key) => {
      const handler = logsConfig.handlers[`${key}Handler`] || {};
      const logger = logsConfig.loggers[key] || {};

      acc[key] = {
        logLevel: logger.level || GatewayLogLevel.INFO,
        filePath: handler.filename?.split(`/${key}`)[0] || './logs',
        backupCount: handler.backupCount || 7,
        savingTime: handler.interval || 3,
        savingPeriod: handler.when || LogSavingPeriod.days
      };

      return acc;
    }, {}) as LocalLogs;

    return { local: localLogs, logFormat, dateFormat };
  }
}
