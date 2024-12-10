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

import { Pipe, PipeTransform } from '@angular/core';
import { ConvertorType, MappingKeysType, MQTTSourceType, OPCUaSourceType, SourceType } from '../models/public-api';
import { ConnectorType } from '../../../shared/models/public-api';

@Pipe({
  name: 'getConnectorMappingHelpLink',
  standalone: true,
})
export class ConnectorMappingHelpLinkPipe implements PipeTransform {
  transform(connectorType: ConnectorType, field: string, sourceType: SourceType, convertorType?: ConvertorType): string {
    switch (connectorType) {
      case ConnectorType.OPCUA:
        return this.getOpcConnectorHelpLink(field, sourceType);
      case ConnectorType.MQTT:
        return this.getMqttConnectorHelpLink(field, sourceType, convertorType);
      case ConnectorType.BACNET:
        return this.getBacnetConnectorHelpLink(field, sourceType);
    }
  }

  private getOpcConnectorHelpLink(field: string, sourceType: SourceType): string {
    if (sourceType !== OPCUaSourceType.CONST) {
      return `widget/lib/gateway/${field}-${sourceType}_fn`;
    }
    return;
  }

  private getMqttConnectorHelpLink(field: string, sourceType: SourceType, convertorType: ConvertorType): string {
    if (sourceType === MQTTSourceType.CONST) {
      return;
    }
    if (!convertorType) {
      return `widget/lib/gateway/mqtt-expression_fn`;
    }
    if ((field === MappingKeysType.ATTRIBUTES || field === MappingKeysType.TIMESERIES) && convertorType === ConvertorType.JSON) {
      return 'widget/lib/gateway/mqtt-json-key-expression_fn';
    }
    return `widget/lib/gateway/mqtt-${convertorType}-expression_fn`;
  }

  private getBacnetConnectorHelpLink(field: string, sourceType: SourceType): string {
    if (sourceType !== OPCUaSourceType.CONST) {
      return `widget/lib/gateway/bacnet-device-${field}-${sourceType}_fn`;
    }
    return;
  }
}
