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

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttributeData, AttributeScope, DeviceId, SharedModule } from '@shared/public-api';
import { WidgetContext } from '@home/models/widget-component.models';
import { AttributeService } from '@core/public-api';

@Component({
  selector: 'tb-gateway-status',
  templateUrl: './gateway-status.component.html',
  styleUrls: ['./gateway-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class GatewayStatusComponent implements AfterViewInit {

  @Input() ctx: WidgetContext;
  @Input() deviceId: DeviceId;

  isGatewayActive = false;

  constructor(private attributeService: AttributeService, private cd: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    this.ctx.$scope.gatewayStatus = this;
    this.loadGatewayState();
  }

  private loadGatewayState(): void {
    this.attributeService.getEntityAttributes(this.deviceId, AttributeScope.SERVER_SCOPE, ['active', 'lastDisconnectTime', 'lastConnectTime'])
      .subscribe((attributes: AttributeData[]) => {
        const active = attributes.find(data => data.key === 'active').value;
        const lastDisconnectedTime = attributes.find(data => data.key === 'lastDisconnectTime')?.value;
        const lastConnectedTime = attributes.find(data => data.key === 'lastConnectTime')?.value;

        this.isGatewayActive = this.getGatewayStatus(active, lastConnectedTime, lastDisconnectedTime);
        this.cd.detectChanges();
      });
  }

  private getGatewayStatus(active: boolean, lastConnectedTime: number, lastDisconnectedTime: number): boolean {
    if (!active) {
      return false;
    }
    return !lastDisconnectedTime || lastConnectedTime > lastDisconnectedTime;
  }

  private onDataUpdated(): void {
    const dataSources = this.ctx.defaultSubscription.data;

    const active = dataSources.find(data => data.dataKey.name === 'active').data[0][1];
    const lastDisconnectedTime = dataSources.find(data => data.dataKey.name === 'lastDisconnectTime').data[0][1];
    const lastConnectedTime = dataSources.find(data => data.dataKey.name === 'lastConnectTime').data[0][1];

    this.isGatewayActive = this.getGatewayStatus(active, lastConnectedTime, lastDisconnectedTime);
    this.cd.detectChanges();
  }
}
