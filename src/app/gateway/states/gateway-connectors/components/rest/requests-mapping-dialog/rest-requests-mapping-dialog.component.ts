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

import { AppState } from '@core/public-api';
import { DialogComponent, helpBaseUrl, SharedModule } from '@shared/public-api';
import { TbPopoverService } from '@shared/components/popover.service';

import {
  EllipsisChipListDirective,
  ErrorTooltipIconComponent,
  HTTPMethods,
  noLeadTrailSpacesRegex,
  numberInputPattern,
} from '../../../../../shared/public-api';
import {
  RestMappingInfo, RestRequestMappingData, RestRequestMappingValue,
  RestRequestsScopeType,
  RestRequestType,
  RestRequestTypeFieldsMap,
  RestRequestTypesTranslationsMap,
  SecurityMode,
  SecurityType,
} from '../../../models/public-api';
import { SecurityConfigComponent } from '../../security-config/security-config.component';
import { RestHttpHeadersPanelComponent } from '../http-headers-panel/rest-http-headers-panel.component';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'tb-rest-requests-mapping-dialog',
  templateUrl: './rest-requests-mapping-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
    SecurityConfigComponent,
    ErrorTooltipIconComponent,
  ]
})
export class RestRequestsMappingDialogComponent extends DialogComponent<RestRequestsMappingDialogComponent, RestRequestMappingValue> {

  readonly requestTypes = Object.values(RestRequestType) as RestRequestType[];
  readonly requestsScopeType = Object.values(RestRequestsScopeType) as RestRequestsScopeType[];
  readonly httpMethods = Object.values(HTTPMethods) as HTTPMethods[];
  readonly helpLink = `${helpBaseUrl}/docs/iot-gateway/config/rest/#attribute-request-section`;
  readonly RestRequestTypesTranslationsMap = RestRequestTypesTranslationsMap;
  readonly SecurityMode = SecurityMode;
  readonly RestRequestType = RestRequestType;

  mappingFormGroup = this.fb.group({
    requestType: [RestRequestType.ATTRIBUTE_REQUEST],
    endpoint: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    HTTPMethods: [[HTTPMethods.POST], [Validators.required]],
    type: [RestRequestsScopeType.Shared],
    security: [{ type: SecurityType.ANONYMOUS }],
    timeout: [null, [Validators.min(1), Validators.pattern(numberInputPattern)]],
    deviceNameExpression: ['', [Validators.pattern(noLeadTrailSpacesRegex)]],
    attributeNameExpression: ['', [Validators.pattern(noLeadTrailSpacesRegex)]],
    SSLVerify: [false],
    deviceNameFilter: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    methodFilter: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    attributeFilter: ['', [Validators.pattern(noLeadTrailSpacesRegex)]],
    requestUrlExpression: [this.data.defaultRequestUrl, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    valueExpression: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    responseTimeout: [null, [Validators.min(1), Validators.pattern(numberInputPattern)]],
    tries: [null, [Validators.min(1), Validators.pattern(numberInputPattern)]],
    allowRedirects: [false],
    httpHeaders: [{}]
  });
  keysPopupClosed = true;

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: RestMappingInfo<RestRequestMappingValue>,
              public dialogRef: MatDialogRef<RestRequestsMappingDialogComponent, RestRequestMappingValue>,
              private fb: FormBuilder,
              private popoverService: TbPopoverService,
              private renderer: Renderer2,
              private viewContainerRef: ViewContainerRef,
              private cdr: ChangeDetectorRef,
              private destroyRef: DestroyRef,
  ) {
    super(store, router, dialogRef);

    this.mappingFormGroup.patchValue(this.data.value, { emitEvent: false });
    this.observeRequestTypeChange();
    this.toggleFieldsByRequestType(this.mappingFormGroup.get('requestType').value);
  }

  get requestType(): RestRequestType {
    return this.mappingFormGroup.get('requestType').value;
  }

  cancel(): void {
    if (this.keysPopupClosed) {
      this.dialogRef.close(null);
    }
  }

  add(): void {
    if (this.mappingFormGroup.valid) {
      const { requestType, ...requestValue } = this.mappingFormGroup.value as RestRequestMappingData;
      this.dialogRef.close({ requestType, requestValue });
    }
  }

  manageKeys($event: Event, matButton: MatButton): void {
    $event.stopPropagation();
    const trigger = matButton._elementRef.nativeElement;
    if (this.popoverService.hasPopover(trigger)) {
      this.popoverService.hidePopover(trigger);
      return;
    }
    if (this.popoverService.hasPopover(trigger)) {
      this.popoverService.hidePopover(trigger);
    }

    this.keysPopupClosed = false;
    const dataKeysPanelPopover = this.popoverService.displayPopover(
      trigger,
      this.renderer,
      this.viewContainerRef,
      RestHttpHeadersPanelComponent,
      'leftBottom',
      false,
      null,
      {
        keys: this.mappingFormGroup.get('httpHeaders').value,
        withReportStrategy: this.data.withReportStrategy,
      },
      {},
      {},
      {},
      true
    );
    dataKeysPanelPopover.tbComponentRef.instance.popover = dataKeysPanelPopover;
    dataKeysPanelPopover.tbComponentRef.instance.keysDataApplied.subscribe(keysData => {
      dataKeysPanelPopover.hide();
      this.mappingFormGroup.get('httpHeaders').patchValue(keysData as any);
      this.mappingFormGroup.get('httpHeaders').markAsDirty();
      this.cdr.markForCheck();
    });
    dataKeysPanelPopover.tbHideStart.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.keysPopupClosed = true;
    });
  }

  private observeRequestTypeChange(): void {
    this.mappingFormGroup.get('requestType').valueChanges
     .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
     .subscribe((requestType: RestRequestType) => {
        this.toggleFieldsByRequestType(requestType);
      });
  }

  private toggleFieldsByRequestType(requestType: RestRequestType): void {
    this.mappingFormGroup.disable({emitEvent: false});
    RestRequestTypeFieldsMap.get('all').forEach(field => this.mappingFormGroup.get(field).enable({emitEvent: false}));
    RestRequestTypeFieldsMap.get(requestType).forEach(field => this.mappingFormGroup.get(field).enable({emitEvent: false}));
  }
}
