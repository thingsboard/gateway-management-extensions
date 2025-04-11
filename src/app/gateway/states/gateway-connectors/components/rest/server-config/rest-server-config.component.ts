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
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { SharedModule } from '@shared/public-api';
import { PortLimits, RestServerConfig } from '../../../models/public-api';
import {
  ControlValueAccessorBaseAbstract,
  ErrorTooltipIconComponent,
  noLeadTrailSpacesRegex,
  TruncateWithTooltipDirective
} from '../../../../../shared/public-api';
import { GatewayPortTooltipPipe } from '../../../pipes/public-api';
import { deleteNullProperties } from '@core/public-api';

@Component({
  selector: 'tb-rest-server-config',
  templateUrl: './rest-server-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestServerConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RestServerConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    GatewayPortTooltipPipe,
    TruncateWithTooltipDirective,
    ErrorTooltipIconComponent,
  ]
})
export class RestServerConfigComponent extends ControlValueAccessorBaseAbstract<RestServerConfig> {

  readonly portLimits = PortLimits;

  get serverConfigFormGroup(): UntypedFormGroup {
    return this.formGroup;
  }

  protected override initFormGroup(): UntypedFormGroup {
    return this.fb.group({
      host: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      port: [null, [Validators.required, Validators.min(PortLimits.MIN), Validators.max(PortLimits.MAX)]],
      SSL: [false],
      security: this.fb.group({
        cert: [''],
        key: [''],
      })
    });
  }

  protected override mapOnChangeValue(value: RestServerConfig): RestServerConfig {
    deleteNullProperties(value);
    return value;
  }

  protected override onWriteValue(serverConfig: RestServerConfig): void {
    this.formGroup.reset(serverConfig, { emitEvent: false });
  }
}
