///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Component, Input } from '@angular/core';
import { DeviceService } from '@core/public-api';

@Component({
  selector: 'tb-gateway-command',
  templateUrl: './device-gateway-command.component.html',
  styleUrls: ['./device-gateway-command.component.scss']
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
