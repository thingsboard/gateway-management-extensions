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
import { Component, ChangeDetectionStrategy, forwardRef, Input } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  RestAttributeRequest,
  RestMappingInfo,
  RestRequestMappingValue,
  RestRequestType,
  RestRequestTypesTranslationsMap,
  RestServerSideRpc
} from '../../../models/public-api';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule, TbTableDatasource } from '@shared/public-api';
import { AbstractDevicesConfigTableComponent } from '../../../abstract/public-api';
import { CommonModule } from '@angular/common';
import { isDefinedAndNotNull, isString } from '@core/public-api';
import { TruncateWithTooltipDirective } from '../../../../../shared/directives/public-api';
import { RestRequestsMappingDialogComponent } from '../requests-mapping-dialog/rest-requests-mapping-dialog.component';

@Component({
  selector: 'tb-rest-request-mapping-table',
  templateUrl: './rest-request-mapping-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, SharedModule, TruncateWithTooltipDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestRequestMappingTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RestRequestMappingTableComponent),
      multi: true
    }
  ]
})
export class RestRequestMappingTableComponent extends AbstractDevicesConfigTableComponent<RestRequestMappingValue> {

  @Input() defaultRequestUrl: string;

  readonly Object = Object;
  readonly RestRequestTypesTranslationsMap = RestRequestTypesTranslationsMap;

  protected getDatasource(): TbTableDatasource<RestRequestMappingValue> {
    return new MappingDatasource();
  }

  manageMapping($event: Event, index?: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    const withIndex = isDefinedAndNotNull(index);
    const { requestType = RestRequestType.ATTRIBUTE_REQUEST, requestValue = {} } = withIndex ? this.entityFormArray.at(index).value : {};
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
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        this.entityFormArray.removeAt(index);
        this.entityFormArray.markAsDirty();
      }
    });
  }

  protected override updateTableData(data: RestRequestMappingValue[], textSearch?: string): void {
    if (textSearch) {
      data = data.filter(item => {
        const details = this.getRequestDetails(item);
        return Object.values(item).some(value =>
          isString(value) && this.translate.instant(RestRequestTypesTranslationsMap.get(value)).toLowerCase().includes(textSearch.toLowerCase())
          || details?.toLowerCase().includes(textSearch.toLowerCase()));
      });
    }
    this.dataSource.loadData(data);
  }

  private getRequestDetails(item: RestRequestMappingValue): string {
    let details: string;
    switch (item.requestType) {
      case 'attributeUpdates':
        details = Object.values((item.requestValue as RestServerSideRpc).httpHeaders).join(', ');
        break;
      case 'serverSideRpc':
        details = (item.requestValue as RestServerSideRpc).methodFilter;
        break;
      default:
        details = (item.requestValue as RestAttributeRequest).endpoint;
        break;
    }
    return details;
  }

  override validate(): ValidationErrors | null {
    return null;
  }

  private getMappingDialog(
    value: RestRequestMappingValue,
    buttonTitle: string
  ): MatDialogRef<RestRequestsMappingDialogComponent> {
    return this.dialog.open<RestRequestsMappingDialogComponent, RestMappingInfo<RestRequestMappingValue>, RestRequestMappingValue>(RestRequestsMappingDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        value,
        buttonTitle,
        defaultRequestUrl: this.defaultRequestUrl,
        withReportStrategy: this.withReportStrategy,
      }
    });
  }
}

class MappingDatasource extends TbTableDatasource<RestRequestMappingValue> {
  constructor() {
    super();
  }
}
