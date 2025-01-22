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
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import { RestServerConfigComponent } from '../server-config/rest-server-config.component';
import { RestMappingTableComponent } from '../mapping-table/rest-mapping-table.component';
import { RestRequestMappingTableComponent } from '../request-mapping-table/rest-request-mapping-table.component';
import { RestBasicConfigAbstract } from './rest-basic-config.abstract';
import {
  RestBasicConfig_v3_7,
  RestRequestMappingValue,
  RestRequestsMapping,
  RestServerConfig
} from '../../../models/public-api';

@Component({
  selector: 'tb-rest-basic-config',
  templateUrl: './rest-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RestBasicConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    RestServerConfigComponent,
    RestMappingTableComponent,
    RestRequestMappingTableComponent,
  ],
})
export class RestBasicConfigComponent extends RestBasicConfigAbstract<RestBasicConfig_v3_7> {

  protected mapConfigToFormValue(config: RestBasicConfig_v3_7): RestBasicConfig_v3_7 {
    return {
      server: config.server ?? {} as RestServerConfig,
      mapping: config.mapping ?? [],
      requestsMapping: this.getRequestDataArray(config.requestsMapping as RestRequestsMapping),
    };
  }

  protected getMappedValue(value: RestBasicConfig_v3_7): RestBasicConfig_v3_7 {
    return {
      server: value.server ?? {} as RestServerConfig,
      mapping: value.mapping ?? [],
      requestsMapping: this.getRequestDataObject((value.requestsMapping ?? []) as RestRequestMappingValue[]),
    };
  }
}
