///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Pipe, PipeTransform } from '@angular/core';
import { GatewayVersion } from '../../shared/public-api';
import {
  GatewayConnectorVersionMappingUtil
} from '../utils/public-api';

@Pipe({
  name: 'isLatestVersionConfig',
  standalone: true,
})
export class LatestVersionConfigPipe implements PipeTransform {
  transform(configVersion: number | string): boolean {
    return GatewayConnectorVersionMappingUtil.parseVersion(configVersion)
      >= GatewayConnectorVersionMappingUtil.parseVersion(GatewayVersion.Current);
  }
}
