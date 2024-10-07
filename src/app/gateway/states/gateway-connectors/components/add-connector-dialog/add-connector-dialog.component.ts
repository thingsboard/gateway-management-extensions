///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DialogComponent, BaseData, HasId, helpBaseUrl } from '@shared/public-api';
import { Router } from '@angular/router';
import {
  AddConnectorConfigData,
  ConnectorType,
  CreatedConnectorConfigData,
  GatewayConnector,
  GatewayConnectorDefaultTypesTranslatesMap,
  GatewayLogLevel,
  GatewayVersion,
  GatewayVersionedDefaultConfig,
  noLeadTrailSpacesRegex,
  LatestVersionConfigPipe
} from '../../../../shared/public-api';
import { Observable, Subject } from 'rxjs';
import { ResourcesService, AppState } from '@core/public-api';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'tb-add-connector-dialog',
  templateUrl: './add-connector-dialog.component.html',
  styleUrls: ['./add-connector-dialog.component.scss'],
  providers: [],
})
export class AddConnectorDialogComponent
  extends DialogComponent<AddConnectorDialogComponent, BaseData<HasId>> implements OnInit, OnDestroy {

  connectorForm: UntypedFormGroup;

  connectorType = ConnectorType;

  gatewayConnectorDefaultTypesTranslatesMap = GatewayConnectorDefaultTypesTranslatesMap;
  gatewayLogLevel = Object.values(GatewayLogLevel);

  submitted = false;

  private destroy$ = new Subject<void>();

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: AddConnectorConfigData,
              public dialogRef: MatDialogRef<AddConnectorDialogComponent, CreatedConnectorConfigData>,
              private fb: FormBuilder,
              private isLatestVersionConfig: LatestVersionConfigPipe,
              private resourcesService: ResourcesService) {
    super(store, router, dialogRef);
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
      this.getDefaultConfig(value.type).subscribe((defaultConfig: GatewayVersionedDefaultConfig) => {
        const gatewayVersion = this.data.gatewayVersion;
        if (gatewayVersion) {
          value.configVersion = gatewayVersion;
        }
        value.configurationJson = (this.isLatestVersionConfig.transform(gatewayVersion)
          ? defaultConfig[GatewayVersion.Current]
          : defaultConfig[GatewayVersion.Legacy])
          ?? defaultConfig;
        if (this.connectorForm.valid) {
          this.dialogRef.close(value);
        }
      });
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

  private getDefaultConfig(type: string): Observable<GatewayVersionedDefaultConfig | GatewayConnector> {
    return this.resourcesService.loadJsonResource(`/assets/metadata/connector-default-configs/${type}.json`);
  };
}
