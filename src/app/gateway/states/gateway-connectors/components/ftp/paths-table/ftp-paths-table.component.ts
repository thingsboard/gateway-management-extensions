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
import { Component, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule, TbTableDatasource } from '@shared/public-api';
import { AbstractDevicesConfigTableComponent } from '../../../abstract/public-api';
import { CommonModule } from '@angular/common';
import { isDefinedAndNotNull } from '@core/public-api';
import { TruncateWithTooltipDirective } from '../../../../../shared/directives/public-api';
import { FtpPathDialogComponent } from '../path-dialog/ftp-path-dialog.component';
import { FtpPath, FtpPathInfo } from '../../../models/public-api';

@Component({
  selector: 'tb-ftp-paths-table',
  templateUrl: './ftp-paths-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, SharedModule, TruncateWithTooltipDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FtpPathsTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FtpPathsTableComponent),
      multi: true
    }
  ],
})
export class FtpPathsTableComponent extends AbstractDevicesConfigTableComponent<FtpPath> {

  protected getDatasource(): TbTableDatasource<FtpPath> {
    return new FtpPathDatasource();
  }

  managePath($event: Event, index?: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    const withIndex = isDefinedAndNotNull(index);
    const value = withIndex ? this.entityFormArray.at(index).value : {};
    this.getMappingDialog(value, withIndex ? 'action.apply' : 'action.add').afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res) {
          if (withIndex) {
            this.entityFormArray.at(index).patchValue(res);
          } else {
            this.entityFormArray.push(this.fb.control(res));
          }
          this.entityFormArray.markAsDirty();
        }
      });
  }

  deletePath($event: Event, index: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('gateway.ftp.delete-path-title', { name: this.entityFormArray.at(index).value.path }),
      this.translate.instant('gateway.ftp.delete-path-description'),
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        this.entityFormArray.removeAt(index);
        this.entityFormArray.markAsDirty();
      }
    });
  }

  private getMappingDialog(
    value: FtpPath,
    buttonTitle: string
  ): MatDialogRef<FtpPathDialogComponent> {
    return this.dialog.open<FtpPathDialogComponent, FtpPathInfo, FtpPath>(FtpPathDialogComponent, {
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

class FtpPathDatasource extends TbTableDatasource<FtpPath> {
  constructor() {
    super();
  }
}
