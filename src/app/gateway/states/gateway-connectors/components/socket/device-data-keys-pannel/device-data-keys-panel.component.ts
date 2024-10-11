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

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { PageComponent, SharedModule } from '@shared/public-api';
import { TbPopoverComponent } from '@shared/components/popover.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import {
  DeviceAttributesRequests,
  DeviceDataKey, DeviceRpcMethod,
  ExpressionType,
  noLeadTrailSpacesRegex,
  RequestsType,
  SocketAttributeUpdates, SocketDeviceKeys,
  SocketEncoding,
  SocketValueKey,
} from '../../../../../shared/models/public-api';
import { CommonModule } from '@angular/common';
import { EllipsisChipListDirective } from '../../../../../shared/directives/ellipsis-chip-list.directive';
import { GatewayHelpLinkPipe } from '../../../../../shared/pipes/gateway-help-link.pipe';

@Component({
  selector: 'tb-device-data-keys-panel',
  templateUrl: './device-data-keys-panel.component.html',
  styleUrls: ['./device-data-keys-panel.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
    GatewayHelpLinkPipe,
  ]
})
export class DeviceDataKeysPanelComponent extends PageComponent implements OnInit {

  @Input()
  panelTitle: string;

  @Input()
  addKeyTitle: string;

  @Input()
  deleteKeyTitle: string;

  @Input()
  noKeysText: string;

  @Input()
  keys: Array<SocketDeviceKeys>;

  @Input()
  keysType: SocketValueKey;

  @Input()
  popover: TbPopoverComponent<DeviceDataKeysPanelComponent>;

  @Output()
  keysDataApplied = new EventEmitter<Array<DeviceDataKey> | { [key: string]: unknown }>();

  SocketValueKey = SocketValueKey;
  socketEncoding = Object.values(SocketEncoding);
  requestsType = Object.values(RequestsType);
  expressionType = Object.values(ExpressionType);

  keysListFormArray: UntypedFormArray;

  constructor(private fb: UntypedFormBuilder,
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
        byteFrom: [0],
        byteTo: [0],
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
    const keys = this.keysListFormArray.value;
    this.keysDataApplied.emit(keys);
  }

  private prepareKeysFormArray(keys: Array<SocketDeviceKeys>): UntypedFormArray {
    const keysControlGroups: Array<AbstractControl> = [];
    if (keys) {
      keys.forEach(keyData => {
        let dataKeyFormGroup: FormGroup;
        if (this.keysType === SocketValueKey.RPC_METHODS) {
          const rpcKeyData = keyData as DeviceRpcMethod;
          dataKeyFormGroup = this.fb.group({
            methodRPC: [rpcKeyData.methodRPC, [Validators.required]],
            encoding: [rpcKeyData.encoding, [Validators.required]],
            withResponse: [true]
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
            encoding: [(keyData as SocketAttributeUpdates).encoding, [Validators.required]],
            attributeOnThingsBoard: [(keyData as SocketAttributeUpdates).attributeOnThingsBoard, [Validators.required]],
          });
        } else {
          const {key, byteFrom, byteTo} = keyData as DeviceDataKey;
          dataKeyFormGroup = this.fb.group({
            key: [key, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
            byteFrom: [byteFrom],
            byteTo: [byteTo]
          });
        }
        keysControlGroups.push(dataKeyFormGroup);
      });
    }
    return this.fb.array(keysControlGroups);
  }

  protected readonly ExpressionType = ExpressionType;
}
