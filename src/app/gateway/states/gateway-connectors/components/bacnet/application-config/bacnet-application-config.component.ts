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
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { SharedModule } from '@shared/public-api';
import {
  BacnetApplicationConfig,
  PortLimits,
} from '../../../models/public-api';
import { ControlValueAccessorBaseAbstract, noLeadTrailSpacesRegex } from '../../../../../shared/public-api';
import { GatewayPortTooltipPipe } from '../../../pipes/public-api';
import { SegmentationType, SegmentationTypeTranslationsMap } from '../../../models/public-api';
import { deleteNullProperties } from '@core/public-api';

@Component({
  selector: 'tb-bacnet-application-config',
  templateUrl: './bacnet-application-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BacnetApplicationConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BacnetApplicationConfigComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    GatewayPortTooltipPipe,
  ]
})
export class BacnetApplicationConfigComponent extends ControlValueAccessorBaseAbstract<BacnetApplicationConfig> {

  readonly segmentationTypes = Object.values(SegmentationType) as SegmentationType[];
  readonly SegmentationTypeTranslationsMap = SegmentationTypeTranslationsMap;
  readonly portLimits = PortLimits;

  get applicationConfigFormGroup(): FormGroup {
    return this.form as FormGroup;
  }

  protected override initFormGroup(): FormGroup {
    return this.fb.group({
      objectName: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      host: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      port: [null, [Validators.required, Validators.min(PortLimits.MIN), Validators.max(PortLimits.MAX)]],
      mask: [''],
      objectIdentifier: [null, [Validators.required]],
      vendorIdentifier: [null, [Validators.required]],
      maxApduLengthAccepted: [],
      segmentationSupported: [SegmentationType.BOTH],
      networkNumber: [],
      deviceDiscoveryTimeoutInSec: []
    });
  }

  protected override mapOnChangeValue(value: BacnetApplicationConfig): BacnetApplicationConfig {
    deleteNullProperties(value);
    return value;
  }

  protected override onWriteValue(applicationConfig: BacnetApplicationConfig): void {
    const {
      maxApduLengthAccepted = 1476,
      segmentationSupported = SegmentationType.BOTH,
      networkNumber = 3,
      deviceDiscoveryTimeoutInSec = 5,
      ...restConfig
    } = applicationConfig;
    this.applicationConfigFormGroup.reset({ ...restConfig, maxApduLengthAccepted, segmentationSupported, networkNumber, deviceDiscoveryTimeoutInSec }, { emitEvent: false });
  }
}
