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
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { AppState } from '@core/public-api';
import { DialogComponent, helpBaseUrl, SharedModule } from '@shared/public-api';
import { TbPopoverService } from '@shared/components/popover.service';

import {
  EllipsisChipListDirective,
  noLeadTrailSpacesRegex,
  TruncateWithTooltipDirective,
} from '../../../../../shared/public-api';
import {
  DeviceInfoType,
  DevicesConfigMapping,
  ExpressionType,
  MappingInfo,
  PortLimits,
} from '../../../models/public-api';
import {
  BacnetDeviceKeysAddKeyTranslationsMap,
  BacnetDeviceKeysDeleteKeyTranslationsMap,
  BacnetDeviceKeysNoKeysTextTranslationsMap,
  BacnetDeviceKeysPanelTitleTranslationsMap,
  BacnetDeviceKeysType,
} from '../../../models/public-api';
import { GatewayPortTooltipPipe } from '../../../pipes/public-api';
import { DeviceInfoTableComponent } from '../../device-info-table/device-info-table.component';
import { BacnetDeviceDataKeysPanelComponent } from '../device-data-keys-pannel/bacnet-device-data-keys-panel.component';

@Component({
  selector: 'tb-bacnet-device-dialog',
  templateUrl: './bacnet-device-dialog.component.html',
  styleUrls: ['./bacnet-device-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
    TruncateWithTooltipDirective,
    GatewayPortTooltipPipe,
    DeviceInfoTableComponent,
  ]
})
export class BacnetDeviceDialogComponent extends DialogComponent<BacnetDeviceDialogComponent, DevicesConfigMapping> {

  deviceFormGroup: UntypedFormGroup;
  keysPopupClosed = true;

  readonly BacnetDeviceKeysType = BacnetDeviceKeysType;
  readonly DeviceInfoType = DeviceInfoType;
  readonly portLimits = PortLimits;
  readonly deviceHelpLink = helpBaseUrl + '/docs/iot-gateway/config/bacnet/#device-object-settings';
  readonly sourceTypes = Object.values(ExpressionType) as ExpressionType[];

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: MappingInfo,
              public dialogRef: MatDialogRef<BacnetDeviceDialogComponent, DevicesConfigMapping>,
              private fb: FormBuilder,
              private popoverService: TbPopoverService,
              private renderer: Renderer2,
              private viewContainerRef: ViewContainerRef,
              private cdr: ChangeDetectorRef,
              private destroyRef: DestroyRef,
  ) {
    super(store, router, dialogRef);

    this.deviceFormGroup = this.fb.group({
      host: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      port: [null, [Validators.required, Validators.min(PortLimits.MIN), Validators.max(PortLimits.MAX)]],
      deviceInfo: [],
      pollPeriod: [],
      timeseries: [[]],
      attributes: [[]],
      attributeUpdates: [[]],
      serverSideRpc: [[]],
    });
    this.deviceFormGroup.patchValue(this.data.value, { emitEvent: false })
  }

  cancel(): void {
    if (this.keysPopupClosed) {
      this.dialogRef.close(null);
    }
  }

  add(): void {
    if (this.deviceFormGroup.valid) {
      this.dialogRef.close(this.deviceFormGroup.value);
    }
  }

  manageKeys($event: Event, matButton: MatButton, keysType: BacnetDeviceKeysType): void {
    $event?.stopPropagation();

    const trigger = matButton._elementRef.nativeElement;
    if (this.popoverService.hasPopover(trigger)) {
      this.popoverService.hidePopover(trigger);
      return;
    }

    const keysControl = this.deviceFormGroup.get(keysType);
    const ctx = {
      keys: keysControl.value,
      keysType,
      panelTitle: BacnetDeviceKeysPanelTitleTranslationsMap.get(keysType),
      addKeyTitle: BacnetDeviceKeysAddKeyTranslationsMap.get(keysType),
      deleteKeyTitle: BacnetDeviceKeysDeleteKeyTranslationsMap.get(keysType),
      noKeysText: BacnetDeviceKeysNoKeysTextTranslationsMap.get(keysType),
      withReportStrategy: this.data.withReportStrategy,
    };
    this.keysPopupClosed = false;
    const dataKeysPanelPopover = this.popoverService.displayPopover(
      trigger,
      this.renderer,
      this.viewContainerRef,
      BacnetDeviceDataKeysPanelComponent,
      'leftBottom',
      false,
      null,
      ctx,
      {},
      {},
      {},
      true
    );
    dataKeysPanelPopover.tbComponentRef.instance.popover = dataKeysPanelPopover;
    dataKeysPanelPopover.tbComponentRef.instance.keysDataApplied.subscribe((keysData) => {
      dataKeysPanelPopover.hide();
      keysControl.patchValue(keysData);
      keysControl.markAsDirty();
      this.cdr.markForCheck();
    });
    dataKeysPanelPopover.tbHideStart.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.keysPopupClosed = true;
    });
  }
}
