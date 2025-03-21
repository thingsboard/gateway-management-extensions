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

import { Component, DestroyRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FormBuilder, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { DialogComponent, helpBaseUrl, SharedModule } from '@shared/public-api';
import { Router } from '@angular/router';
import { GatewayConfigCommand, noLeadTrailSpacesRegex, numberInputPattern } from '../../../../shared/public-api';
import { AppState, DialogService } from '@core/public-api';
import { CommonModule } from '@angular/common';
import { EditCustomCommandDialogData, EditCustomCommandDialogResult } from '../../models/public-api';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { takeWhile } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'tb-edit-custom-command-dialog',
  templateUrl: './edit-custom-command-dialog.component.html',
  styleUrls: ['./edit-custom-command-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class EditCustomCommandDialogComponent extends DialogComponent<EditCustomCommandDialogComponent, EditCustomCommandDialogResult> {

  readonly commandHelpLink = helpBaseUrl + '/docs/iot-gateway/configuration/#subsection-statistics';

  editCommandFormGroup = this.fb.group({
    attributeOnGateway: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex), this.uniqNameRequired()]],
    command: ['', [Validators.required, Validators.pattern(/^(?=\S).*\S$/)]],
    timeout: [10, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern), Validators.pattern(/^[^.\s]+$/)]],
    installCmd: ['', Validators.pattern(noLeadTrailSpacesRegex)]
  });

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: EditCustomCommandDialogData,
              public dialogRef: MatDialogRef<EditCustomCommandDialogComponent, EditCustomCommandDialogResult>,
              private fb: FormBuilder,
              private dialogService: DialogService,
              private translate: TranslateService,
              private destroyRef: DestroyRef,
  ) {
    super(store, router, dialogRef);
    this.editCommandFormGroup.patchValue(this.data.command, { emitEvent: false });
  }

  cancel(): void {
    this.confirmConnectorChange()
      .pipe(takeWhile(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.dialogRef.close(null));
  }

  apply(): void {
    this.dialogRef.close({ current: this.editCommandFormGroup.value as GatewayConfigCommand, prev: this.data.command });
  }

  private confirmConnectorChange(): Observable<boolean> {
    if (this.editCommandFormGroup.dirty) {
      return this.dialogService.confirm(
        this.translate.instant('gateway.statistics.change-command-title'),
        this.translate.instant('gateway.statistics.change-command-text'),
        this.translate.instant('action.no'),
        this.translate.instant('action.yes'),
        true
      );
    }
    return of(true);
  }

  private uniqNameRequired(): ValidatorFn {
    return (control: UntypedFormControl) => {
      const newName = control.value?.trim().toLowerCase();
      const isDuplicate = newName
          && this.data.existingCommands.some((command) => command.toLowerCase() === newName)
          && newName !== this.data.command.attributeOnGateway.toLowerCase();

      return isDuplicate ? { duplicateName: { valid: false } } : null;
    };
  }
}
