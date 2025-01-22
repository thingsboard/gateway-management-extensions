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
  RestBasicConfig,
  RestBasicConfig_v3_7,
  RestLegacyBasicConfig,
  RestRequestsMapping,
  RestRequestType,
} from '../models/public-api';
import { RestVersionMappingUtil } from '../utils/public-api';
import { GatewayConnectorVersionProcessor } from './gateway-connector-version-processor.abstract';
import { GatewayConnector } from '../../../shared/models/public-api';

export class RestVersionProcessor extends GatewayConnectorVersionProcessor<RestBasicConfig> {

  private readonly restRequestTypeKeys = Object.values(RestRequestType);

  constructor(
    protected gatewayVersionIn: string,
    protected connector: GatewayConnector<RestBasicConfig>
  ) {
    super(gatewayVersionIn, connector);
  }

  getUpgradedVersion(): GatewayConnector<RestBasicConfig_v3_7> {
    const {
      attributeRequests = [],
      attributeUpdates = [],
      serverSideRpc = [],
      mapping = [],
      ...server
    } = this.connector.configurationJson as RestLegacyBasicConfig;
    let configurationJson = {
      server,
      requestsMapping: { attributeRequests, attributeUpdates, serverSideRpc },
      mapping: RestVersionMappingUtil.mapMappingToUpgradedVersion(mapping),
    };

    this.restRequestTypeKeys.forEach((key: RestRequestType) => {
      const { [key]: removedValue, ...rest } = configurationJson as RestBasicConfig_v3_7 & RestLegacyBasicConfig;
      configurationJson = { ...rest } as any;
    });

    return {
      ...this.connector,
      configurationJson,
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<RestBasicConfig_v3_7>;
  }

  getDowngradedVersion(): GatewayConnector<RestLegacyBasicConfig> {
    const { requestsMapping, mapping, server, ...restConfig } = this.connector.configurationJson as RestBasicConfig_v3_7;
    const { attributeRequests = [], attributeUpdates = [], serverSideRpc = [] } = requestsMapping as RestRequestsMapping;

    return {
      ...this.connector,
      configurationJson: {
        ...restConfig,
        ...server,
        attributeRequests,
        attributeUpdates,
        serverSideRpc,
        mapping: RestVersionMappingUtil.mapMappingToDowngradedVersion(mapping),
      } as RestLegacyBasicConfig,
      configVersion: this.gatewayVersionIn
    } as GatewayConnector<RestLegacyBasicConfig>;
  }
}
