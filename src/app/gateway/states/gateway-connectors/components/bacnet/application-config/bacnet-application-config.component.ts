import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormGroup,
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

  get applicationConfigFormGroup(): UntypedFormGroup {
    return this.formGroup;
  }

  protected override initFormGroup(): UntypedFormGroup {
    return this.fb.group({
      objectName: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      host: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      port: [null, [Validators.required, Validators.min(PortLimits.MIN), Validators.max(PortLimits.MAX)]],
      objectIdentifier: [null, [Validators.required]],
      vendorIdentifier: [],
      maxApduLengthAccepted: [],
      segmentationSupported: [SegmentationType.BOTH],
    });
  }

  protected override onWriteValue(applicationConfig: BacnetApplicationConfig): void {
    this.formGroup.reset(applicationConfig, { emitEvent: false });
  }
}
