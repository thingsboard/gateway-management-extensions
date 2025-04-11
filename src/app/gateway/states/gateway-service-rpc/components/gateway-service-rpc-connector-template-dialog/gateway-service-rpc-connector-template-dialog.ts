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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import { DialogComponent, SharedModule } from '@shared/public-api';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, UntypedFormControl, Validators } from '@angular/forms';
import { RPCTemplate, SaveRPCTemplateData } from '../../models/public-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tb-gateway-service-rpc-connector-template-dialog',
  templateUrl: './gateway-service-rpc-connector-template-dialog.html',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ]
})

export class GatewayServiceRPCConnectorTemplateDialogComponent extends DialogComponent<GatewayServiceRPCConnectorTemplateDialogComponent, boolean> {

  config: {
    [key: string]: any;
  };
  templates: Array<RPCTemplate>;
  templateNameCtrl: FormControl;

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: SaveRPCTemplateData,
              public dialogRef: MatDialogRef<GatewayServiceRPCConnectorTemplateDialogComponent, boolean>,
              public fb: FormBuilder) {
    super(store, router, dialogRef);
    this.config = this.data.config;
    this.templates = this.data.templates;
    this.templateNameCtrl = this.fb.control('', [Validators.required]);
  }

  validateDuplicateName(c: UntypedFormControl) {
    const name = c.value.trim();
    return !!this.templates.find((template) => template.name === name);
  };

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.templateNameCtrl.setValue(this.templateNameCtrl.value.trim());
    if (this.templateNameCtrl.valid) this.dialogRef.close(this.templateNameCtrl.value);
  }
}
