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

import { Component, Input } from '@angular/core';
import { DeviceService } from '@core/public-api';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';

@Component({
  selector: 'tb-gateway-command',
  templateUrl: './device-gateway-command.component.html',
  styleUrls: ['./device-gateway-command.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ]
})

export class DeviceGatewayCommandComponent {

  @Input()
  deviceId: string;

  constructor(private deviceService: DeviceService) {
  }

  download($event: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    if (this.deviceId) {
      this.deviceService.downloadGatewayDockerComposeFile(this.deviceId).subscribe(() => {});
    }
  }
}
