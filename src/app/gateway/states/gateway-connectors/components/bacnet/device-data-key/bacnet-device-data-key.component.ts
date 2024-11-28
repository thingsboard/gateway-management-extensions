import { ChangeDetectionStrategy, Component, forwardRef, input, OnInit } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, UntypedFormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/public-api';
import { noLeadTrailSpacesRegex, ReportStrategyDefaultValue } from '../../../../../shared/models/public-api';
import { ConnectorMappingHelpLinkPipe } from '../../../pipes/gateway-help-link.pipe';
import { ReportStrategyComponent } from '../../../../../shared/components/public-api';
import {
  BacnetDeviceKeysType,
  BacnetKeyObjectType,
  BacnetKeyObjectTypeTranslationsMap,
  BacnetPropertyId,
  BacnetPropertyIdTranslationsMap,
  BacnetRequestType,
  BacnetRequestTypeTranslationsMap,
  BacnetPropertyIdByObjectType
} from '../../../models/public-api';
import { TruncateWithTooltipDirective, EllipsisChipListDirective } from '../../../../../shared/directives/public-api';
import { ControlValueAccessorBaseAbstract } from '../../../../../shared/abstract/public-api';

@Component({
  selector: 'tb-bacnet-device-data-key',
  templateUrl: './bacnet-device-data-key.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BacnetDeviceDataKeyComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BacnetDeviceDataKeyComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
    ConnectorMappingHelpLinkPipe,
    ReportStrategyComponent,
    TruncateWithTooltipDirective,
  ]
})
export class BacnetDeviceDataKeyComponent extends ControlValueAccessorBaseAbstract<any> implements OnInit {

  keyType = input<BacnetDeviceKeysType>();
  withReportStrategy = input<boolean>(false);

  propertyIds = BacnetPropertyIdByObjectType.get(BacnetKeyObjectType.analogOutput);

  readonly objectTypes = Object.values(BacnetKeyObjectType) as BacnetKeyObjectType[];
  readonly requestTypes = Object.values(BacnetRequestType) as BacnetRequestType[];
  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;
  readonly BacnetDeviceKeysType = BacnetDeviceKeysType;
  readonly BacnetKeyObjectTypeTranslationsMap = BacnetKeyObjectTypeTranslationsMap;
  readonly BacnetPropertyIdTranslationsMap = BacnetPropertyIdTranslationsMap;
  readonly BacnetRequestTypeTranslationsMap = BacnetRequestTypeTranslationsMap;

  ngOnInit(): void {
    this.formGroup = this.initKeyFormGroup();
    this.observeValueChanges();
    this.observeObjectType();
  }

  isReportStrategyDisabled(): boolean {
    return !(this.withReportStrategy() && (this.keyType() === BacnetDeviceKeysType.ATTRIBUTES || this.keyType() === BacnetDeviceKeysType.TIMESERIES));
  }

  private initKeyFormGroup(): UntypedFormGroup {
    return this.fb.group({
      key: [{ value: '', disabled: this.keyType() === BacnetDeviceKeysType.RPC_METHODS }, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      method: [{ value: '', disabled: this.keyType() !== BacnetDeviceKeysType.RPC_METHODS }, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      objectType: [BacnetKeyObjectType.analogOutput],
      objectId: [0, [Validators.required]],
      propertyId: [BacnetPropertyId.presentValue],
      requestTimeout: [{ value: 0, disabled: this.keyType() !== BacnetDeviceKeysType.RPC_METHODS }],
      requestType: [{ value: BacnetRequestType.Write, disabled: this.keyType() === BacnetDeviceKeysType.ATTRIBUTES || this.keyType() === BacnetDeviceKeysType.TIMESERIES }],
      reportStrategy: [{ value: null, disabled: this.isReportStrategyDisabled()}],
    });
  }

  private observeObjectType(): void {
    this.formGroup.get('objectType').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(type => {
        this.propertyIds = BacnetPropertyIdByObjectType.get(type);
        if (!this.propertyIds.includes(this.formGroup.get('propertyId').value)) {
          this.formGroup.get('propertyId').patchValue(this.propertyIds[0], {emitEvent: false});
        }
      });
  }

  protected override initFormGroup(): UntypedFormGroup {
    return this.fb.group({});
  }
}
