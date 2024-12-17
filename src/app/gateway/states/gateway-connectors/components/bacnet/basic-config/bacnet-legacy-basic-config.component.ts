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
import { FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import { GatewayConnectorBasicConfigDirective } from '../../../abstract/public-api';
import { BacnetApplicationConfigComponent } from '../application-config/bacnet-application-config.component';
import {
  BacnetDevicesConfigTableComponent
} from '../devices-config-table/bacnet-devices-config-table.component';
import { BacnetVersionMappingUtil } from '../../../utils/bacnet-version-mapping.util';
import { BacnetBasicConfig_v3_6_2, BacnetLegacyBasicConfig } from '../../../models/bacnet.models';

@Component({
  selector: 'tb-bacnet-legacy-basic-config',
  templateUrl: './bacnet-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BacnetLegacyBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BacnetLegacyBasicConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    BacnetApplicationConfigComponent,
    BacnetDevicesConfigTableComponent,
  ],
  styleUrls: ['./bacnet-basic-config.component.scss']
})
export class BacnetLegacyBasicConfigComponent extends GatewayConnectorBasicConfigDirective<BacnetBasicConfig_v3_6_2, BacnetLegacyBasicConfig> {

  isLegacy = true;

  protected initBasicFormGroup(): FormGroup {
    return this.fb.group({
      application: [],
      devices: [],
    });
  }

  protected mapConfigToFormValue(config: BacnetLegacyBasicConfig): BacnetBasicConfig_v3_6_2 {
    return {
      application: config.general ? BacnetVersionMappingUtil.mapApplicationToUpgradedVersion(config.general) : {},
      devices: config.devices?.length ? BacnetVersionMappingUtil.mapDevicesToUpgradedVersion(config.devices) : [],
    } as BacnetBasicConfig_v3_6_2;
  }

  protected getMappedValue(value: BacnetBasicConfig_v3_6_2): BacnetLegacyBasicConfig {
    return {
      general: value.application ? BacnetVersionMappingUtil.mapApplicationToDowngradedVersion(value.application) : {},
      devices: value.devices?.length ? BacnetVersionMappingUtil.mapDevicesToDowngradedVersion(value.devices) : [],
    } as BacnetLegacyBasicConfig;
  }
}
