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

import {
  BacnetApplicationConfig,
  BacnetApplicationLegacyConfig,
  BacnetDeviceConfig,
  BacnetDeviceKey,
  BacnetLegacyDeviceConfig,
  BacnetLegacyDeviceKey,
  ExpressionType,
} from '../models/public-api';

export class BacnetVersionMappingUtil {

  static mapApplicationToUpgradedVersion(general: BacnetApplicationLegacyConfig): BacnetApplicationConfig {
    const { address = '', ...restGeneral } = general;
    const [hostAddress, port] = address.split(':');
    const [host, mask] = hostAddress.split('/');
    return {
      host,
      port,
      mask,
      ...restGeneral,
    };
  }

  static mapApplicationToDowngradedVersion(application: BacnetApplicationConfig): BacnetApplicationLegacyConfig {
    const { host = '', port = '', mask = '', ...restApplication } = application;
    return {
      address: mask ? `${host}/${mask}:${port}` : `${host}:${port}`,
      ...restApplication,
    };
  }

  static mapDevicesToUpgradedVersion(devices: BacnetLegacyDeviceConfig[]): BacnetDeviceConfig[] {
    return devices?.map(({ address = '', deviceName, deviceType, attributes, timeseries, attributeUpdates, serverSideRpc, ...device }) => ({
      ...device,
      host: address.split(':')[0],
      port: address.split(':')[1],
      deviceInfo: {
        deviceNameExpression: deviceName,
        deviceProfileExpression: deviceType,
        deviceNameExpressionSource: this.getExpressionSource(deviceName),
        deviceProfileExpressionSource: this.getExpressionSource(deviceType)
      },
      attributes: this.getUpdateKeys(attributes),
      timeseries: this.getUpdateKeys(timeseries),
      attributeUpdates: this.getUpdateKeys(attributeUpdates),
      serverSideRpc: this.getUpdateKeys(serverSideRpc),
    })) ?? [] as any[];
  }

  static mapDevicesToDowngradedVersion(devices: BacnetDeviceConfig[]): BacnetLegacyDeviceConfig[] {
    return devices?.map(({ port, host, deviceInfo, attributes, timeseries, attributeUpdates, serverSideRpc, ...device }) => ({
      ...device,
      address: `${host}:${port}`,
      deviceName: deviceInfo?.deviceNameExpression,
      deviceType: deviceInfo?.deviceProfileExpression,
      attributes: this.getDowngradedKeys(attributes),
      timeseries: this.getDowngradedKeys(timeseries),
      attributeUpdates: this.getDowngradedKeys(attributeUpdates),
      serverSideRpc: this.getDowngradedKeys(serverSideRpc),
    })) as BacnetLegacyDeviceConfig[] ?? [];
  }

  private static getExpressionSource(expression: string): ExpressionType {
    return expression.includes('${') || expression.includes('[') ? ExpressionType.Expression : ExpressionType.Constant;
  }

  private static getUpdateKeys(keys: BacnetLegacyDeviceKey[]): BacnetDeviceKey[] {
    return keys?.map(({ objectId = '', ...key}) => ({
      objectType: objectId.split(':')[0],
      objectId: objectId.split(':')[1],
      ...key,
    })) as BacnetDeviceKey[] ?? [];
  }

  private static getDowngradedKeys(keys: BacnetDeviceKey[]): BacnetLegacyDeviceKey[] {
    return keys?.map(({ objectId = '', objectType = '', ...key}) => ({
      objectId: `${objectType}:${objectId}`,
      ...key,
    })) ?? [];
  }
}
