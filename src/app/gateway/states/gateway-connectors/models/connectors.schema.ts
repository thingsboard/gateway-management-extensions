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
import { SourceType } from './connectors.model';

export const ValueTypeSchema = {
  type: 'object',
  required: ['type', 'value'],
  properties: {
    type: {
      type: 'string',
      enum: ['string', 'integer', 'double', 'boolean']
    },
    value: {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' }
      ]
    }
  }
};

export const RpcMethodSchema = {
  type: 'object',
  required: ['method', 'arguments'],
  properties: {
    method: { type: 'string' },
    arguments: {
      type: 'array',
      items: ValueTypeSchema
    }
  }
};

export const DataKeySchema = {
  type: 'object',
  required: ['key', 'type', 'value'],
  properties: {
    key: { type: 'string' },
    type: { type: 'string' },
    value: { type: 'string' }
  }
};

export const ConnectorSecuritySchema = {
  type: 'object',
  required: ['type'],
  properties: {
    type: { type: 'string' },
    username: { type: 'string' },
    password: { type: 'string' },
    pathToCACert: { type: 'string' },
    pathToPrivateKey: { type: 'string' },
    pathToClientCert: { type: 'string' },
    mode: { type: 'string' }
  }
};

export const getConnectorDeviceInfoSchema = (sourceTypes: SourceType[])=> ({
  type: 'object',
  required: [
    'deviceNameExpression',
    'deviceNameExpressionSource',
    'deviceProfileExpression',
    'deviceProfileExpressionSource'
  ],
  properties: {
    deviceNameExpression: { type: 'string' },
    deviceNameExpressionSource: {
      type: 'string',
      enum: sourceTypes
    },
    deviceProfileExpression: { type: 'string' },
    deviceProfileExpressionSource: {
      type: 'string',
      enum: sourceTypes
    }
  }
});
