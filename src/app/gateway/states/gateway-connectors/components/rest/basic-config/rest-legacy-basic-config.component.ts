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
import { RestServerConfigComponent } from '../server-config/rest-server-config.component';
import { RestMappingTableComponent } from '../mapping-table/rest-mapping-table.component';
import { RestRequestMappingTableComponent } from '../request-mapping-table/rest-request-mapping-table.component';
import { RestBasicConfigAbstract } from './rest-basic-config.abstract';
import {
  RestBasicConfig_v3_7_2,
  RestLegacyBasicConfig,
  RestRequestMappingValue,
  RestRequestsMapping,
  RestServerConfig
} from '../../../models/public-api';
import { RestVersionMappingUtil } from '../../../utils/public-api';

@Component({
  selector: 'tb-rest-legacy-basic-config',
  templateUrl: './rest-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestLegacyBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RestLegacyBasicConfigComponent),
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
export class RestLegacyBasicConfigComponent extends RestBasicConfigAbstract<RestLegacyBasicConfig> {

  protected mapConfigToFormValue(
    { attributeRequests = [], attributeUpdates = [], serverSideRpc = [], mapping = [], ...config }: RestLegacyBasicConfig
  ): RestBasicConfig_v3_7_2 {
    return {
      server: {...(config ?? {})} as RestServerConfig,
      mapping: RestVersionMappingUtil.mapMappingToUpgradedVersion(mapping),
      requestsMapping: this.getRequestDataArray({ attributeRequests, attributeUpdates, serverSideRpc }),
    };
  }

  protected getMappedValue({ requestsMapping, mapping = [], server = {} as RestServerConfig }: RestBasicConfig_v3_7_2): RestLegacyBasicConfig {
    this.updateDefaultUrl(server);
    const { attributeRequests = [], attributeUpdates = [], serverSideRpc = [] } = this.getRequestDataObject(requestsMapping as RestRequestMappingValue[]) as RestRequestsMapping;
    return {
      ...server,
      mapping: RestVersionMappingUtil.mapMappingToDowngradedVersion(mapping),
      attributeRequests,
      attributeUpdates,
      serverSideRpc,
    };
  }
}
