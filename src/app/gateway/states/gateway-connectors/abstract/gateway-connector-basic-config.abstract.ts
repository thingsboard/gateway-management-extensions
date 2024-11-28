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

import { AfterViewInit, Directive, EventEmitter, inject, Input, Output, TemplateRef } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { ControlValueAccessorBaseAbstract } from '../../../shared/abstract/public-api';

@Directive()
export abstract class GatewayConnectorBasicConfigDirective<InputBasicConfig, OutputBasicConfig>
  extends ControlValueAccessorBaseAbstract<OutputBasicConfig>
  implements AfterViewInit {

  @Input() generalTabContent: TemplateRef<any>;
  @Input() withReportStrategy = true;

  @Output() initialized = new EventEmitter<void>();

  protected fb = inject(FormBuilder);
  protected onChange!: (value: OutputBasicConfig) => void;

  get basicFormGroup(): UntypedFormGroup {
    return this.formGroup;
  }

  ngAfterViewInit(): void {
    this.initialized.emit();
  }

  protected override onWriteValue(config: OutputBasicConfig): void {
    this.formGroup.setValue(this.mapConfigToFormValue(config), { emitEvent: false });
  }

  protected override mapOnChangeValue(config: InputBasicConfig): OutputBasicConfig {
    return this.getMappedValue(config);
  }

  protected override initFormGroup(): UntypedFormGroup {
    return this.initBasicFormGroup();
  }

  protected abstract mapConfigToFormValue(config: OutputBasicConfig): InputBasicConfig;
  protected abstract getMappedValue(config: InputBasicConfig): OutputBasicConfig;
  protected abstract initBasicFormGroup(): UntypedFormGroup;
}
