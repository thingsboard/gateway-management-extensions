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

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import { DialogComponent, helpBaseUrl, SharedModule } from '@shared/public-api';
import {
  ErrorTooltipIconComponent,
  noLeadTrailSpacesRegex,
} from '../../../../../shared/public-api';
import {
  FtpAttributeUpdate,
  FtpAttributeUpdateWritingMode,
  FtpMappingInfo,
  FtpRequestMappingData,
  FtpRequestMappingValue,
  FtpRequestType,
  FtpRequestTypesTranslationsMap,
  FtpServerSideRpcMethodFilter,
} from '../../../models/public-api';

@Component({
  selector: 'tb-ftp-requests-mapping-dialog',
  templateUrl: './ftp-requests-mapping-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ErrorTooltipIconComponent,
  ],
})
export class FtpRequestsMappingDialogComponent extends DialogComponent<FtpRequestsMappingDialogComponent, FtpRequestMappingValue> {

  readonly requestTypes = Object.values(FtpRequestType) as FtpRequestType[];
  readonly helpLink = `${helpBaseUrl}/docs/iot-gateway/config/ftp/#section-attributeupdates`;
  readonly FtpRequestTypesTranslationsMap = FtpRequestTypesTranslationsMap;
  readonly FtpRequestType = FtpRequestType;
  readonly ftpAttributeUpdateWritingModes = Object.values(FtpAttributeUpdateWritingMode);
  readonly FtpServerSideRpcMethodFilters = Object.values(FtpServerSideRpcMethodFilter);

  mappingFormGroup = this.fb.group({
    requestType: [FtpRequestType.ATTRIBUTE_UPDATE],
    deviceNameFilter: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    attributeFilter: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    methodFilter: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    valueExpression: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    writingMode: [FtpAttributeUpdateWritingMode.WRITE],
    methodWritingMode: [FtpServerSideRpcMethodFilter.read],
    path: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
  });
  keysPopupClosed = true;

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: FtpMappingInfo,
              public dialogRef: MatDialogRef<FtpRequestsMappingDialogComponent, FtpRequestMappingValue>,
              private fb: FormBuilder,
  ) {
    super(store, router, dialogRef);

    this.setInitialValue();
    this.observeRequestTypeChange();
  }

  cancel(): void {
    if (this.keysPopupClosed) {
      this.dialogRef.close(null);
    }
  }

  add(): void {
    if (this.mappingFormGroup.valid) {
      const { requestType, ...requestValue } = this.mappingFormGroup.value;
      if (requestType === FtpRequestType.SERVER_SIDE_RPC) {
        requestValue.methodFilter = requestValue.methodWritingMode;
        delete requestValue.methodWritingMode;
      }
      this.dialogRef.close({ requestType, requestValue: requestValue as FtpRequestMappingData });
    }
  }

  private observeRequestTypeChange(): void {
    this.toggleFieldsByRequestType(this.mappingFormGroup.get('requestType').value);
    this.mappingFormGroup.get('requestType').valueChanges
     .pipe(takeUntilDestroyed())
     .subscribe((requestType: FtpRequestType) => this.toggleFieldsByRequestType(requestType));
  }

  private toggleFieldsByRequestType(requestType: FtpRequestType): void {
    const isRpc = requestType === FtpRequestType.SERVER_SIDE_RPC;
    this.mappingFormGroup.get('attributeFilter')[isRpc? 'disable' : 'enable']({emitEvent: false});
    this.mappingFormGroup.get('writingMode')[isRpc? 'disable' : 'enable']({emitEvent: false});
    this.mappingFormGroup.get('path')[isRpc? 'disable' : 'enable']({emitEvent: false});
    this.mappingFormGroup.get('methodFilter')[isRpc? 'enable' : 'disable']({emitEvent: false});
    this.mappingFormGroup.get('methodWritingMode')[isRpc? 'enable' : 'disable']({emitEvent: false});
  }

  private setInitialValue(): void {
    const { requestType, writingMode, ...value } = this.data.value;
    if (requestType === FtpRequestType.SERVER_SIDE_RPC) {
      this.mappingFormGroup.patchValue({ requestType, methodWritingMode: writingMode as FtpServerSideRpcMethodFilter, ...value }, { emitEvent: false });
    } else {
      this.mappingFormGroup.patchValue(this.data.value as FtpAttributeUpdate, { emitEvent: false });
    }
  }
}
