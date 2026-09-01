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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WidgetContext } from '@home/models/widget-component.models';
import { SharedModule } from '@shared/public-api';
import { noLeadTrailSpacesRegex } from '../../../../shared/public-api';
import {
  RPCTemplateConfigS7,
  S7AddressType,
  S7AddressTypeTranslates,
  S7BooleanDataTypes,
  S7DataType,
  S7DeviceType,
  S7RequestType,
  S7RequestTypeTranslates,
  S7RpcDeviceOption,
} from '../../models/public-api';
import { ControlValueAccessorBaseAbstract } from '../../../../shared/abstract/public-api';
import { ErrorTooltipIconComponent } from '../../../../shared/components/public-api';
import {
  AliasFilterType,
  createDefaultEntityDataPageLink,
  EntityDataQuery,
  EntityKeyType,
  EntityKeyValueType,
  EntityType,
  FilterPredicateType,
  KeyFilter,
  StringOperation,
} from '@shared/public-api';

const S7_DEVICES_PAGE_LIMIT = 100;

@Component({
  selector: 'tb-gateway-s7-rpc-parameters',
  templateUrl: './s7-rpc-parameters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => S7RpcParametersComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => S7RpcParametersComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    SharedModule,
    ErrorTooltipIconComponent,
  ],
})
export class S7RpcParametersComponent extends ControlValueAccessorBaseAbstract<RPCTemplateConfigS7> implements OnInit {

  @Input() ctx: WidgetContext;

  readonly S7RequestType = S7RequestType;
  readonly S7AddressType = S7AddressType;
  readonly S7DeviceType = S7DeviceType;
  readonly S7RequestTypeTranslates = S7RequestTypeTranslates;
  readonly S7AddressTypeTranslates = S7AddressTypeTranslates;
  readonly s7DataTypes = Object.values(S7DataType) as S7DataType[];
  readonly s7DeviceTypes = Object.values(S7DeviceType) as S7DeviceType[];
  readonly s7RequestTypes = Array.from(S7RequestTypeTranslates.keys());
  readonly s7AddressTypes = Array.from(S7AddressTypeTranslates.keys());

  devices: S7RpcDeviceOption[] = [];

  get isBooleanDataType(): boolean {
    return S7BooleanDataTypes.includes(this.formGroup.get('dataType').value);
  }

  constructor(private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.loadDevices();
  }

  protected initFormGroup(): FormGroup {
    const formGroup = this.fb.group({
      deviceName: [null, [Validators.required]],
      deviceType: [S7DeviceType.PLC, [Validators.required]],
      requestType: [S7RequestType.READ, [Validators.required]],
      type: [S7AddressType.DATA, [Validators.required]],
      dataType: [S7DataType.BOOLEAN, [Validators.required]],
      dbNumber: [0, [Validators.required, Validators.min(0)]],
      start: [0, [Validators.required, Validators.min(0)]],
      size: [1, [Validators.required, Validators.min(0)]],
      bit: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
      tag: [{value: null, disabled: true}, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      vmAddress: [{value: null, disabled: true}, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      value: [{value: null, disabled: true}, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    });

    formGroup.get('deviceType').valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(deviceType => this.onDeviceTypeChange(deviceType));
    formGroup.get('requestType').valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(requestType => this.updateValueEnabling(requestType));
    formGroup.get('type').valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(addressType => this.updateAddressTypeEnabling(addressType));
    formGroup.get('dataType').valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateBitEnabling());

    return formGroup;
  }

  protected onWriteValue(value: RPCTemplateConfigS7): void {
    super.onWriteValue(value);
    if (value && typeof value === 'object') {
      const deviceType = value.type === S7AddressType.VM ? S7DeviceType.LOGO : S7DeviceType.PLC;
      this.formGroup.get('deviceType').setValue(deviceType, {emitEvent: false});
      this.onDeviceTypeChange(deviceType);
      this.updateValueEnabling(this.formGroup.get('requestType').value);
    }
  }

  protected override mapOnChangeValue(value: RPCTemplateConfigS7 & {deviceType: S7DeviceType}): RPCTemplateConfigS7 {
    const {deviceType, ...config} = value;
    return config;
  }

  private onDeviceTypeChange(deviceType: S7DeviceType): void {
    const typeControl = this.formGroup.get('type');
    if (deviceType === S7DeviceType.LOGO) {
      typeControl.setValue(S7AddressType.VM, {emitEvent: false});
    } else if (typeControl.value === S7AddressType.VM) {
      typeControl.setValue(S7AddressType.DATA, {emitEvent: false});
    }
    this.updateAddressTypeEnabling(typeControl.value);
  }

  private updateAddressTypeEnabling(addressType: S7AddressType): void {
    const dataType = this.formGroup.get('dataType');
    const dbNumber = this.formGroup.get('dbNumber');
    const start = this.formGroup.get('start');
    const size = this.formGroup.get('size');
    const tag = this.formGroup.get('tag');
    const vmAddress = this.formGroup.get('vmAddress');
    this.toggleControl(dataType, addressType === S7AddressType.DATA);
    this.toggleControl(dbNumber, addressType === S7AddressType.DATA);
    this.toggleControl(start, addressType === S7AddressType.DATA);
    this.toggleControl(size, addressType === S7AddressType.DATA);
    this.toggleControl(tag, addressType === S7AddressType.TAG);
    this.toggleControl(vmAddress, addressType === S7AddressType.VM);
    this.updateBitEnabling();
  }

  private updateBitEnabling(): void {
    const bit = this.formGroup.get('bit');
    const isDataMode = this.formGroup.get('type').value === S7AddressType.DATA;
    const isBoolean = this.isBooleanDataType;
    this.toggleControl(bit, isDataMode && isBoolean);
  }

  private updateValueEnabling(requestType: S7RequestType): void {
    this.toggleControl(this.formGroup.get('value'), requestType === S7RequestType.WRITE);
  }

  private loadDevices(): void {
    const connector = this.ctx.stateController.getStateParams().connector_rpc.value;
    const query: EntityDataQuery = {
      entityFilter: {
        type: AliasFilterType.entityType,
        entityType: EntityType.DEVICE
      },
      pageLink: createDefaultEntityDataPageLink(S7_DEVICES_PAGE_LIMIT),
      entityFields: [{type: EntityKeyType.ENTITY_FIELD, key: 'name'}],
      keyFilters: [
        this.buildAttributeEqualsFilter('connectorType', connector.type),
        this.buildAttributeEqualsFilter('connectorName', connector.name)
      ]
    };
    this.ctx.entityService.findEntityDataByQuery(query).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(pageData => {
      this.devices = pageData.data
        .map(data => ({deviceName: data.latest[EntityKeyType.ENTITY_FIELD]?.name?.value}))
        .filter(device => !!device.deviceName);
      this.cd.detectChanges();
    });
  }

  private buildAttributeEqualsFilter(key: string, value: string): KeyFilter {
    return {
      key: {type: EntityKeyType.SERVER_ATTRIBUTE, key},
      valueType: EntityKeyValueType.STRING,
      predicate: {
        type: FilterPredicateType.STRING,
        operation: StringOperation.EQUAL,
        value: {defaultValue: value},
        ignoreCase: true
      }
    };
  }
}
