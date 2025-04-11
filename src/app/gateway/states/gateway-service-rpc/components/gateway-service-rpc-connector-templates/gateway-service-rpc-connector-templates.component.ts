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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConnectorType } from '../../../../shared/public-api';
import {
  RPCTemplate,
  SNMPMethodsTranslations
} from '../../models/public-api';
import { AttributeScope, EntityType, SharedModule } from '@shared/public-api';
import { AttributeService, isLiteralObject } from '@core/public-api';
import { WidgetContext } from '@home/models/widget-component.models';
import { CommonModule } from '@angular/common';
import { KeyValueIsNotEmptyPipe, RpcTemplateArrayViewPipe } from '../../pipes/public-api';

@Component({
  selector: 'tb-gateway-service-rpc-connector-templates',
  templateUrl: './gateway-service-rpc-connector-templates.component.html',
  styleUrls: ['./gateway-service-rpc-connector-templates.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    RpcTemplateArrayViewPipe,
    KeyValueIsNotEmptyPipe
  ]
})
export class GatewayServiceRPCConnectorTemplatesComponent {

  @Input()
  connectorType: ConnectorType;

  @Input()
  ctx: WidgetContext;

  @Output()
  saveTemplate: EventEmitter<any> = new EventEmitter();

  @Output()
  useTemplate: EventEmitter<any> = new EventEmitter();

  @Input()
  rpcTemplates: Array<RPCTemplate>;

  readonly ConnectorType = ConnectorType;

  public readonly originalOrder = (): number => 0;
  public readonly isObject = (value: unknown) => isLiteralObject(value);
  public readonly isArray = (value: unknown) => Array.isArray(value);
  public readonly SNMPMethodsTranslations = SNMPMethodsTranslations;

  constructor(private attributeService: AttributeService) {
  }

  public applyTemplate($event: Event, template: RPCTemplate): void {
    $event.stopPropagation();
    this.useTemplate.emit(template);
  }

  public deleteTemplate($event: Event, template: RPCTemplate): void {
    $event.stopPropagation();
    const index = this.rpcTemplates.findIndex(data => {
      return data.name == template.name;
    })
    this.rpcTemplates.splice(index, 1);
    const key = `${this.connectorType}_template`;
    this.attributeService.saveEntityAttributes(
      {
        id: this.ctx.defaultSubscription.targetDeviceId,
        entityType: EntityType.DEVICE
      }
      , AttributeScope.SERVER_SCOPE, [{
        key,
        value: this.rpcTemplates
      }]).subscribe(() => {
    })
  }

  getRpcParamsRowClasses(value: unknown): string {
    return this.isObject(value) ? 'flex-col' : 'flex-row justify-between items-center';
  }
}
