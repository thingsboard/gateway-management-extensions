///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Pipe, PipeTransform } from '@angular/core';
import {
  MappingValueType,
  OPCUaSourceType,
  SourceType
} from '../../shared/public-api';

@Pipe({
  name: 'getGatewayHelpLink',
  standalone: true,
})
export class GatewayHelpLinkPipe implements PipeTransform {
  transform(field: string, sourceType: SourceType | OPCUaSourceType, sourceTypes?: Array<SourceType | OPCUaSourceType | MappingValueType> ): string {
    if (!sourceTypes || sourceTypes?.includes(OPCUaSourceType.PATH)) {
      if (sourceType !== OPCUaSourceType.CONST) {
        return `widget/lib/gateway/${field}-${sourceType}_fn`;
      } else {
        return;
      }
    } else if (field === 'attributes' || field === 'timeseries') {
      return 'widget/lib/gateway/attributes_timeseries_expressions_fn';
    }
    return 'widget/lib/gateway/expressions_fn';
  }
}
