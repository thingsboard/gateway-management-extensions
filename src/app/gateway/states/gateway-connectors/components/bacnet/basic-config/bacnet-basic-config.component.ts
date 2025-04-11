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
import { FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import { GatewayConnectorBasicConfigDirective } from '../../../abstract/public-api';
import { BacnetBasicConfig_v3_6_2 } from '../../../models/public-api';
import { BacnetApplicationConfigComponent } from '../application-config/bacnet-application-config.component';
import { BacnetDevicesConfigTableComponent } from '../devices-config-table/bacnet-devices-config-table.component';

@Component({
  selector: 'tb-bacnet-basic-config',
  templateUrl: './bacnet-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BacnetBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BacnetBasicConfigComponent),
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
export class BacnetBasicConfigComponent extends GatewayConnectorBasicConfigDirective<BacnetBasicConfig_v3_6_2, BacnetBasicConfig_v3_6_2> {

  protected initBasicFormGroup(): FormGroup {
    return this.fb.group({
      application: [],
      devices: [],
    });
  }

  protected mapConfigToFormValue(config: BacnetBasicConfig_v3_6_2): BacnetBasicConfig_v3_6_2 {
    return {
      application: config.application ?? {},
      devices: config.devices ?? [],
    } as BacnetBasicConfig_v3_6_2;
  }

  protected getMappedValue(value: BacnetBasicConfig_v3_6_2): BacnetBasicConfig_v3_6_2 {
    return {
      application: value.application,
      devices: value.devices ?? [],
    };
  }
}
