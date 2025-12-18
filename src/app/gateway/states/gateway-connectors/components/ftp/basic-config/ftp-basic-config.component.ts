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
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import {
  FtpBasicConfig_v3_7_4,
  FtpParameters,
  FtpRequestMappingValue,
  FtpRequestsMapping,
} from '../../../models/public-api';
import { FtpBasicConfigAbstract } from './ftp-basic-config.abstract';
import { FtpParametersConfigComponent } from '../parameters/ftp-parameters-config.component';
import { FtpPathsTableComponent } from '../paths-table/ftp-paths-table.component';
import { FtpRequestMappingTableComponent } from '../request-mapping-table/ftp-request-mapping-table.component';

@Component({
  selector: 'tb-ftp-basic-config',
  templateUrl: './ftp-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FtpBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FtpBasicConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FtpParametersConfigComponent,
    FtpPathsTableComponent,
    FtpRequestMappingTableComponent,
  ],
})
export class FtpBasicConfigComponent extends FtpBasicConfigAbstract<FtpBasicConfig_v3_7_4> {

  protected mapConfigToFormValue(config: FtpBasicConfig_v3_7_4): FtpBasicConfig_v3_7_4 {
    return {
      parameters: config.parameters ?? {} as FtpParameters,
      paths: config.paths ?? [],
      requestsMapping: this.getRequestDataArray(config.requestsMapping as FtpRequestsMapping) as FtpRequestMappingValue[],
    };
  }

  protected getMappedValue(value: FtpBasicConfig_v3_7_4): FtpBasicConfig_v3_7_4 {
    return {
      parameters: value.parameters ?? {} as FtpParameters,
      paths: value.paths ?? [],
      requestsMapping: this.getRequestDataObject((value.requestsMapping ?? []) as FtpRequestMappingValue[]),
    };
  }
}
