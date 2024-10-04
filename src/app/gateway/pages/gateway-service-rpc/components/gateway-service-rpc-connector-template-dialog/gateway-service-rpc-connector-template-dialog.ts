///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import { DialogComponent } from '@shared/public-api';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, UntypedFormControl, Validators } from '@angular/forms';
import { RPCTemplate, SaveRPCTemplateData } from '../../../../shared/public-api';

@Component({
  selector: 'tb-gateway-service-rpc-connector-template-dialog',
  templateUrl: './gateway-service-rpc-connector-template-dialog.html'
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
