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
import { Component, ChangeDetectionStrategy, forwardRef, booleanAttribute, Input } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BacnetDeviceConfig,
  BacnetDeviceConfigInfo,
  DevicesConfigMapping
} from '../../../models/public-api';
import { BacnetDeviceDialogComponent } from '../device-dialog/bacnet-device-dialog.component';
import { take } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule, TbTableDatasource } from '@shared/public-api';
import { AbstractDevicesConfigTableComponent } from '../../../abstract/public-api';
import { CommonModule } from '@angular/common';
import { isDefinedAndNotNull } from '@core/public-api';
import { TruncateWithTooltipDirective } from '../../../../../shared/directives/public-api';

@Component({
  selector: 'tb-bacnet-devices-config-table',
  templateUrl: './bacnet-devices-config-table.component.html',
  styleUrls: ['./bacnet-devices-config-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, SharedModule, TruncateWithTooltipDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BacnetDevicesConfigTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BacnetDevicesConfigTableComponent),
      multi: true
    }
  ]
})
export class BacnetDevicesConfigTableComponent extends AbstractDevicesConfigTableComponent<DevicesConfigMapping> {

  @Input({ transform: booleanAttribute }) hideNewFields = false;

  protected getDatasource(): TbTableDatasource<DevicesConfigMapping> {
    return new DevicesDatasource();
  }

  manageDevices($event: Event, device?: BacnetDeviceConfig): void {
    if ($event) {
      $event.stopPropagation();
    }
    const withDevice = isDefinedAndNotNull(device);
    this.getDeviceDialog(device, withDevice ? 'action.apply' : 'action.add').afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          if (withDevice) {
            const originalIndex = this.entityFormArray.value.findIndex(item => JSON.stringify(item) === JSON.stringify(device));
            this.entityFormArray.at(originalIndex).patchValue(res);
          } else {
            this.entityFormArray.push(this.fb.control(res));
          }
          this.entityFormArray.markAsDirty();
        }
      });
  }

  deleteDevice($event: Event, device: BacnetDeviceConfig): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('gateway.delete-device-title', { name: device.deviceInfo?.deviceNameExpression }),
      this.translate.instant('gateway.delete-device-description'),
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        const originalIndex = this.entityFormArray.value.findIndex(item => JSON.stringify(item) === JSON.stringify(device));
        this.entityFormArray.removeAt(originalIndex);
        this.entityFormArray.markAsDirty();
      }
    });
  }

  private getDeviceDialog(
    value: BacnetDeviceConfig,
    buttonTitle: string
  ): MatDialogRef<BacnetDeviceDialogComponent> {
    return this.dialog.open<BacnetDeviceDialogComponent, BacnetDeviceConfigInfo, BacnetDeviceConfig>(BacnetDeviceDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        value,
        buttonTitle,
        withReportStrategy: this.withReportStrategy,
        hideNewFields: this.hideNewFields,
      }
    });
  }

  protected override updateTableData(data: DevicesConfigMapping[], textSearch?: string): void {
    if (textSearch) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(textSearch.toLowerCase())
          || value.deviceNameExpression?.toString().toLowerCase().includes(textSearch.toLowerCase())
        )
      );
    }
    this.dataSource.loadData(data);
  }
}

class DevicesDatasource extends TbTableDatasource<DevicesConfigMapping> {
  constructor() {
    super();
  }
}
