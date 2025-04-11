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

import { Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isObject } from '@core/public-api';
import { FtpBasicConfig_v3_7_4, FtpRequestMappingValue, FtpRequestsMapping } from '../../../models/public-api';
import { GatewayConnectorBasicConfigDirective } from '../../../abstract/public-api';

@Directive()
export abstract class FtpBasicConfigAbstract<BasicConfig>
  extends GatewayConnectorBasicConfigDirective<FtpBasicConfig_v3_7_4, BasicConfig> {

  protected override initBasicFormGroup(): FormGroup {
    return this.fb.group({
      parameters: [],
      paths: [],
      requestsMapping: [],
    });
  }

  protected getRequestDataArray(value: FtpRequestsMapping): FtpRequestMappingValue[] {
    const mappingConfigs = [];

    if (isObject(value)) {
      Object.keys(value).forEach((configKey: string) => {
        for (const mapping of value[configKey]) {
          mappingConfigs.push({
            requestType: configKey,
            requestValue: mapping
          });
        }
      });
    }

    return mappingConfigs;
  }

  protected getRequestDataObject(array: FtpRequestMappingValue[]): FtpRequestsMapping {
    return array.reduce((result, { requestType, requestValue }) => {
      result[requestType]?.push(requestValue);
      return result;
    }, {
      attributeUpdates: [],
      serverSideRpc: [],
    });
  }

  writeValue(basicConfig: BasicConfig): void {
    this.basicFormGroup.setValue(this.mapConfigToFormValue(basicConfig), { emitEvent: false });
  }
}
