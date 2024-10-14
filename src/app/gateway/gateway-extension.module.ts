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

import addGatewayLocale from './shared/models/gateway-locale.constant';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { GatewayLogsComponent } from './states/gateway-logs/gateway-logs.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GatewayStatisticsComponent } from './states/gateway-statistics/gateway-statistics.component';
import {
  GatewayServiceRPCConnectorComponent,
  GatewayServiceRPCConnectorTemplatesComponent,
  GatewayServiceRPCConnectorTemplateDialogComponent
} from './states/gateway-service-rpc/components/public-api';
import { GatewayServiceRPCComponent } from './states/gateway-service-rpc/public-api';
import {
  OpcRpcParametersComponent
} from './states/gateway-service-rpc/components/opc-rpc-parameters/opc-rpc-parameters.component';
import {
  MqttRpcParametersComponent
} from './states/gateway-service-rpc/components/mqtt-rpc-parameters/mqtt-rpc-parameters.component';
import {
  ModbusRpcParametersComponent
} from './states/gateway-service-rpc/components/modbus-rpc-parameters/modbus-rpc-parameters.component';
import {
  GatewayRemoteConfigurationDialogComponent
} from './states/gateway-remote-shell/components/gateway-remote-configuration-dialog/gateway-remote-configuration-dialog';
import { GatewayFormComponent } from './states/gateway-form/gateway-form.component';
import { GatewayConnectorComponent } from './states/gateway-connectors/gateway-connectors.component';
import { LatestVersionConfigPipe } from './shared/pipes/latest-version-config.pipe';
import { MappingDialogComponent } from './states/gateway-connectors/components/mapping-dialog/mapping-dialog.component';
import {
  MappingDataKeysPanelComponent
} from './states/gateway-connectors/components/mapping-data-keys-panel/mapping-data-keys-panel.component';
import {
  RestConnectorSecurityComponent
} from './states/gateway-service-rpc/components/rest-connector-secuirity/rest-connector-security.component';
import {
  DeviceInfoTableComponent
} from './states/gateway-connectors/components/device-info-table/device-info-table.component';
import {
    ModbusLegacyBasicConfigComponent
} from './states/gateway-connectors/components/modbus/modbus-basic-config/modbus-legacy-basic-config.component';
import {
  ModbusBasicConfigComponent
} from './states/gateway-connectors/components/modbus/modbus-basic-config/modbus-basic-config.component';
import {
  OpcUaLegacyBasicConfigComponent
} from './states/gateway-connectors/components/opc/opc-ua-basic-config/opc-ua-legacy-basic-config.component';
import {
  OpcUaBasicConfigComponent
} from './states/gateway-connectors/components/opc/opc-ua-basic-config/opc-ua-basic-config.component';
import {
  MqttLegacyBasicConfigComponent
} from './states/gateway-connectors/components/mqtt/basic-config/mqtt-legacy-basic-config.component';
import {
  MqttBasicConfigComponent
} from './states/gateway-connectors/components/mqtt/basic-config/mqtt-basic-config.component';
import {
  ReportStrategyComponent
} from './shared/components/report-strategy/report-strategy.component';
import { DeviceGatewayCommandComponent } from './states/device-gateway-command/device-gateway-command.component';
import { GatewayHelpLinkPipe } from './shared/pipes/gateway-help-link.pipe';
import {
  AddConnectorDialogComponent
} from './states/gateway-connectors/components/add-connector-dialog/add-connector-dialog.component';
import { GatewayConfigurationComponent } from './states/gateway-configuration/gateway-configuration.component';
import {
  GatewayBasicConfigurationComponent
} from './states/gateway-configuration/components/basic/gateway-basic-configuration.component';
import {
  GatewayAdvancedConfigurationComponent
} from './states/gateway-configuration/components/advanced/gateway-advanced-configuration.component';
import {
  TypeValuePanelComponent
} from './states/gateway-connectors/components/type-value-panel/type-value-panel.component';
import { EllipsisChipListDirective } from './shared/directives/ellipsis-chip-list.directive';
import { RpcTemplateArrayViewPipe } from './shared/pipes/rpc-template-array-view.pipe';
import { TruncateWithTooltipDirective } from './shared/directives/truncate-with-tooltip.directive';
import {
  SocketConfigComponent
} from './states/gateway-connectors/components/socket/socket-config/socket-config.component';
import {
  SocketBasicConfigComponent
} from './states/gateway-connectors/components/socket/socket-basic-config/socket-basic-config.component';
import {
  SocketLegacyBasicConfigComponent
} from './states/gateway-connectors/components/socket/socket-basic-config/socket-legacy-basic-config.component';
import { ReportStrategyVersionPipe } from './shared/pipes/report-strategy-version.pipe';

const DECLARATIONS = [
  GatewayLogsComponent,
  GatewayStatisticsComponent,
  GatewayServiceRPCConnectorTemplatesComponent,
  GatewayServiceRPCComponent,
  GatewayServiceRPCConnectorComponent,
  GatewayServiceRPCConnectorTemplateDialogComponent,
  GatewayRemoteConfigurationDialogComponent,
  GatewayFormComponent,
  GatewayConnectorComponent,
  MappingDialogComponent,
  MappingDataKeysPanelComponent,
  DeviceInfoTableComponent,
  DeviceGatewayCommandComponent,
  AddConnectorDialogComponent,
  GatewayConfigurationComponent,
  TypeValuePanelComponent,
];

@NgModule({
  declarations: DECLARATIONS,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    OpcRpcParametersComponent,
    MqttRpcParametersComponent,
    ModbusRpcParametersComponent,
    LatestVersionConfigPipe,
    RestConnectorSecurityComponent,
    ModbusLegacyBasicConfigComponent,
    ModbusBasicConfigComponent,
    OpcUaLegacyBasicConfigComponent,
    OpcUaBasicConfigComponent,
    MqttLegacyBasicConfigComponent,
    MqttBasicConfigComponent,
    ReportStrategyComponent,
    GatewayHelpLinkPipe,
    GatewayBasicConfigurationComponent,
    GatewayAdvancedConfigurationComponent,
    EllipsisChipListDirective,
    RpcTemplateArrayViewPipe,
    TruncateWithTooltipDirective,
    SocketConfigComponent,
    SocketBasicConfigComponent,
    SocketLegacyBasicConfigComponent,
    ReportStrategyVersionPipe,
  ],
  exports: DECLARATIONS,
  providers: [
    LatestVersionConfigPipe,
    ReportStrategyVersionPipe,
  ]
})
export class GatewayExtensionModule {
  constructor(private translate: TranslateService) {
    addGatewayLocale(translate)
  }
}
