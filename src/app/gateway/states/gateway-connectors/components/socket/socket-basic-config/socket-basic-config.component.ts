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
} from '@angular/forms';
import { SocketBasicConfig_v3_6, SocketConfig } from '../../../models/public-api';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { SocketConfigComponent } from '../socket-config/socket-config.component';
import { DevicesConfigTableComponent } from '../devices-config-table/devices-config-table.component';
import {
  GatewayConnectorBasicConfigDirective
} from '../../../abstract/public-api';

@Component({
  selector: 'tb-socket-basic-config',
  templateUrl: './socket-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SocketBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SocketBasicConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SocketConfigComponent,
    DevicesConfigTableComponent,
  ],
  styleUrls: ['./socket-basic-config.component.scss']
})

export class SocketBasicConfigComponent extends GatewayConnectorBasicConfigDirective<SocketBasicConfig_v3_6, SocketBasicConfig_v3_6> {

  isLegacy = false;

  protected getMappedValue(config: SocketBasicConfig_v3_6): SocketBasicConfig_v3_6 {
    return config;
  }

  protected initBasicFormGroup(): FormGroup {
    return this.fb.group({
      socket: [],
      devices: [],
    });
  }

  protected mapConfigToFormValue(config: SocketBasicConfig_v3_6): SocketBasicConfig_v3_6 {
    return {
      socket: config.socket ?? {} as SocketConfig,
      devices: config.devices ?? [],
    };
  }
}
