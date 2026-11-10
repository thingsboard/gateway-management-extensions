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

const ServerPortSectionByType: ReadonlyMap<ConnectorType, string> = new Map([
  [ConnectorType.REST, 'server'],
  [ConnectorType.SOCKET, 'socket'],
  [ConnectorType.OCPP, 'centralSystem'],
  [ConnectorType.BACNET, 'application'],
  [ConnectorType.MODBUS, 'slave'],
]);

export function toConnectorCopy(connector: GatewayConnector): GatewayConnector {
  const { configuration, ...copy } = structuredClone(connector);
  const { id, ...configurationJson } = (copy.configurationJson ?? {}) as Partial<ConnectorBaseInfo>;
  return { ...copy, name: '', configurationJson } as GatewayConnector;
}

export function getServerPort(connector: GatewayConnector): number | undefined {
  const section = ServerPortSectionByType.get(connector?.type);
  const port = section ? connector.configurationJson?.[section]?.port : undefined;
  return port ?? undefined;
}

export function withServerPort(connector: GatewayConnector, port: number): GatewayConnector {
  const section = ServerPortSectionByType.get(connector.type);
  const config = connector.configurationJson;
  return { ...connector, configurationJson: { ...config, [section]: { ...config[section], port } } };
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
