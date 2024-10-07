///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  BrokerConfig,
  MappingType,
  MQTTBasicConfig,
  MQTTBasicConfig_v3_5_2,
  RequestMappingData,
  RequestMappingValue,
  RequestType,
  GatewayConnectorBasicConfigDirective,
  WorkersConfig
} from '../../../../../shared/public-api';
import { isObject } from '@core/public-api';

@Directive()
export abstract class MqttBasicConfigDirective<BasicConfig>
  extends GatewayConnectorBasicConfigDirective<MQTTBasicConfig_v3_5_2, BasicConfig> {

  MappingType = MappingType;

  protected override initBasicFormGroup(): FormGroup {
    return this.fb.group({
      mapping: [],
      requestsMapping: [],
      broker: [],
      workers: [],
    });
  }

  protected getRequestDataArray(value: Record<RequestType, RequestMappingData[]>): RequestMappingData[] {
    const mappingConfigs = [];

    if (isObject(value)) {
      Object.keys(value).forEach((configKey: string) => {
        for (const mapping of value[configKey]) {
          mappingConfigs.push({
            requestType: configKey,
            requestValue: mapping
          });
        }
      });
    }

    return mappingConfigs;
  }

  protected getRequestDataObject(array: RequestMappingValue[]): Record<RequestType, RequestMappingValue[]> {
    return array.reduce((result, { requestType, requestValue }) => {
      result[requestType].push(requestValue);
      return result;
    }, {
      connectRequests: [],
      disconnectRequests: [],
      attributeRequests: [],
      attributeUpdates: [],
      serverSideRpc: [],
    });
  }

  protected getBrokerMappedValue(broker: BrokerConfig, workers: WorkersConfig): BrokerConfig {
    return {
      ...broker,
      maxNumberOfWorkers: workers.maxNumberOfWorkers ?? 100,
      maxMessageNumberPerWorker: workers.maxMessageNumberPerWorker ?? 10,
    };
  }

  writeValue(basicConfig: BasicConfig): void {
    this.basicFormGroup.setValue(this.mapConfigToFormValue(basicConfig), { emitEvent: false });
  }

  protected abstract override mapConfigToFormValue(config: BasicConfig): MQTTBasicConfig_v3_5_2;
  protected abstract override getMappedValue(config: MQTTBasicConfig): BasicConfig;
}
