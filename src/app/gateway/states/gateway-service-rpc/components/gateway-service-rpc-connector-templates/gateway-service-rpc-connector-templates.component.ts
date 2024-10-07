///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ConnectorType,
  RPCTemplate,
  SNMPMethodsTranslations
} from '../../../../shared/public-api';
import { AttributeScope, EntityType } from '@shared/public-api';
import { AttributeService, isLiteralObject } from '@core/public-api';
import { WidgetContext } from '@home/models/widget-component.models';

@Component({
  selector: 'tb-gateway-service-rpc-connector-templates',
  templateUrl: './gateway-service-rpc-connector-templates.component.html',
  styleUrls: ['./gateway-service-rpc-connector-templates.component.scss']
})
export class GatewayServiceRPCConnectorTemplatesComponent implements OnInit {

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

  public readonly originalOrder = (): number => 0;
  public readonly isObject = (value: unknown) => isLiteralObject(value);
  public readonly isArray = (value: unknown) => Array.isArray(value);
  public readonly SNMPMethodsTranslations = SNMPMethodsTranslations;

  constructor(private attributeService: AttributeService) {
  }

  ngOnInit() {
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
}
