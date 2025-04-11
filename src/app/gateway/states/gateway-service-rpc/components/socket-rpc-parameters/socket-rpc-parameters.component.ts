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
  ChangeDetectionStrategy,
  Component,
  forwardRef,
} from '@angular/core';
import {
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { noLeadTrailSpacesRegex, SocketEncoding } from '../../../../shared/models/public-api';
import {
  RPCTemplateConfigSocket,
  SocketEncodings,
  SocketMethodProcessings,
  SocketMethodProcessingsTranslates
} from '../../models/public-api';
import { ControlValueAccessorBaseAbstract } from '../../../../shared/abstract/public-api';

@Component({
  selector: 'tb-gateway-socket-rpc-parameters',
  templateUrl: './socket-rpc-parameters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SocketRpcParametersComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SocketRpcParametersComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class SocketRpcParametersComponent extends ControlValueAccessorBaseAbstract<RPCTemplateConfigSocket> {

  readonly SocketMethodProcessingsTranslates = SocketMethodProcessingsTranslates;
  readonly socketMethodProcessings = Object.values(SocketMethodProcessings) as SocketMethodProcessings[];
  readonly socketEncoding = Object.values(SocketEncoding) as SocketEncoding[];

  protected initFormGroup(): FormGroup {
    return this.fb.group({
      methodRPC: [null, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      methodProcessing: [SocketMethodProcessings.WRITE, [Validators.required]],
      encoding: [SocketEncodings.UTF_8, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      withResponse: [false, []]
    });
  }
}
