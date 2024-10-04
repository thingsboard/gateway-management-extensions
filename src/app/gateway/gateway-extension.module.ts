///
/// Copyright © 2023 ThingsBoard, Inc.
///

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { GatewayLogsComponent } from './pages/gateway-logs/gateway-logs.component';
import { TranslateModule } from '@ngx-translate/core';
import { GatewayStatisticsComponent } from './pages/gateway-statistics/gateway-statistics.component';
import {
  GatewayServiceRPCConnectorComponent,
  GatewayServiceRPCConnectorTemplatesComponent,
  GatewayServiceRPCConnectorTemplateDialogComponent
} from './pages/gateway-service-rpc/components/public-api';
import { GatewayServiceRPCComponent } from './pages/gateway-service-rpc/public-api';
import {
  OpcRpcParametersComponent
} from './pages/gateway-service-rpc/components/opc-rpc-parameters/opc-rpc-parameters.component';
import {
  MqttRpcParametersComponent
} from './pages/gateway-service-rpc/components/mqtt-rpc-parameters/mqtt-rpc-parameters.component';
import {
  ModbusRpcParametersComponent
} from './pages/gateway-service-rpc/components/modbus-rpc-parameters/modbus-rpc-parameters.component';
import {
  GatewayRemoteConfigurationDialogComponent
} from './pages/gateway-remote-shell/components/gateway-remote-configuration-dialog/gateway-remote-configuration-dialog';
import { GatewayFormComponent } from './pages/gateway-form/gateway-form.component';
import { GatewayConnectorComponent } from './pages/gateway-connectors/gateway-connectors.component';
import { LatestVersionConfigPipe } from './shared/pipes/latest-version-config.pipe';
import { MappingDialogComponent } from './pages/gateway-connectors/components/mapping-dialog/mapping-dialog.component';
import {
  MappingDataKeysPanelComponent
} from './pages/gateway-connectors/components/mapping-data-keys-panel/mapping-data-keys-panel.component';
import {
  RestConnectorSecurityComponent
} from './pages/gateway-service-rpc/components/rest-connector-secuirity/rest-connector-security.component';
import {
  DeviceInfoTableComponent
} from './pages/gateway-connectors/components/device-info-table/device-info-table.component';
import {
    ModbusLegacyBasicConfigComponent
} from './pages/gateway-connectors/components/modbus/modbus-basic-config/modbus-legacy-basic-config.component';
import {
  ModbusBasicConfigComponent
} from './pages/gateway-connectors/components/modbus/modbus-basic-config/modbus-basic-config.component';
import {
  OpcUaLegacyBasicConfigComponent
} from './pages/gateway-connectors/components/opc/opc-ua-basic-config/opc-ua-legacy-basic-config.component';
import {
  OpcUaBasicConfigComponent
} from './pages/gateway-connectors/components/opc/opc-ua-basic-config/opc-ua-basic-config.component';
import {
  MqttLegacyBasicConfigComponent
} from './pages/gateway-connectors/components/mqtt/basic-config/mqtt-legacy-basic-config.component';
import {
  MqttBasicConfigComponent
} from './pages/gateway-connectors/components/mqtt/basic-config/mqtt-basic-config.component';
import {
  ReportStrategyComponent
} from './pages/gateway-connectors/components/report-strategy/report-strategy.component';
import { DeviceGatewayCommandComponent } from './pages/device-gateway-command/device-gateway-command.component';
import { GatewayHelpLinkPipe } from './shared/pipes/gateway-help-link.pipe';
import {
  AddConnectorDialogComponent
} from './pages/gateway-connectors/components/add-connector-dialog/add-connector-dialog.component';
import { GatewayConfigurationComponent } from './pages/gateway-configuration/gateway-configuration.component';
import {
  GatewayBasicConfigurationComponent
} from './pages/gateway-configuration/components/basic/gateway-basic-configuration.component';
import {
  GatewayAdvancedConfigurationComponent
} from './pages/gateway-configuration/components/advanced/gateway-advanced-configuration.component';
import {
  TypeValuePanelComponent
} from './pages/gateway-connectors/components/type-value-panel/type-value-panel.component';
import { EllipsisChipListDirective } from './shared/directives/ellipsis-chip-list.directive';
import { RpcTemplateArrayViewPipe } from './shared/pipes/rpc-template-array-view.pipe';
import { TruncateWithTooltipDirective } from './shared/directives/truncate-with-tooltip.directive';

@NgModule({
  declarations: [
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
  ],
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
  ],
  exports: [
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
  ],
  providers: [
    LatestVersionConfigPipe,
  ]
})
export class GatewayExtensionModule {
}
