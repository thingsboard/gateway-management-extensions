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
  ConnectorSecuritySchema,
  RpcMethodSchema,
  getConnectorDeviceInfoSchema,
  DataKeySchema,
} from './connectors.schema';
import { OPCUaSourceType, SecurityPolicy } from './connectors.model';

export const OPCBasicConfigSchema = {
  title: 'OPCBasicConfig_v3_5_2',
  type: 'object',
  properties: {
    mapping: {
      type: 'array',
      items: {
        type: 'object',
        required: ['deviceNodePattern', 'deviceNodeSource', 'deviceInfo'],
        properties: {
          deviceNodePattern: { type: 'string' },
          deviceNodeSource: {
            type: 'string',
            enum: Object.values(OPCUaSourceType)
          },
          deviceInfo: getConnectorDeviceInfoSchema(Object.values(OPCUaSourceType)),
          attributes: {
            type: 'array',
            items: DataKeySchema
          },
          timeseries: {
            type: 'array',
            items: DataKeySchema
          },
          rpc_methods: {
            type: 'array',
            items: RpcMethodSchema
          },
          attributes_updates: {
            type: 'array',
            items: DataKeySchema
          }
        }
      }
    },
    server: {
      type: 'object',
      required: [
        'url',
        'timeoutInMillis',
        'scanPeriodInMillis',
        'pollPeriodInMillis',
        'enableSubscriptions',
        'subCheckPeriodInMillis',
        'showMap',
        'security',
        'identity'
      ],
      properties: {
        url: { type: 'string' },
        timeoutInMillis: { type: 'integer' },
        scanPeriodInMillis: { type: 'integer' },
        pollPeriodInMillis: { type: 'integer' },
        enableSubscriptions: { type: 'boolean' },
        subCheckPeriodInMillis: { type: 'integer' },
        showMap: { type: 'boolean' },
        security: {
          type: 'string',
          enum: Object.values(SecurityPolicy)
        },
        identity: ConnectorSecuritySchema
      }
    }
  },
  required: ['server', 'mapping']
};
