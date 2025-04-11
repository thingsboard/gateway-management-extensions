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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DialogComponent, BaseData, HasId, helpBaseUrl, SharedModule } from '@shared/public-api';
import { Router } from '@angular/router';
import {
  ConnectorType,
  GatewayConnectorDefaultTypesTranslatesMap,
  GatewayLogLevel,
  GatewayVersion,
  noLeadTrailSpacesRegex,
  getDefaultConfig,
  ReportStrategyVersionPipe,
  ConnectorsTypesByVersion
} from '../../../../shared/public-api';
import {
  AddConnectorConfigData,
  CreatedConnectorConfigData,
  GatewayConnectorConfigVersionMap,
} from '../../models/public-api';
import { Subject } from 'rxjs';
import { AppState } from '@core/public-api';
import { takeUntil, tap } from 'rxjs/operators';
import { LatestVersionConfigPipe } from '../../pipes/public-api';
import { CommonModule } from '@angular/common';
import { GatewayConnectorVersionMappingUtil } from '../../utils/public-api';

@Component({
  selector: 'tb-add-connector-dialog',
  templateUrl: './add-connector-dialog.component.html',
  styleUrls: ['./add-connector-dialog.component.scss'],
  providers: [LatestVersionConfigPipe],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReportStrategyVersionPipe
  ]
})
export class AddConnectorDialogComponent
  extends DialogComponent<AddConnectorDialogComponent, BaseData<HasId>> implements OnInit, OnDestroy {

  connectorForm: UntypedFormGroup;

  connectorType = ConnectorType;
  connectorTypes: ConnectorType[];

  gatewayConnectorDefaultTypesTranslatesMap = GatewayConnectorDefaultTypesTranslatesMap;
  gatewayLogLevel = Object.values(GatewayLogLevel);

  submitted = false;

  private destroy$ = new Subject<void>();

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: AddConnectorConfigData,
              public dialogRef: MatDialogRef<AddConnectorDialogComponent, CreatedConnectorConfigData>,
              private fb: FormBuilder,
              private isLatestVersionConfig: LatestVersionConfigPipe
  ) {
    super(store, router, dialogRef);
    this.updateConnectorTypesByVersion();
    this.connectorForm = this.fb.group({
      type: [ConnectorType.MQTT, []],
      name: ['', [Validators.required, this.uniqNameRequired(), Validators.pattern(noLeadTrailSpacesRegex)]],
      logLevel: [GatewayLogLevel.INFO, []],
      useDefaults: [true, []],
      sendDataOnlyOnChange: [false, []],
      class: ['', []],
      key: ['auto', []],
    });
  }

  ngOnInit(): void {
    this.observeTypeChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }

  helpLinkId(): string {
    return helpBaseUrl + '/docs/iot-gateway/configuration/';
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  add(): void {
    this.submitted = true;
    const value = this.connectorForm.getRawValue();
    if (value.useDefaults) {
      const defaultConfig = getDefaultConfig(value.type);
      const gatewayVersion = this.data.gatewayVersion;
      if (gatewayVersion) {
        value.configVersion = gatewayVersion;
      }
      value.configurationJson = (this.isLatestVersionConfig.transform(gatewayVersion, value.type)
          ? defaultConfig[GatewayConnectorConfigVersionMap.get(value.type)]
          : defaultConfig[GatewayVersion.Legacy])
        ?? defaultConfig;
      if (this.connectorForm.valid) {
        this.dialogRef.close(value);
      }
    } else if (this.connectorForm.valid) {
      this.dialogRef.close(value);
    }
  }

  private uniqNameRequired(): ValidatorFn {
    return (control: UntypedFormControl) => {
      const newName = control.value.trim().toLowerCase();
      const isDuplicate = this.data.dataSourceData.some(({ value: { name } }) =>
        name.toLowerCase() === newName
      );

      return isDuplicate ? { duplicateName: { valid: false } } : null;
    };
  }

  private updateConnectorTypesByVersion(): void {
    const connectorVersions = ConnectorsTypesByVersion.keys();
    for (let version of connectorVersions) {
     if (version === GatewayVersion.Legacy || GatewayConnectorVersionMappingUtil.parseVersion(this.data.gatewayVersion)
       >= GatewayConnectorVersionMappingUtil.parseVersion(version)) {
       this.connectorTypes = ConnectorsTypesByVersion.get(version);
       break;
     }
    }
  }

  private observeTypeChange(): void {
    this.connectorForm.get('type').valueChanges.pipe(
      tap((type: ConnectorType) => {
        const useDefaultControl = this.connectorForm.get('useDefaults');
        if (type === ConnectorType.GRPC || type === ConnectorType.CUSTOM) {
          useDefaultControl.setValue(false);
        } else if (!useDefaultControl.value) {
          useDefaultControl.setValue(true);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
