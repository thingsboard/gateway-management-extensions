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

import addGatewayLocale from './shared/models/gateway-locale.constant';
import { addLibraryStyles } from '../scss/lib-styles';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GatewayStatisticsComponent } from './states/gateway-statistics/public-api';
import { GatewayServiceRPCComponent } from './states/gateway-service-rpc/public-api';
import { GatewayFormComponent } from './states/gateway-form/public-api';
import { GatewayConnectorComponent } from './states/gateway-connectors/public-api';
import { DeviceGatewayCommandComponent } from './states/device-gateway-command/public-api';
import { GatewayConfigurationComponent } from './states/gateway-configuration/public-api';
import { GatewayLogsComponent } from './states/gateway-logs/public-api';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    GatewayStatisticsComponent,
    GatewayServiceRPCComponent,
    GatewayFormComponent,
    GatewayConfigurationComponent,
    GatewayLogsComponent,
    DeviceGatewayCommandComponent,
    GatewayConnectorComponent,
  ],
})
export class GatewayExtensionModule {
  constructor(private translate: TranslateService) {
    addGatewayLocale(translate);
    addLibraryStyles('tb-gateway-css');
  }
}
