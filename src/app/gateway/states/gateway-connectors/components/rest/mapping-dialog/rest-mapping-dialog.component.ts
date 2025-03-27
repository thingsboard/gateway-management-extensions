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

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, deleteNullProperties } from '@core/public-api';
import { DialogComponent, helpBaseUrl, SharedModule } from '@shared/public-api';
import { TbPopoverService } from '@shared/components/popover.service';
import {
  Attribute,
  ConnectorType,
  EllipsisChipListDirective,
  ErrorTooltipIconComponent,
  HTTPMethods,
  noLeadTrailSpacesRegex,
  Timeseries,
} from '../../../../../shared/public-api';
import {
  DeviceInfoType,
  MappingKeysAddKeyTranslationsMap,
  MappingKeysDeleteKeyTranslationsMap,
  MappingKeysNoKeysTextTranslationsMap,
  MappingKeysPanelTitleTranslationsMap,
  MappingKeysType,
  RestConvertorTypeTranslationsMap,
  RestDataConversionTranslationsMap,
  RestMapping,
  RestMappingInfo,
  SecurityMode,
  SecurityType,
} from '../../../models/public-api';
import { DeviceInfoTableComponent } from '../../device-info-table/device-info-table.component';
import { SecurityConfigComponent } from '../../security-config/security-config.component';
import { RestConverterType, RestSourceType } from '../../../models/rest.models';
import { MappingDataKeysPanelComponent } from '../../mapping-data-keys-panel/mapping-data-keys-panel.component';
import { RestResponseConfigComponent } from '../response-config/rest-response-config.component';

@Component({
  selector: 'tb-rest-mapping-dialog',
  templateUrl: './rest-mapping-dialog.component.html',
  styleUrls: ['./rest-mapping-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
    DeviceInfoTableComponent,
    SecurityConfigComponent,
    RestResponseConfigComponent,
    ErrorTooltipIconComponent,
  ]
})
export class RestMappingDialogComponent extends DialogComponent<RestMappingDialogComponent, RestMapping> {

  mappingFormGroup = this.fb.group({
    endpoint: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    HTTPMethods: [[HTTPMethods.POST], [Validators.required]],
    security: [{ type: SecurityType.ANONYMOUS }],
    converter: this.fb.group({
      type: [RestConverterType.JSON, []],
      deviceInfo: [],
      attributes: [[] as Attribute[]],
      timeseries: [[] as Timeseries[]],
      extension: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      extensionConfig: [],
    }),
    response: []
  });
  keysPopupClosed = true;

  readonly helpLink = `${helpBaseUrl}/docs/iot-gateway/config/rest/#mapping-section`;
  readonly httpMethods = Object.values(HTTPMethods) as HTTPMethods[];
  readonly converterTypes = Object.values(RestConverterType) as RestConverterType[];
  readonly restSourceTypes = Object.values(RestSourceType) as RestSourceType[];
  readonly SecurityMode = SecurityMode;
  readonly MappingKeysType = MappingKeysType;
  readonly DeviceInfoType = DeviceInfoType;
  readonly RestConvertorTypeTranslationsMap = RestConvertorTypeTranslationsMap;
  readonly RestDataConversionTranslationsMap = RestDataConversionTranslationsMap;
  readonly RestConverterType = RestConverterType;
  readonly ConnectorType = ConnectorType;

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: RestMappingInfo,
              public dialogRef: MatDialogRef<RestMappingDialogComponent, RestMapping>,
              private fb: FormBuilder,
              private popoverService: TbPopoverService,
              private renderer: Renderer2,
              private viewContainerRef: ViewContainerRef,
              private destroyRef: DestroyRef,
              private cd: ChangeDetectorRef
  ) {
    super(store, router, dialogRef);

    this.mappingFormGroup.patchValue(this.data.value, { emitEvent: false });
    this.observeConverterTypeChange();
    this.toggleConverterFieldsByType(this.converterType);
  }

  get converterType(): RestConverterType {
    return this.mappingFormGroup.get('converter')?.get('type').value;
  }

  get converterAttributes(): Array<string> {
    if (this.converterType) {
      return this.mappingFormGroup.get('converter').value.attributes.map((value: Attribute) => value.key);
    }
  }

  get converterTelemetry(): Array<string> {
    if (this.converterType) {
      return this.mappingFormGroup.get('converter').value.timeseries.map((value: Timeseries) => value.key);
    }
  }

  get customKeys(): Array<string> {
    return Object.keys(this.mappingFormGroup.get('converter').value.extensionConfig ?? {});
  }

  cancel(): void {
    if (this.keysPopupClosed) {
      this.dialogRef.close(null);
    }
  }

  add(): void {
    if (this.mappingFormGroup.valid) {
      const value = this.mappingFormGroup.value;
      deleteNullProperties(value);
      this.dialogRef.close(value as RestMapping);
    }
  }

  manageKeys($event: Event, matButton: MatButton, keysType: MappingKeysType): void {
    if ($event) {
      $event.stopPropagation();
    }
    const trigger = matButton._elementRef.nativeElement;
    if (this.popoverService.hasPopover(trigger)) {
      this.popoverService.hidePopover(trigger);
    } else {
      const keysControl = this.mappingFormGroup.get('converter').get(keysType);
      const ctx = {
        keys: keysControl.value,
        keysType,
        panelTitle: MappingKeysPanelTitleTranslationsMap.get(keysType),
        addKeyTitle: MappingKeysAddKeyTranslationsMap.get(keysType),
        deleteKeyTitle: MappingKeysDeleteKeyTranslationsMap.get(keysType),
        noKeysText: MappingKeysNoKeysTextTranslationsMap.get(keysType),
        withReportStrategy: this.data.withReportStrategy,
        convertorType: this.converterType,
        connectorType: ConnectorType.REST
      };
      this.keysPopupClosed = false;
      const dataKeysPanelPopover = this.popoverService.displayPopover(trigger, this.renderer,
        this.viewContainerRef, MappingDataKeysPanelComponent, 'leftBottom', false, null,
        ctx,
        {},
        {}, {}, true);
      dataKeysPanelPopover.tbComponentRef.instance.keysDataApplied.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(keysData => {
        dataKeysPanelPopover.hide();
        keysControl.patchValue(keysData);
        keysControl.markAsDirty();
        this.cd.markForCheck();
      });
      dataKeysPanelPopover.tbHideStart.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.keysPopupClosed = true;
      });
    }
  }

  private observeConverterTypeChange(): void {
    this.mappingFormGroup.get('converter').get('type').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(type => this.toggleConverterFieldsByType(type));
  }

  private toggleConverterFieldsByType(type: RestConverterType): void {
    const isJson = type === RestConverterType.JSON;

    this.mappingFormGroup.get('converter').get('attributes')[isJson ? 'enable' : 'disable']({emitEvent: false});
    this.mappingFormGroup.get('converter').get('timeseries')[isJson ? 'enable' : 'disable']({emitEvent: false});

    this.mappingFormGroup.get('converter').get('extension')[isJson ? 'disable' : 'enable']({emitEvent: false});
    this.mappingFormGroup.get('converter').get('extensionConfig')[isJson ? 'disable' : 'enable']({emitEvent: false});
  }
}
