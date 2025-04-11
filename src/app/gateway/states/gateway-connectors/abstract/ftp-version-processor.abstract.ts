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

import {
  FtpBasicConfig,
  FtpBasicConfig_v3_7_4,
  FtpLegacyBasicConfig,
  FtpParameters,
  FtpRequestsMapping,
  FtpRequestType,
} from '../models/public-api';
import { GatewayConnectorVersionMappingUtil, FtpVersionMappingUtil } from '../utils/public-api';
import { GatewayConnectorVersionProcessor } from './gateway-connector-version-processor.abstract';
import { ConnectorBaseConfig, GatewayConnector } from '../../../shared/models/public-api';

export class FtpVersionProcessor extends GatewayConnectorVersionProcessor<FtpBasicConfig> {

  private readonly restRequestTypeKeys = Object.values(FtpRequestType);

  constructor(
    protected gatewayVersionIn: string,
    protected connector: GatewayConnector<FtpBasicConfig>
  ) {
    super(gatewayVersionIn, connector);
  }

  getUpgradedVersion(): GatewayConnector<FtpBasicConfig_v3_7_4> {
    const {
      attributeUpdates = [],
      serverSideRpc = [],
      paths = [],
      ...restConfig
    } = this.connector.configurationJson as FtpLegacyBasicConfig;
    let configurationJson = {
      parameters: GatewayConnectorVersionMappingUtil.cleanUpConfigBaseInfo(restConfig as ConnectorBaseConfig) as FtpParameters,
      requestsMapping: { attributeUpdates, serverSideRpc },
      paths: FtpVersionMappingUtil.mapPathsToUpgradedVersion(paths ?? []),
    };

    this.restRequestTypeKeys.forEach((key: FtpRequestType) => {
      const { [key]: removedValue, ...rest } = configurationJson as FtpBasicConfig_v3_7_4 & FtpLegacyBasicConfig;
      configurationJson = { ...rest } as any;
    });

    return {
      ...this.connector,
      configurationJson,
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<FtpBasicConfig_v3_7_4>;
  }

  getDowngradedVersion(): GatewayConnector<FtpLegacyBasicConfig> {
    const { requestsMapping = {}, parameters = {}, paths = [], ...restConfig } = this.connector.configurationJson as FtpBasicConfig_v3_7_4;
    const { attributeUpdates = [], serverSideRpc = [] } = requestsMapping as FtpRequestsMapping;

    return {
      ...this.connector,
      configurationJson: {
        ...restConfig,
        ...parameters,
        attributeUpdates,
        serverSideRpc,
        paths: FtpVersionMappingUtil.mapPathsToDowngradedVersion(paths ?? []),
      } as FtpLegacyBasicConfig,
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<FtpLegacyBasicConfig>;
  }
}
