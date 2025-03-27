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

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WidgetContext } from '@home/models/widget-component.models';
import { RPCCommand, RPCTemplate, RPCTemplateConfig, SaveRPCTemplateData } from './models/public-api';
import { ConnectorType, GatewayConnectorDefaultTypesTranslatesMap, jsonRequired } from '../../shared/public-api';
import {
  GatewayServiceRPCConnectorTemplateDialogComponent
} from './components/gateway-service-rpc-connector-template-dialog/gateway-service-rpc-connector-template-dialog';
import { AttributeScope, ContentType, DatasourceType, EntityType, SharedModule, widgetType } from '@shared/public-api';
import { AttributeService, IWidgetSubscription, UtilsService, WidgetSubscriptionOptions } from '@core/public-api';
import { CommonModule } from '@angular/common';
import {
  GatewayServiceRPCConnectorComponent
} from './components/gateway-service-rpc-connector/gateway-service-rpc-connector.component';
import { ModbusRpcParametersComponent } from './components/modbus-rpc-parameters/modbus-rpc-parameters.component';
import { MqttRpcParametersComponent } from './components/mqtt-rpc-parameters/mqtt-rpc-parameters.component';
import { OpcRpcParametersComponent } from './components/opc-rpc-parameters/opc-rpc-parameters.component';
import {
  GatewayServiceRPCConnectorTemplatesComponent
} from './components/gateway-service-rpc-connector-templates/gateway-service-rpc-connector-templates.component';
import { SocketRpcParametersComponent } from './components/socket-rpc-parameters/socket-rpc-parameters.component';

@Component({
  selector: 'tb-gateway-service-rpc',
  templateUrl: './gateway-service-rpc.component.html',
  styleUrls: ['./gateway-service-rpc.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    GatewayServiceRPCConnectorComponent,
    ModbusRpcParametersComponent,
    MqttRpcParametersComponent,
    OpcRpcParametersComponent,
    GatewayServiceRPCConnectorTemplatesComponent,
    SocketRpcParametersComponent,
  ]
})
export class GatewayServiceRPCComponent implements OnInit {

  @Input()
  ctx: WidgetContext;

  contentTypes = ContentType;

  resultTime: number | null;

  @Input()
  dialogRef: MatDialogRef<any>;

  commandForm: FormGroup;

  isConnector: boolean;

  RPCCommands: Array<string> = [
    'Ping',
    'Stats',
    'Devices',
    'Update',
    'Version',
    'Restart',
    'Reboot'
  ];

  public connectorType: ConnectorType;
  public templates: Array<RPCTemplate> = [];

  readonly ConnectorType = ConnectorType;
  readonly gatewayConnectorDefaultTypesTranslates = GatewayConnectorDefaultTypesTranslatesMap;
  readonly typesWithUpdatedParams = new Set<ConnectorType>([
    ConnectorType.MQTT,
    ConnectorType.OPCUA,
    ConnectorType.MODBUS,
    ConnectorType.SOCKET
  ]);
  readonly modbusReadFunctionCodes = [1, 2, 3, 4];

  private subscription: IWidgetSubscription;
  private subscriptionOptions: WidgetSubscriptionOptions = {
    callbacks: {
      onDataUpdated: () => this.ctx.ngZone.run(() => {
        this.updateTemplates()
      }),
      onDataUpdateError: (subscription, e) => this.ctx.ngZone.run(() => {
        this.onDataUpdateError(e);
      }),
      dataLoading: () => {
      }
    }
  };

  constructor(private fb: FormBuilder,
              private dialog: MatDialog,
              private utils: UtilsService,
              private cd: ChangeDetectorRef,
              private attributeService: AttributeService) {
    this.commandForm = this.fb.group({
      command: [null, [Validators.required]],
      time: [60, [Validators.required, Validators.min(1)]],
      params: ['{}', [jsonRequired]],
      result: [null]
    });
  }

  ngOnInit() {
    this.isConnector = this.ctx.settings.isConnector;
    if (!this.isConnector) {
      this.commandForm.get('command').setValue(this.RPCCommands[0]);
    } else {
      this.connectorType = this.ctx.stateController.getStateParams().connector_rpc.value.type;
      const subscriptionInfo = [{
        type: DatasourceType.entity,
        entityType: EntityType.DEVICE,
        entityId: this.ctx.defaultSubscription.targetDeviceId,
        entityName: 'Connector',
        attributes: [{name: `${this.connectorType}_template`}]
      }];
      this.ctx.subscriptionApi.createSubscriptionFromInfo(widgetType.latest, subscriptionInfo,
        this.subscriptionOptions, false, true).subscribe(subscription => {
        this.subscription = subscription;
      })
    }
  }

  sendCommand(value?: RPCCommand) {
    this.resultTime = null;
    const formValues = value || this.commandForm.value;
    const commandPrefix = this.isConnector ? `${this.connectorType}_` : 'gateway_';
    const command = !this.isConnector ? formValues.command.toLowerCase() : this.getCommandFromParamsByType(formValues.params);
    const connectorId = this.ctx.stateController.getStateParams().connector_rpc?.value.configurationJson.id;
    const params = connectorId ? { ...formValues.params, connectorId } : formValues.params;
    this.ctx.controlApi.sendTwoWayCommand(commandPrefix + command, params, formValues.time).subscribe({
      next: resp => {
        this.resultTime = new Date().getTime();
        this.commandForm.get('result').setValue(JSON.stringify(resp))
      },
      error: error => {
        this.resultTime = new Date().getTime();
        console.error(error);
        this.commandForm.get('result').setValue(JSON.stringify(error.error));
      }
    });
  }

  getCommandFromParamsByType(params: RPCTemplateConfig) {
    switch (this.connectorType) {
      case ConnectorType.MQTT:
      case ConnectorType.FTP:
      case ConnectorType.SNMP:
      case ConnectorType.REST:
      case ConnectorType.REQUEST:
        return params.methodFilter;
      case ConnectorType.MODBUS:
        return this.modbusReadFunctionCodes.includes(params.functionCode) ? 'get' : 'set';
      case ConnectorType.BACNET:
      case ConnectorType.CAN:
      case ConnectorType.OPCUA:
        return params.method;
      case ConnectorType.BLE:
      case ConnectorType.OCPP:
      case ConnectorType.SOCKET:
      case ConnectorType.XMPP:
        return params.methodRPC;
      default:
        return params.command;
    }
  }

  saveTemplate() {
    this.dialog.open<GatewayServiceRPCConnectorTemplateDialogComponent, SaveRPCTemplateData>
    (GatewayServiceRPCConnectorTemplateDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {config: this.commandForm.value.params, templates: this.templates}
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          const templateAttribute: RPCTemplate = {
            name: res,
            config: this.commandForm.value.params,
            type: this.connectorType
          }
          const templatesArray = this.templates;
          const existingIndex = templatesArray.findIndex(template => {
            return template.name == templateAttribute.name;
          })
          if (existingIndex > -1) {
            templatesArray.splice(existingIndex, 1)
          }
          templatesArray.push(templateAttribute)
          const key = `${this.connectorType}_template`;
          this.attributeService.saveEntityAttributes(
            {
              id: this.ctx.defaultSubscription.targetDeviceId,
              entityType: EntityType.DEVICE
            }
            , AttributeScope.SERVER_SCOPE, [{
              key,
              value: templatesArray
            }]).subscribe(() => {
              this.cd.detectChanges();
          })
        }
      }
    );
  }

  useTemplate($event) {
    this.commandForm.get('params').patchValue($event.config);
  }

  private updateTemplates() {
    this.templates = this.subscription.data[0].data[0][1].length ?
      JSON.parse(this.subscription.data[0].data[0][1]) : [];
    this.cd.detectChanges();
  }

  private onDataUpdateError(e: any) {
    const exceptionData = this.utils.parseException(e);
    let errorText = exceptionData.name;
    if (exceptionData.message) {
      errorText += ': ' + exceptionData.message;
    }
    console.error(errorText);
  }

}
