///
/// Copyright © 2024 ThingsBoard, Inc.
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
import { coerceBoolean, DataKeyType } from '@shared/public-api';
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
  RpcMethodsMapping,
} from '../../../../shared/public-api';

@Component({
  selector: 'tb-mapping-data-keys-panel',
  templateUrl: './mapping-data-keys-panel.component.html',
  styleUrls: ['./mapping-data-keys-panel.component.scss'],
  providers: []
})
export class MappingDataKeysPanelComponent extends PageComponent implements OnInit {

  @Input()
  panelTitle: string;

  @Input()
  addKeyTitle: string;

  @Input()
  deleteKeyTitle: string;

  @Input()
  noKeysText: string;

  @Input()
  keys: Array<MappingDataKey> | {[key: string]: any};

  @Input()
  keysType: MappingKeysType;

  @Input()
  valueTypeKeys: Array<MappingValueType | OPCUaSourceType> = Object.values(MappingValueType);

  @Input()
  valueTypeEnum = MappingValueType;

  @Input()
  valueTypes: Map<string, any> = mappingValueTypesMap;

  @Input()
  @coerceBoolean()
  rawData = false;

  @Input()
  popover: TbPopoverComponent<MappingDataKeysPanelComponent>;

  @Output()
  keysDataApplied = new EventEmitter<Array<MappingDataKey> | {[key: string]: unknown}>();

  MappingKeysType = MappingKeysType;

  dataKeyType: DataKeyType;

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
        value: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]]
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
            method: [keyData.method, [Validators.required]],
            arguments: [[...keyData.arguments], []]
          });
        } else {
          const { key, value, type } = keyData;
          dataKeyFormGroup = this.fb.group({
            key: [key, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
            value: [value, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
            type: [type, []]
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
}