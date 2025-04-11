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
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule, TbTableDatasource } from '@shared/public-api';
import { AbstractDevicesConfigTableComponent } from '../../../abstract/public-api';
import { CommonModule } from '@angular/common';
import { isDefinedAndNotNull, isString } from '@core/public-api';
import { TruncateWithTooltipDirective } from '../../../../../shared/directives/public-api';
import { FtpRequestsMappingDialogComponent } from '../requests-mapping-dialog/ftp-requests-mapping-dialog.component';
import { filter } from 'rxjs/operators';
import {
  FtpAttributeUpdate,
  FtpMappingInfo,
  FtpRequestMappingData,
  FtpRequestMappingValue,
  FtpRequestType,
  FtpRequestTypesTranslationsMap,
  FtpServerSideRpc
} from '../../../models/ftp.models';

@Component({
  selector: 'tb-ftp-request-mapping-table',
  templateUrl: './ftp-request-mapping-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, SharedModule, TruncateWithTooltipDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FtpRequestMappingTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FtpRequestMappingTableComponent),
      multi: true
    }
  ]
})
export class FtpRequestMappingTableComponent extends AbstractDevicesConfigTableComponent<FtpRequestMappingValue> {

  readonly FtpRequestTypesTranslationsMap = FtpRequestTypesTranslationsMap;
  readonly FtpRequestType = FtpRequestType;

  protected getDatasource(): TbTableDatasource<FtpRequestMappingValue> {
    return new MappingDatasource();
  }

  manageMapping($event: Event, index?: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    const withIndex = isDefinedAndNotNull(index);
    const { requestType = FtpRequestType.ATTRIBUTE_UPDATE, requestValue = {} } = withIndex ? this.entityFormArray.at(index).value : {};
    this.getMappingDialog({ requestType, ...requestValue }, withIndex ? 'action.apply' : 'action.add').afterClosed()
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
      this.translate.instant('gateway.delete-mapping-title', { name: this.getRequestDetails(this.entityFormArray.at(index).value) }),
      this.translate.instant('gateway.delete-mapping-description'),
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.entityFormArray.removeAt(index);
      this.entityFormArray.markAsDirty();
    });
  }

  protected override updateTableData(data: FtpRequestMappingValue[], textSearch?: string): void {
    if (textSearch) {
      data = data.filter(item => {
        const details = this.getRequestDetails(item);
        return Object.values(item).some(value =>
          isString(value) && this.translate.instant(FtpRequestTypesTranslationsMap.get(value)).toLowerCase().includes(textSearch.toLowerCase())
          || details?.toLowerCase().includes(textSearch.toLowerCase()));
      });
    }
    this.dataSource.loadData(data);
  }

  private getRequestDetails(item: FtpRequestMappingValue): string {
    if (item.requestType === FtpRequestType.SERVER_SIDE_RPC) {
      return (item.requestValue as FtpServerSideRpc).methodFilter;
    } else {
      return (item.requestValue as FtpAttributeUpdate).path;
    }
  }

  override validate(): ValidationErrors | null {
    return null;
  }

  private getMappingDialog(
    value: FtpRequestMappingData,
    buttonTitle: string
  ): MatDialogRef<FtpRequestsMappingDialogComponent> {
    return this.dialog.open<FtpRequestsMappingDialogComponent, FtpMappingInfo, FtpRequestMappingValue>(FtpRequestsMappingDialogComponent, {
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

class MappingDatasource extends TbTableDatasource<FtpRequestMappingValue> {
  constructor() {
    super();
  }
}
