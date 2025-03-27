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
import { RestMapping, RestMappingInfo } from '../../../models/public-api';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule, TbTableDatasource } from '@shared/public-api';
import { AbstractDevicesConfigTableComponent } from '../../../abstract/public-api';
import { CommonModule } from '@angular/common';
import { isDefinedAndNotNull } from '@core/public-api';
import { TruncateWithTooltipDirective, EllipsisChipListDirective } from '../../../../../shared/directives/public-api';
import { RestMappingDialogComponent } from '../mapping-dialog/rest-mapping-dialog.component';

@Component({
  selector: 'tb-rest-mapping-table',
  templateUrl: './rest-mapping-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, SharedModule, TruncateWithTooltipDirective, EllipsisChipListDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestMappingTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RestMappingTableComponent),
      multi: true
    }
  ],
  styles: [`
    .http-method-label {
      font-size: 12px;
    }
  `]
})
export class RestMappingTableComponent extends AbstractDevicesConfigTableComponent<RestMapping> {

  protected getDatasource(): TbTableDatasource<RestMapping> {
    return new MappingDatasource();
  }

  manageMapping($event: Event, index?: number): void {
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

  deleteMapping($event: Event, index: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('gateway.delete-mapping-title', { name: this.entityFormArray.at(index).value.endpoint }),
      this.translate.instant('gateway.delete-mapping-description'),
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

  protected override updateTableData(data: RestMapping[], textSearch?: string): void {
    if (textSearch) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(textSearch.toLowerCase())
          || value.type?.toLowerCase().includes(textSearch.toLowerCase())
        )
      );
    }
    this.dataSource.loadData(data);
  }

  private getMappingDialog(
    value: RestMapping,
    buttonTitle: string
  ): MatDialogRef<RestMappingDialogComponent> {
    return this.dialog.open<RestMappingDialogComponent, RestMappingInfo, RestMapping>(RestMappingDialogComponent, {
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

class MappingDatasource extends TbTableDatasource<RestMapping> {
  constructor() {
    super();
  }
}
