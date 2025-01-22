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

import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
} from '@angular/core';
import {
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormGroup,
} from '@angular/forms';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { ControlValueAccessorBaseAbstract } from '../../../../../shared/abstract/public-api';
import { ResponseStatus, ResponseType, ResponseTypeTranslationsMap, RestResponse } from '../../../models/public-api';

@Component({
  selector: 'tb-rest-response-config',
  templateUrl: './rest-response-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestResponseConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RestResponseConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports:[
    CommonModule,
    SharedModule,
  ]
})
export class RestResponseConfigComponent extends ControlValueAccessorBaseAbstract<RestResponse> {

  readonly ResponseTypeTranslationsMap = ResponseTypeTranslationsMap;
  readonly ResponseType = ResponseType;
  readonly responseTypes = Object.values(ResponseType) as ResponseType[];
  readonly responseStatuses = Object.values(ResponseStatus) as ResponseStatus[];

  get responseConfigFormGroup(): UntypedFormGroup {
    return this.formGroup;
  }

  protected initFormGroup(): FormGroup {
    return this.fb.group({
      type: [ResponseType.DEFAULT],
      [ResponseType.CONST]: this.fb.group({
        successResponse: [ResponseStatus.OK],
        unsuccessfulResponse: [ResponseStatus.ERROR],
      }),
      [ResponseType.ADVANCED]: this.fb.group({
        responseExpected: [true],
        timeout: [],
        responseAttribute: ['']
      })
    });
  }

  protected override mapOnChangeValue({ type, ...config }: { type: ResponseType }): RestResponse {
    return { type, ...(config[type] ?? {}) };
  }
}
