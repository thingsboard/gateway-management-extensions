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
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { coerceBoolean } from '@shared/public-api';
import { TbPopoverComponent } from '@shared/components/popover.component';
import { Store } from '@ngrx/store';
import { PageComponent } from '@shared/public-api';
import { isDefinedAndNotNull, AppState } from '@core/public-api';
import {
  MappingDataKey,
  MappingKeysType,
  MappingValueType,
  mappingValueTypesMap,
  noLeadTrailSpacesRegex,
  OPCUaSourceType,
  ReportStrategyDefaultValue,
  RpcMethodsMapping,
} from '../../../../shared/public-api';

@Component({
  selector: 'tb-mapping-data-keys-panel',
  templateUrl: './mapping-data-keys-panel.component.html',
  styleUrls: ['./mapping-data-keys-panel.component.scss'],
  providers: []
})
export class MappingDataKeysPanelComponent extends PageComponent implements OnInit {

  @Input() panelTitle: string;
  @Input() addKeyTitle: string;
  @Input() deleteKeyTitle: string;
  @Input() noKeysText: string;
  @Input() keys: Array<MappingDataKey> | {[key: string]: any};
  @Input() keysType: MappingKeysType;
  @Input() valueTypeKeys: Array<MappingValueType | OPCUaSourceType> = Object.values(MappingValueType) as Array<MappingValueType | OPCUaSourceType>;
  @Input() valueTypeEnum = MappingValueType;
  @Input() valueTypes = mappingValueTypesMap;
  @Input() @coerceBoolean() rawData = false;
  @Input() @coerceBoolean() withReportStrategy = true;
  @Input() popover: TbPopoverComponent<MappingDataKeysPanelComponent>;

  @Output() keysDataApplied = new EventEmitter<Array<MappingDataKey> | {[key: string]: unknown}>();

  readonly MappingKeysType = MappingKeysType;
  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;

  keysListFormArray: UntypedFormArray;

  errorText = '';

  constructor(private fb: UntypedFormBuilder,
              protected store: Store<AppState>) {
    super(store);
  }

  ngOnInit(): void {
    this.keysListFormArray = this.prepareKeysFormArray(this.keys);
  }

  trackByKey(index: number, keyControl: AbstractControl): any {
    return keyControl;
  }

  addKey(): void {
    let dataKeyFormGroup: FormGroup;
    if (this.keysType === MappingKeysType.RPC_METHODS) {
      dataKeyFormGroup = this.fb.group({
        method: ['', [Validators.required]],
        arguments: [[], []]
      });
    } else {
      dataKeyFormGroup = this.fb.group({
        key: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
        value: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
        reportStrategy: [{value: null, disabled: this.isReportStrategyDisabled()}]
      });
    }
    if (this.keysType !== MappingKeysType.CUSTOM && this.keysType !== MappingKeysType.RPC_METHODS) {
      const controlValue = this.rawData ? 'raw' : this.valueTypeKeys[0];
      dataKeyFormGroup.addControl('type', this.fb.control(controlValue));
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
    let keys = this.keysListFormArray.value;
    if (this.keysType === MappingKeysType.CUSTOM) {
      keys = {};
      for (let key of this.keysListFormArray.value) {
        keys[key.key] = key.value;
      }
    }
    this.keysDataApplied.emit(keys);
  }

  private prepareKeysFormArray(keys: Array<MappingDataKey | RpcMethodsMapping> | {[key: string]: any}): UntypedFormArray {
    const keysControlGroups: Array<AbstractControl> = [];
    if (keys) {
      if (this.keysType === MappingKeysType.CUSTOM) {
        keys = Object.keys(keys).map(key => {
          return {key, value: keys[key], type: ''};
        });
      }
      keys.forEach((keyData) => {
        let dataKeyFormGroup: FormGroup;
        if (this.keysType === MappingKeysType.RPC_METHODS) {
          dataKeyFormGroup = this.fb.group({
            method: [(keyData as RpcMethodsMapping).method, [Validators.required]],
            arguments: [[...(keyData as RpcMethodsMapping).arguments], []]
          });
        } else {
          const { key, value, type, reportStrategy } = keyData;
          dataKeyFormGroup = this.fb.group({
            key: [key, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
            value: [value, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
            type: [type, []],
            reportStrategy: [{ value: reportStrategy, disabled: this.isReportStrategyDisabled()}]
          });
        }
        keysControlGroups.push(dataKeyFormGroup);
      });
    }
    return this.fb.array(keysControlGroups);
  }

  valueTitle(keyControl: FormControl): string {
    const value = keyControl.get(this.keysType === MappingKeysType.RPC_METHODS ? 'method' : 'value').value;
    if (isDefinedAndNotNull(value)) {
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    }
    return '';
  }

  private isReportStrategyDisabled(): boolean {
    return !(this.withReportStrategy && (this.keysType === MappingKeysType.ATTRIBUTES || this.keysType === MappingKeysType.TIMESERIES));
  }
}
