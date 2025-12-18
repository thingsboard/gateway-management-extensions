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
  FtpLegacyBasicConfig,
  FtpParameters,
  FtpRequestMappingValue,
  FtpRequestsMapping,
} from '../../../models/public-api';
import { FtpVersionMappingUtil } from '../../../utils/public-api';
import { FtpBasicConfigAbstract } from './ftp-basic-config.abstract';
import { FtpParametersConfigComponent } from '../parameters/ftp-parameters-config.component';
import { FtpPathsTableComponent } from '../paths-table/ftp-paths-table.component';
import { FtpRequestMappingTableComponent } from '../request-mapping-table/ftp-request-mapping-table.component';

@Component({
  selector: 'tb-ftp-legacy-basic-config',
  templateUrl: './ftp-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FtpLegacyBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FtpLegacyBasicConfigComponent),
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
export class FtpLegacyBasicConfigComponent extends FtpBasicConfigAbstract<FtpLegacyBasicConfig> {

  protected mapConfigToFormValue(
    { attributeUpdates = [], serverSideRpc = [], paths = [], ...config }: FtpLegacyBasicConfig
  ): FtpBasicConfig_v3_7_4 {
    return {
      parameters: {...(config ?? {})} as FtpParameters,
      paths: FtpVersionMappingUtil.mapPathsToUpgradedVersion(paths ?? []),
      requestsMapping: this.getRequestDataArray({ attributeUpdates, serverSideRpc }),
    };
  }

  protected getMappedValue({ requestsMapping, paths = [], parameters = {} as FtpParameters }: FtpBasicConfig_v3_7_4): FtpLegacyBasicConfig {
    const { attributeUpdates = [], serverSideRpc = [] } = this.getRequestDataObject(requestsMapping as FtpRequestMappingValue[]) as FtpRequestsMapping;
    return {
      ...parameters,
      paths: FtpVersionMappingUtil.mapPathsToDowngradedVersion(paths ?? []),
      attributeUpdates,
      serverSideRpc,
    };
  }
}
