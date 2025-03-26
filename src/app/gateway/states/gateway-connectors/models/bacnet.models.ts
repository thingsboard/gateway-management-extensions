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
import { ConnectorDeviceInfo } from './connectors.model';
import { ReportStrategyConfig } from '../../../shared/models/public-api';

export enum SegmentationType {
  BOTH = "segmentedBoth",
  TRANSMIT = "segmentedTransmit",
  RECEIVE = "segmentedReceive",
  NO = "noSegmentation",
}

export const SegmentationTypeTranslationsMap = new Map<SegmentationType, string>(
  [
    [SegmentationType.BOTH, 'gateway.bacnet.segmentation.both'],
    [SegmentationType.TRANSMIT, 'gateway.bacnet.segmentation.transmit'],
    [SegmentationType.RECEIVE, 'gateway.bacnet.segmentation.receive'],
    [SegmentationType.NO, 'gateway.bacnet.segmentation.no']
  ]
);

export enum BacnetDeviceKeysType {
  ATTRIBUTES = 'attributes',
  TIMESERIES = 'timeseries',
  RPC_METHODS = 'serverSideRpc',
  ATTRIBUTES_UPDATES = 'attributeUpdates'
}

export const BacnetDeviceKeysPanelTitleTranslationsMap = new Map<BacnetDeviceKeysType, string>(
  [
    [BacnetDeviceKeysType.ATTRIBUTES, 'gateway.attributes'],
    [BacnetDeviceKeysType.TIMESERIES, 'gateway.timeseries'],
    [BacnetDeviceKeysType.ATTRIBUTES_UPDATES, 'gateway.attribute-updates'],
    [BacnetDeviceKeysType.RPC_METHODS, 'gateway.rpc-methods']
  ]
);

export const BacnetDeviceKeysAddKeyTranslationsMap = new Map<BacnetDeviceKeysType, string>(
  [
    [BacnetDeviceKeysType.ATTRIBUTES, 'gateway.add-attribute'],
    [BacnetDeviceKeysType.TIMESERIES, 'gateway.add-timeseries'],
    [BacnetDeviceKeysType.ATTRIBUTES_UPDATES, 'gateway.add-attribute-update'],
    [BacnetDeviceKeysType.RPC_METHODS, 'gateway.add-rpc-method']
  ]
);

export const BacnetDeviceKeysDeleteKeyTranslationsMap = new Map<BacnetDeviceKeysType, string>(
  [
    [BacnetDeviceKeysType.ATTRIBUTES, 'gateway.delete-attribute'],
    [BacnetDeviceKeysType.TIMESERIES, 'gateway.delete-timeseries'],
    [BacnetDeviceKeysType.ATTRIBUTES_UPDATES, 'gateway.delete-attribute-update'],
    [BacnetDeviceKeysType.RPC_METHODS, 'gateway.delete-rpc-method']
  ]
);

export const BacnetDeviceKeysNoKeysTextTranslationsMap = new Map<BacnetDeviceKeysType, string>(
  [
    [BacnetDeviceKeysType.ATTRIBUTES, 'gateway.no-attributes'],
    [BacnetDeviceKeysType.TIMESERIES, 'gateway.no-timeseries'],
    [BacnetDeviceKeysType.ATTRIBUTES_UPDATES, 'gateway.no-attribute-updates'],
    [BacnetDeviceKeysType.RPC_METHODS, 'gateway.no-rpc-methods']
  ]
);

export enum BacnetKeyObjectType {
  analogInput = 'analogInput',
  analogOutput = 'analogOutput',
  analogValue = 'analogValue',
  binaryInput = 'binaryInput',
  binaryOutput = 'binaryOutput',
  binaryValue = 'binaryValue',
}

export const BacnetKeyObjectTypeTranslationsMap = new Map<BacnetKeyObjectType, string>(
  [
    [BacnetKeyObjectType.analogInput, 'gateway.bacnet.object-type.analog-input'],
    [BacnetKeyObjectType.analogOutput, 'gateway.bacnet.object-type.analog-output'],
    [BacnetKeyObjectType.analogValue, 'gateway.bacnet.object-type.analog-value'],
    [BacnetKeyObjectType.binaryInput, 'gateway.bacnet.object-type.binary-input'],
    [BacnetKeyObjectType.binaryOutput, 'gateway.bacnet.object-type.binary-output'],
    [BacnetKeyObjectType.binaryValue, 'gateway.bacnet.object-type.binary-value'],
  ]
);

export enum BacnetPropertyId {
  presentValue = 'presentValue',
  statusFlags = 'statusFlags',
  covIncrement = 'covIncrement',
  eventState = 'eventState',
  outOfService = 'outOfService',
  polarity = 'polarity',
  priorityArray = 'priorityArray',
  relinquishDefault = 'relinquishDefault',
  currentCommandPriority = 'currentCommandPriority',
  eventMessageTexts = 'eventMessageTexts',
  eventMessageTextsConfig = 'eventMessageTextsConfig',
  eventAlgorithmInhibitReference = 'eventAlgorithmInhibitReference',
  timeDelayNormal = 'timeDelayNormal'
}

export const BacnetPropertyIdByObjectType = new Map<BacnetKeyObjectType, BacnetPropertyId[]>(
  [
    [BacnetKeyObjectType.analogInput, [
      BacnetPropertyId.presentValue,
      BacnetPropertyId.statusFlags,
      BacnetPropertyId.covIncrement,
    ]],
    [BacnetKeyObjectType.analogOutput, [
      BacnetPropertyId.presentValue,
      BacnetPropertyId.statusFlags,
      BacnetPropertyId.covIncrement,
    ]],
    [BacnetKeyObjectType.analogValue, [
      BacnetPropertyId.presentValue,
      BacnetPropertyId.statusFlags,
      BacnetPropertyId.covIncrement,
    ]],
    [BacnetKeyObjectType.binaryInput, [
      BacnetPropertyId.presentValue,
      BacnetPropertyId.statusFlags,
      BacnetPropertyId.eventState,
      BacnetPropertyId.outOfService,
      BacnetPropertyId.polarity
    ]],
    [BacnetKeyObjectType.binaryOutput, [
      BacnetPropertyId.presentValue,
      BacnetPropertyId.statusFlags,
      BacnetPropertyId.eventState,
      BacnetPropertyId.outOfService,
      BacnetPropertyId.polarity,
      BacnetPropertyId.priorityArray,
      BacnetPropertyId.relinquishDefault,
      BacnetPropertyId.currentCommandPriority,
      BacnetPropertyId.eventMessageTexts,
      BacnetPropertyId.eventMessageTextsConfig,
      BacnetPropertyId.eventAlgorithmInhibitReference,
      BacnetPropertyId.timeDelayNormal
    ]],
    [BacnetKeyObjectType.binaryValue, [
      BacnetPropertyId.presentValue,
      BacnetPropertyId.statusFlags,
      BacnetPropertyId.eventState,
      BacnetPropertyId.outOfService,
    ]],
  ]
);

export const BacnetPropertyIdTranslationsMap = new Map<BacnetPropertyId, string>([
  [BacnetPropertyId.presentValue, 'gateway.bacnet.property-id.present-value'],
  [BacnetPropertyId.statusFlags, 'gateway.bacnet.property-id.status-flags'],
  [BacnetPropertyId.covIncrement, 'gateway.bacnet.property-id.cov-increment'],
  [BacnetPropertyId.eventState, 'gateway.bacnet.property-id.event-state'],
  [BacnetPropertyId.outOfService, 'gateway.bacnet.property-id.out-of-service'],
  [BacnetPropertyId.polarity, 'gateway.bacnet.property-id.polarity'],
  [BacnetPropertyId.priorityArray, 'gateway.bacnet.property-id.priority-array'],
  [BacnetPropertyId.relinquishDefault, 'gateway.bacnet.property-id.relinquish-default'],
  [BacnetPropertyId.currentCommandPriority, 'gateway.bacnet.property-id.current-command-priority'],
  [BacnetPropertyId.eventMessageTexts, 'gateway.bacnet.property-id.event-message-texts'],
  [BacnetPropertyId.eventMessageTextsConfig, 'gateway.bacnet.property-id.event-message-texts-config'],
  [BacnetPropertyId.eventAlgorithmInhibitReference, 'gateway.bacnet.property-id.event-algorithm-inhibit-reference'],
  [BacnetPropertyId.timeDelayNormal, 'gateway.bacnet.property-id.time-delay-normal']
]);

export enum BacnetRequestType {
  Write = 'writeProperty',
  Read = 'readProperty',
}

export const BacnetRequestTypeTranslationsMap = new Map<BacnetRequestType, string>([
  [BacnetRequestType.Write, 'gateway.bacnet.request-type.write'],
  [BacnetRequestType.Read, 'gateway.bacnet.request-type.read']
]);

export type BacnetBasicConfig = BacnetBasicConfig_v3_6_2 | BacnetLegacyBasicConfig;

export interface BacnetBasicConfig_v3_6_2 {
  application: BacnetApplicationConfig;
  devices: BacnetDeviceConfig[];
}

export interface BacnetLegacyBasicConfig {
  general: BacnetApplicationLegacyConfig;
  devices: BacnetLegacyDeviceConfig[];
}

export interface BacnetApplicationConfig {
  objectName: string;
  host: string;
  port: string;
  mask?: string;
  objectIdentifier: number;
  maxApduLengthAccepted: number;
  segmentationSupported: SegmentationType;
  deviceDiscoveryTimeoutInSec?: number;
  networkNumber?: number;
  vendorIdentifier?: number;
}

export interface BacnetApplicationLegacyConfig extends Omit<BacnetApplicationConfig, 'host' | 'port' | 'altResponsesAddresses'> {
  address: string;
}

export interface BacnetDeviceConfig {
  deviceInfo: ConnectorDeviceInfo;
  host: string;
  port: string;
  pollPeriod: number;
  attributes: BacnetKey[];
  timeseries: BacnetKey[];
  attributeUpdates: AttributeUpdateBacnetKey[];
  serverSideRpc: ServerSideRpcBacnetKey[];
  altResponsesAddresses: string[];
}

export interface BacnetKey {
  key: string;
  objectType: BacnetKeyObjectType;
  objectId: string;
  propertyId: BacnetPropertyId;
  reportStrategy?: ReportStrategyConfig;
}

export type BacnetDeviceKey = BacnetKey | ServerSideRpcBacnetKey | AttributeUpdateBacnetKey;

export type BacnetLegacyDeviceKey = BacnetLegacyKey | ServerSideRpcBacnetLegacyKey | AttributeUpdateBacnetLegacyKey;

export type BacnetLegacyKey = Omit<BacnetKey, 'objectType'>;

export interface AttributeUpdateBacnetKey extends BacnetKey {
  requestType: BacnetRequestType;
}

export interface ServerSideRpcBacnetKey extends Omit<BacnetKey, 'key'> {
  requestType: BacnetRequestType;
  method: string;
  requestTimeout: number;
}

export type ServerSideRpcBacnetLegacyKey = Omit<ServerSideRpcBacnetKey, 'objectType'>;

export type AttributeUpdateBacnetLegacyKey = Omit<AttributeUpdateBacnetKey, 'objectType'>;

export interface BacnetLegacyDeviceConfig {
  deviceName: string;
  deviceType: string;
  address: string;
  pollPeriod: number;
  attributes: BacnetLegacyKey[];
  timeseries: BacnetLegacyKey[];
  attributeUpdates: AttributeUpdateBacnetLegacyKey[];
  serverSideRpc: ServerSideRpcBacnetLegacyKey[];
}

export interface BacnetDeviceConfigInfo {
  value: BacnetDeviceConfig;
  buttonTitle: string;
  withReportStrategy?: boolean;
  hideNewFields?: boolean;
}
