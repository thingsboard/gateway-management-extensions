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
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { SharedModule } from '@shared/public-api';
import { FtpParameters, PortLimits, SecurityMode } from '../../../models/public-api';
import {
  ControlValueAccessorBaseAbstract,
  ErrorTooltipIconComponent,
  noLeadTrailSpacesRegex,
} from '../../../../../shared/public-api';
import { GatewayPortTooltipPipe } from '../../../pipes/public-api';
import { SecurityConfigComponent } from '../../security-config/security-config.component';
import { deleteNullProperties } from '@core/public-api';

@Component({
  selector: 'tb-ftp-parameters-config',
  templateUrl: './ftp-parameters-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FtpParametersConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FtpParametersConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    GatewayPortTooltipPipe,
    ErrorTooltipIconComponent,
    SecurityConfigComponent,
  ]
})
export class FtpParametersConfigComponent extends ControlValueAccessorBaseAbstract<FtpParameters> {

  readonly portLimits = PortLimits;
  readonly SecurityMode = SecurityMode;

  get parametersConfigFormGroup(): FormGroup {
    return this.formGroup;
  }

  protected override initFormGroup(): FormGroup {
    return this.fb.group({
      host: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      port: [null, [Validators.required, Validators.min(PortLimits.MIN), Validators.max(PortLimits.MAX)]],
      TLSSupport: [false],
      security: []
    });
  }

  protected override onWriteValue(parameters: FtpParameters): void {
    this.formGroup.reset(parameters, { emitEvent: false });
  }

  protected override mapOnChangeValue(value: FtpParameters): FtpParameters {
    deleteNullProperties(value);
    return value;
  }
}
