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

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  Validators
} from '@angular/forms';
import { coerceBoolean, PageComponent, SharedModule } from '@shared/public-api';
import { TbPopoverComponent } from '@shared/components/popover.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import {
  noLeadTrailSpacesRegex,
  ReportStrategyDefaultValue,
  SocketEncoding,
} from '../../../../../shared/models/public-api';
import {
  DeviceAttributesRequests,
  DeviceDataKey,
  DeviceRpcMethod,
  ExpressionType,
  RequestsType,
  SocketAttributeUpdates,
  SocketDeviceKeys,
  SocketValueKey,
} from '../../../models/public-api';
import { CommonModule } from '@angular/common';
import { ReportStrategyComponent } from '../../../../../shared/components/report-strategy/report-strategy.component';

@Component({
  selector: 'tb-device-data-keys-panel',
  templateUrl: './device-data-keys-panel.component.html',
  styleUrls: ['./device-data-keys-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReportStrategyComponent,
  ]
})
export class DeviceDataKeysPanelComponent extends PageComponent implements OnInit {

  @Input() panelTitle: string;
  @Input() addKeyTitle: string;
  @Input() deleteKeyTitle: string;
  @Input() noKeysText: string;
  @Input() keys: Array<SocketDeviceKeys>;
  @Input() keysType: SocketValueKey;
  @Input() @coerceBoolean() withReportStrategy = true;

  @Output() keysDataApplied = new EventEmitter<Array<SocketDeviceKeys>>();

  readonly SocketValueKey = SocketValueKey;
  readonly socketEncoding = Object.values(SocketEncoding);
  readonly requestsType = Object.values(RequestsType);
  readonly expressionType = Object.values(ExpressionType);
  readonly ExpressionType = ExpressionType;
  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;

  keysListFormArray: UntypedFormArray;

  constructor(private fb: FormBuilder,
              private popover: TbPopoverComponent<DeviceDataKeysPanelComponent>,
              protected store: Store<AppState>) {
    super(store);
  }

  ngOnInit(): void {
    this.keysListFormArray = this.prepareKeysFormArray(this.keys);
  }

  trackByKey(index: number, keyControl: AbstractControl): AbstractControl {
    return keyControl;
  }

  addKey(): void {
    let dataKeyFormGroup: FormGroup;
    if (this.keysType === SocketValueKey.RPC_METHODS) {
      dataKeyFormGroup = this.fb.group({
        methodRPC: ['', [Validators.required]],
        encoding: [SocketEncoding.UTF16, [Validators.required]],
        withResponse: [true]
      });
    } else if (this.keysType === SocketValueKey.ATTRIBUTES_UPDATES) {
      dataKeyFormGroup = this.fb.group({
        encoding: [SocketEncoding.UTF16, [Validators.required]],
        attributeOnThingsBoard: ['', [Validators.required]],
      });
    } else if (this.keysType === SocketValueKey.ATTRIBUTES_REQUESTS) {
      dataKeyFormGroup = this.fb.group({
        type: [RequestsType.Shared],
        requestExpressionSource: [ExpressionType.Constant],
        attributeNameExpressionSource: [ExpressionType.Constant],
        requestExpression: ['', [Validators.required]],
        attributeNameExpression: ['', [Validators.required]]
      });
    } else {
      dataKeyFormGroup = this.fb.group({
        key: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
        byteFrom: [0, [Validators.required]],
        byteTo: [0, [Validators.required]],
        reportStrategy: [{value: null, disabled: this.isReportStrategyDisabled()}]
      });
    }
    this.keysListFormArray.push(dataKeyFormGroup);
  }

  deleteKey($event: Event, index: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.keysListFormArray.removeAt(index);
    this.keysListFormArray.markAsDirty();
  }

  cancel(): void {
    this.popover?.hide();
  }

  applyKeysData(): void {
    let keys = this.keysListFormArray.value.map(({ reportStrategy, ...key }) => ({
      ...key,
      ...reportStrategy && { reportStrategy },
    }));
    this.keysDataApplied.emit(keys);
  }

  private prepareKeysFormArray(keys: Array<SocketDeviceKeys>): UntypedFormArray {
    const keysControlGroups: Array<AbstractControl> = [];
    keys?.forEach(keyData => {
      let dataKeyFormGroup: FormGroup;
      if (this.keysType === SocketValueKey.RPC_METHODS) {
        const rpcKeyData = keyData as DeviceRpcMethod;
        dataKeyFormGroup = this.fb.group({
          methodRPC: [rpcKeyData.methodRPC, [Validators.required]],
          encoding: [rpcKeyData.encoding, [Validators.required]],
          withResponse: [rpcKeyData.withResponse]
        });
      } else if (this.keysType === SocketValueKey.ATTRIBUTES_REQUESTS) {
        const attributeRequestsKeyData = keyData as DeviceAttributesRequests;
        dataKeyFormGroup = this.fb.group({
          type: [attributeRequestsKeyData.type ?? RequestsType.Shared],
          requestExpressionSource: [attributeRequestsKeyData.requestExpressionSource ?? ExpressionType.Constant],
          attributeNameExpressionSource: [attributeRequestsKeyData.attributeNameExpressionSource ?? ExpressionType.Constant],
          requestExpression: [attributeRequestsKeyData.requestExpression, [Validators.required]],
          attributeNameExpression: [attributeRequestsKeyData.attributeNameExpression, [Validators.required]]
        });
      } else if (this.keysType === SocketValueKey.ATTRIBUTES_UPDATES) {
        dataKeyFormGroup = this.fb.group({
          encoding: [(keyData as SocketAttributeUpdates).encoding ?? SocketEncoding.UTF16],
          attributeOnThingsBoard: [(keyData as SocketAttributeUpdates).attributeOnThingsBoard, [Validators.required]],
        });
      } else {
        const {key, byteFrom, byteTo, reportStrategy} = keyData as DeviceDataKey;
        dataKeyFormGroup = this.fb.group({
          key: [key, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
          byteFrom: [byteFrom ?? 0, [Validators.required]],
          byteTo: [byteTo ?? 0, [Validators.required]],
          reportStrategy: [{ value: reportStrategy, disabled: this.isReportStrategyDisabled()}]
        });
      }
      keysControlGroups.push(dataKeyFormGroup);
    });
    return this.fb.array(keysControlGroups);
  }

  private isReportStrategyDisabled(): boolean {
    return !(this.withReportStrategy && (this.keysType === SocketValueKey.ATTRIBUTES || this.keysType === SocketValueKey.TIMESERIES));
  }
}
