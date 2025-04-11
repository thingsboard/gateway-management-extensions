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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState, deleteNullProperties } from '@core/public-api';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogComponent, helpBaseUrl, SharedModule } from '@shared/public-api';
import { Router } from '@angular/router';
import {
  EllipsisChipListDirective,
  noLeadTrailSpacesRegex,
  ReportStrategyComponent,
  ReportStrategyDefaultValue,
  SocketEncoding,
} from '../../../../../shared/public-api';
import {
  DevicesConfigMapping,
  MappingInfo,
  SocketDeviceKeys,
  SocketKeysAddKeyTranslationsMap,
  SocketKeysDeleteKeyTranslationsMap,
  SocketKeysNoKeysTextTranslationsMap,
  SocketKeysPanelTitleTranslationsMap,
  SocketValueKey,
} from '../../../models/public-api';
import { MatButton } from '@angular/material/button';
import { TbPopoverService } from '@shared/components/popover.service';
import { DeviceDataKeysPanelComponent } from '../device-data-keys-pannel/device-data-keys-panel.component';
import { CommonModule } from '@angular/common';
import { TbPopoverComponent } from '@shared/components/popover.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'tb-device-dialog',
  templateUrl: './device-dialog.component.html',
  styleUrls: ['./device-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
    ReportStrategyComponent,
  ]
})
export class DeviceDialogComponent extends DialogComponent<DeviceDialogComponent, DevicesConfigMapping> {

  deviceFormGroup = this.fb.group({
    address: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    deviceName: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    deviceType: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    encoding: [SocketEncoding.UTF8],
    telemetry: [[] as SocketDeviceKeys[]],
    attributes: [[] as SocketDeviceKeys[]],
    attributeRequests: [[] as SocketDeviceKeys[]],
    attributeUpdates: [[] as SocketDeviceKeys[]],
    serverSideRpc: [[] as SocketDeviceKeys[]],
    reportStrategy: [{value: null, disabled: !this.data.withReportStrategy}],
  });
  keysPopupClosed = true;

  readonly SocketValueKey = SocketValueKey;
  readonly socketDeviceHelpLink = helpBaseUrl + '/docs/iot-gateway/config/socket/#device-subsection';
  readonly socketEncoding = Object.values(SocketEncoding);
  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;

  private popoverComponent: TbPopoverComponent<DeviceDataKeysPanelComponent>;

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: MappingInfo,
              public dialogRef: MatDialogRef<DeviceDialogComponent, DevicesConfigMapping>,
              private fb: FormBuilder,
              private popoverService: TbPopoverService,
              private renderer: Renderer2,
              private viewContainerRef: ViewContainerRef,
              private destroyRef: DestroyRef,
              private cdr: ChangeDetectorRef,
  ) {
    super(store, router, dialogRef);

    this.deviceFormGroup.patchValue(this.data.value, { emitEvent: false })
  }

  cancel(): void {
    if (this.keysPopupClosed) {
      this.dialogRef.close(null);
    }
  }

  add(): void {
    if (this.deviceFormGroup.valid) {
      const value = this.deviceFormGroup.value;
      deleteNullProperties(value);
      this.dialogRef.close(value as DevicesConfigMapping);
    }
  }

  manageKeys($event: Event, matButton: MatButton, keysType: SocketValueKey): void {
    $event?.stopPropagation();
    if (this.popoverComponent && !this.popoverComponent.tbHidden) {
      this.popoverComponent.hide();
    }
    const trigger = matButton._elementRef.nativeElement;
    if (this.popoverService.hasPopover(trigger)) {
      this.popoverService.hidePopover(trigger);
      return;
    }

    const keysControl = this.deviceFormGroup.get(keysType);
    const ctx = {
      keys: keysControl.value,
      keysType,
      panelTitle: SocketKeysPanelTitleTranslationsMap.get(keysType),
      addKeyTitle: SocketKeysAddKeyTranslationsMap.get(keysType),
      deleteKeyTitle: SocketKeysDeleteKeyTranslationsMap.get(keysType),
      noKeysText: SocketKeysNoKeysTextTranslationsMap.get(keysType),
      withReportStrategy: this.data.withReportStrategy,
    };
    this.keysPopupClosed = false;
    this.popoverComponent = this.popoverService.displayPopover(
      trigger,
      this.renderer,
      this.viewContainerRef,
      DeviceDataKeysPanelComponent,
      'leftBottom',
      false,
      null,
      ctx,
      {},
      {},
      {},
      true
    );
    this.popoverComponent.tbComponentRef.instance.keysDataApplied.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((keysData: SocketDeviceKeys[]) => {
      this.popoverComponent.hide();
      keysControl.patchValue(keysData);
      keysControl.markAsDirty();
      this.cdr.markForCheck();
    });
    this.popoverComponent.tbHideStart.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.keysPopupClosed = true;
    });
  }
}
