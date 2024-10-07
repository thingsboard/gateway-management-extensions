///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Component, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import {
  BrokerConfig,
  MQTTBasicConfig_v3_5_2,
  RequestMappingData,
  RequestMappingValue,
  RequestType,
  WorkersConfig
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
  selector: 'tb-mqtt-basic-config',
  templateUrl: './mqtt-basic-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MqttBasicConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MqttBasicConfigComponent),
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
export class MqttBasicConfigComponent extends MqttBasicConfigDirective<MQTTBasicConfig_v3_5_2> {

  protected override mapConfigToFormValue(basicConfig: MQTTBasicConfig_v3_5_2): MQTTBasicConfig_v3_5_2 {
    const { broker, mapping = [], requestsMapping } = basicConfig;
    return{
      workers: broker && (broker.maxNumberOfWorkers || broker.maxMessageNumberPerWorker) ? {
        maxNumberOfWorkers: broker.maxNumberOfWorkers,
        maxMessageNumberPerWorker: broker.maxMessageNumberPerWorker,
      } : {} as WorkersConfig,
      mapping: mapping ?? [],
      broker: broker ?? {} as BrokerConfig,
      requestsMapping: this.getRequestDataArray(requestsMapping as Record<RequestType, RequestMappingData[]>),
    };
  }

  protected override getMappedValue(basicConfig: MQTTBasicConfig_v3_5_2): MQTTBasicConfig_v3_5_2 {
    const { broker, workers, mapping, requestsMapping  } = basicConfig || {};

    return {
      broker: this.getBrokerMappedValue(broker, workers),
      mapping,
      requestsMapping: (requestsMapping as RequestMappingData[])?.length
        ? this.getRequestDataObject(requestsMapping as RequestMappingValue[])
        : {} as Record<RequestType, RequestMappingValue[]>
    };
  }
}
