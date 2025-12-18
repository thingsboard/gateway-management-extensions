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
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { SharedModule } from '@shared/public-api';
import { ControlValueAccessorBaseAbstract } from '../../../../shared/abstract/control-value-accessor-base.abstract';
import { ConnectorConfigValidationUtil } from '../../utils/connector-config-validation.util';
import { ConnectorType, GatewayVersion } from '../../../../shared/models/gateway.models';
import { JsonObjectEditComponent } from '@shared/components/json-object-edit.component';

@Component({
  selector: 'tb-connector-advanced-config',
  templateUrl: './connector-advanced-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ConnectorAdvancedConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ConnectorAdvancedConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class ConnectorAdvancedConfigComponent extends ControlValueAccessorBaseAbstract<any> implements AfterViewInit {

  @Input() generalTabContent: TemplateRef<any>;
  @Input() gatewayVersion: GatewayVersion = GatewayVersion.Legacy;
  @Input() type: ConnectorType;
  @ViewChild(JsonObjectEditComponent, {static: true}) jsonObjectEdit: JsonObjectEditComponent;

  private annotations = [];
  private annotationChanged = false;

  get jsonConfigFormControl(): FormControl {
    return this.form as FormControl;
  }

  protected initFormGroup(): FormControl {
    return this.fb.control({ value: {} }, [this.jsonConfigValidator()]);
  }

  ngAfterViewInit(): void {
    const editor = this.jsonObjectEdit?.['jsonEditor'];
    editor?.renderer.on('afterRender', () => {
      const currentAnnotations = editor.session.getAnnotations();
      if (!currentAnnotations.length && this.annotations.length) {
        this.annotationChanged = true;
      }
      if (this.annotationChanged) {
        const syntaxAnnotation = currentAnnotations.find(annotation => !annotation?.custom);
        this.annotationChanged = false;
        editor.session.setAnnotations(syntaxAnnotation ? [syntaxAnnotation, ...this.annotations] : this.annotations);
      }
    });
  }

  jsonConfigValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const editor = this.jsonObjectEdit?.['jsonEditor'];
      if (!editor || !control.valid) {
        return null;
      }
      const schemaErrors = ConnectorConfigValidationUtil.getSchemaErrors(editor.getValue(), this.type, this.gatewayVersion);
      this.annotations = schemaErrors.map(item => ({ ...item, custom: true }));
      this.annotationChanged = true;
      return !schemaErrors.length ? null : { invalidConfig: { valid: false } };
    };
  }
}
