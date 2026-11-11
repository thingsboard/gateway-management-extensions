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

import { ConnectorType, GatewayConnector } from '../../../shared/models/gateway.models';
import { ConnectorBaseInfo } from '../models/connectors.model';
import { BacnetVersionMappingUtil } from './bacnet-version-mapping.util';

type ConnectorConfig = Record<string, any>;

interface ServerPortAccessor {
  get(config: ConnectorConfig): number | string | undefined;
  set(config: ConnectorConfig, port: number): ConnectorConfig;
}

const sectionOrTopLevelPort = (section: string): ServerPortAccessor => ({
  get: config => config[section] ? config[section].port : config.port,
  set: (config, port) => config[section]
    ? { ...config, [section]: { ...config[section], port } }
    : { ...config, port },
});

const sectionPort = (section: string): ServerPortAccessor => ({
  get: config => config[section]?.port,
  set: (config, port) => ({ ...config, [section]: { ...config[section], port } }),
});

const bacnetPort: ServerPortAccessor = {
  get: config => config.application
    ? config.application.port
    : config.general?.address && BacnetVersionMappingUtil.mapApplicationToUpgradedVersion(config.general).port,
  set: (config, port) => {
    if (config.application || !config.general) {
      return sectionPort('application').set(config, port);
    }
    const application = { ...BacnetVersionMappingUtil.mapApplicationToUpgradedVersion(config.general), port: `${port}` };
    const { address } = BacnetVersionMappingUtil.mapApplicationToDowngradedVersion(application);
    return { ...config, general: { ...config.general, address } };
  },
};

const ServerPortAccessorByType: ReadonlyMap<ConnectorType, ServerPortAccessor> = new Map([
  [ConnectorType.REST, sectionOrTopLevelPort('server')],
  [ConnectorType.SOCKET, sectionOrTopLevelPort('socket')],
  [ConnectorType.OCPP, sectionPort('centralSystem')],
  [ConnectorType.BACNET, bacnetPort],
  [ConnectorType.MODBUS, sectionPort('slave')],
]);

export function toConnectorCopy(connector: GatewayConnector): GatewayConnector {
  const { configuration, ...copy } = structuredClone(connector);
  const { id, ...configurationJson } = (copy.configurationJson ?? {}) as Partial<ConnectorBaseInfo>;
  return { ...copy, name: '', configurationJson } as GatewayConnector;
}

export function getServerPort(connector: GatewayConnector): number | undefined {
  const accessor = ServerPortAccessorByType.get(connector?.type);
  const config = connector?.configurationJson as ConnectorConfig;
  const port = accessor && config ? accessor.get(config) : undefined;
  return port === undefined || port === null || `${port}` === '' ? undefined : Number(port);
}

export function withServerPort(connector: GatewayConnector, port: number): GatewayConnector {
  const accessor = ServerPortAccessorByType.get(connector.type);
  if (!accessor) {
    return connector;
  }
  return { ...connector, configurationJson: accessor.set(connector.configurationJson as ConnectorConfig, port) } as GatewayConnector;
}

export function findConnectorsOnPort(port: number | undefined, connectors: GatewayConnector[]): string[] {
  if (port === undefined || port === null || `${port}` === '') {
    return [];
  }
  return connectors
    .filter(connector => {
      const connectorPort = getServerPort(connector);
      return connectorPort !== undefined && `${connectorPort}` === `${port}`;
    })
    .map(connector => connector.name);
}
