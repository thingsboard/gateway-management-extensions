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
import { AppState, deleteNullProperties } from '@core/public-api';
import { DialogComponent, helpBaseUrl, SharedModule } from '@shared/public-api';
import { TbPopoverService } from '@shared/components/popover.service';
import {
  Attribute,
  ConnectorType,
  EllipsisChipListDirective,
  ErrorTooltipIconComponent,
  noLeadTrailSpacesRegex,
  numberInputPattern,
  ReportStrategyComponent,
  ReportStrategyDefaultValue,
  Timeseries,
} from '../../../../../shared/public-api';
import {
  FtpFileDataViewType,
  FtpReadModeType,
  MappingDataKey,
  MappingKeysAddKeyTranslationsMap,
  MappingKeysDeleteKeyTranslationsMap,
  MappingKeysNoKeysTextTranslationsMap,
  MappingKeysPanelTitleTranslationsMap,
  MappingKeysType,
} from '../../../models/public-api';
import { MappingDataKeysPanelComponent } from '../../mapping-data-keys-panel/mapping-data-keys-panel.component';
import { TbPopoverComponent } from '@shared/components/popover.component';
import { FtpPath, FtpPathInfo } from '../../../models/public-api';

@Component({
  selector: 'tb-ftp-path-dialog',
  templateUrl: './ftp-path-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ErrorTooltipIconComponent,
    ReportStrategyComponent,
    EllipsisChipListDirective,
  ]
})
export class FtpPathDialogComponent extends DialogComponent<FtpPathDialogComponent, FtpPath> {

  pathFormGroup = this.fb.group({
    devicePatternName: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    devicePatternType: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    delimiter: ['', [Validators.pattern(noLeadTrailSpacesRegex)]],
    path: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    txtFileDataView: [FtpFileDataViewType.TABLE],
    pollPeriod: [5, [Validators.required, Validators.pattern(numberInputPattern)]],
    readMode: [FtpReadModeType.FULL],
    maxFileSize: [5, [Validators.pattern(numberInputPattern)]],
    withSortingFiles: [false],
    reportStrategy: [],
    attributes: [[] as Attribute[]],
    timeseries: [[] as Timeseries[]],
  });
  keysPopupClosed = true;

  readonly helpLink = `${helpBaseUrl}/docs/iot-gateway/config/ftp/#section-paths`;
  readonly ConnectorType = ConnectorType;
  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;
  readonly ftpFileDataViewTypes = Object.values(FtpFileDataViewType) as FtpFileDataViewType[];
  readonly ftpReadModeTypes = Object.values(FtpReadModeType) as FtpReadModeType[];
  readonly MappingKeysType = MappingKeysType;

  private popoverComponent: TbPopoverComponent<MappingDataKeysPanelComponent>;

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: FtpPathInfo,
              public dialogRef: MatDialogRef<FtpPathDialogComponent, FtpPath>,
              private fb: FormBuilder,
              private popoverService: TbPopoverService,
              private renderer: Renderer2,
              private viewContainerRef: ViewContainerRef,
              private destroyRef: DestroyRef,
              private cd: ChangeDetectorRef
  ) {
    super(store, router, dialogRef);
    this.pathFormGroup.patchValue(this.data.value);
  }

  get converterAttributes(): Array<string> {
    return this.pathFormGroup.get('attributes').value.map((value: Attribute) => value.key);
  }

  get converterTelemetry(): Array<string> {
    return this.pathFormGroup.get('timeseries').value.map((value: Timeseries) => value.key);
  }

  cancel(): void {
    if (this.keysPopupClosed) {
      this.dialogRef.close(null);
    }
  }

  add(): void {
    if (this.pathFormGroup.valid) {
      const value = this.pathFormGroup.value;
      deleteNullProperties(value);
      this.dialogRef.close(value as FtpPath);
    }
  }

  manageKeys($event: Event, matButton: MatButton, keysType: MappingKeysType): void {
    $event?.stopPropagation();
    if (this.popoverComponent && !this.popoverComponent.tbHidden) {
      this.popoverComponent.hide();
    }
    const trigger = matButton._elementRef.nativeElement;
    if (this.popoverService.hasPopover(trigger)) {
      this.popoverService.hidePopover(trigger);
    } else {
      const keysControl = this.pathFormGroup.get(keysType);
      const ctx = {
        keys: keysControl.value,
        keysType,
        panelTitle: MappingKeysPanelTitleTranslationsMap.get(keysType),
        addKeyTitle: MappingKeysAddKeyTranslationsMap.get(keysType),
        deleteKeyTitle: MappingKeysDeleteKeyTranslationsMap.get(keysType),
        noKeysText: MappingKeysNoKeysTextTranslationsMap.get(keysType),
        withReportStrategy: this.data.withReportStrategy,
        connectorType: ConnectorType.FTP,
      };
      this.keysPopupClosed = false;
      this.popoverComponent = this.popoverService.displayPopover(trigger, this.renderer,
        this.viewContainerRef, MappingDataKeysPanelComponent, 'leftBottom', false, null,
        ctx,
        {},
        {}, {}, true);
      this.popoverComponent.tbComponentRef.instance.keysDataApplied.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((keysData: MappingDataKey[]) => {
        this.popoverComponent.hide();
        keysControl.patchValue(keysData);
        keysControl.markAsDirty();
        this.cd.markForCheck();
      });
      this.popoverComponent.tbHideStart.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.keysPopupClosed = true;
      });
    }
  }
}
