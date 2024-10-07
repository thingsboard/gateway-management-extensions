///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Component, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import {
  BrokerConfig,
  MQTTBasicConfig_v3_5_2,
  MQTTLegacyBasicConfig,
  RequestMappingData,
  RequestMappingValue,
  RequestType,
  WorkersConfig,
  MqttVersionMappingUtil,
} from '../../../../../shared/public-api';
import {
  MqttBasicConfigDirective
} from './mqtt-basic-config.abstract';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import {
  SecurityConfigComponent
} from '../../security-config/security-config.component';
import {
  WorkersConfigControlComponent
} from '../workers-config-control/workers-config-control.component';
import {
  BrokerConfigControlComponent
} from '../broker-config-control/broker-config-control.component';
import {
  MappingTableComponent
} from '../../mapping-table/mapping-table.component';

@Component({
  selector: 'tb-mqtt-legacy-basic-config',
  templateUrl: './mqtt-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MqttLegacyBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MqttLegacyBasicConfigComponent),
      multi: true
    }
  ],
  styleUrls: ['./mqtt-basic-config.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SecurityConfigComponent,
    WorkersConfigControlComponent,
    BrokerConfigControlComponent,
    MappingTableComponent,
  ],
})
export class MqttLegacyBasicConfigComponent extends MqttBasicConfigDirective<MQTTLegacyBasicConfig> {

  protected override mapConfigToFormValue(config: MQTTLegacyBasicConfig): MQTTBasicConfig_v3_5_2 {
    const {
      broker,
      mapping = [],
      connectRequests = [],
      disconnectRequests = [],
      attributeRequests = [],
      attributeUpdates = [],
      serverSideRpc = []
    } = config as MQTTLegacyBasicConfig;
    const updatedRequestMapping = MqttVersionMappingUtil.mapRequestsToUpgradedVersion({
      connectRequests,
      disconnectRequests,
      attributeRequests,
      attributeUpdates,
      serverSideRpc
    });
    return {
      workers: broker && (broker.maxNumberOfWorkers || broker.maxMessageNumberPerWorker) ? {
        maxNumberOfWorkers: broker.maxNumberOfWorkers,
        maxMessageNumberPerWorker: broker.maxMessageNumberPerWorker,
      } : {} as WorkersConfig,
      mapping: MqttVersionMappingUtil.mapMappingToUpgradedVersion(mapping) || [],
      broker: broker || {} as BrokerConfig,
      requestsMapping: this.getRequestDataArray(updatedRequestMapping),
    };
  }

  protected override getMappedValue(basicConfig: MQTTBasicConfig_v3_5_2): MQTTLegacyBasicConfig {
    const { broker, workers, mapping, requestsMapping  } = basicConfig || {};

    const updatedRequestMapping = (requestsMapping as RequestMappingData[])?.length
      ? this.getRequestDataObject(requestsMapping as RequestMappingValue[])
      : {} as Record<RequestType, RequestMappingData[]>;

    return {
      broker: this.getBrokerMappedValue(broker, workers),
      mapping: MqttVersionMappingUtil.mapMappingToDowngradedVersion(mapping),
      ...(MqttVersionMappingUtil.mapRequestsToDowngradedVersion(updatedRequestMapping as Record<RequestType, RequestMappingData[]>))
    };
  }
}