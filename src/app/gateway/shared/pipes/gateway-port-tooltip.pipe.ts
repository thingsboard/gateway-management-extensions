///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Pipe, PipeTransform } from '@angular/core';
import { PortLimits } from '../../shared/public-api';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'getGatewayPortTooltip',
  standalone: true,
})
export class GatewayPortTooltipPipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(portControl: AbstractControl): string {
    if (portControl.hasError('required')) {
      return this.translate.instant('gateway.port-required');
    }
    if (portControl.hasError('min') || portControl.hasError('max')) {
      return this.translate.instant('gateway.port-limits-error', {
        min: PortLimits.MIN,
        max: PortLimits.MAX,
      });
    }
    return '';
  }
}
