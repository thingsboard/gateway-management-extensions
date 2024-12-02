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
import { Component, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DeviceConfigInfo, DevicesConfigMapping } from '../../../models/public-api';
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

  protected getDatasource(): TbTableDatasource<DevicesConfigMapping> {
    return new DevicesDatasource();
  }

  manageDevices($event: Event, index?: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    const withIndex = isDefinedAndNotNull(index);
    const value = withIndex ? this.entityFormGroup.at(index).value : {};
    this.getDeviceDialog(value, withIndex ? 'action.apply' : 'action.add').afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          if (withIndex) {
            this.entityFormGroup.at(index).patchValue(res);
          } else {
            this.entityFormGroup.push(this.fb.control(res));
          }
          this.entityFormGroup.markAsDirty();
        }
      });
  }

  deleteDevice($event: Event, index: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('gateway.delete-device-title'),
      '',
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        this.entityFormGroup.removeAt(index);
        this.entityFormGroup.markAsDirty();
      }
    });
  }

  private getDeviceDialog(
    value: DevicesConfigMapping,
    buttonTitle: string
  ): MatDialogRef<BacnetDeviceDialogComponent> {
    return this.dialog.open<BacnetDeviceDialogComponent, DeviceConfigInfo, DevicesConfigMapping>(BacnetDeviceDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        value,
        buttonTitle,
        withReportStrategy: this.withReportStrategy,
      }
    });
  }
}

class DevicesDatasource extends TbTableDatasource<DevicesConfigMapping> {
  constructor() {
    super();
  }
}