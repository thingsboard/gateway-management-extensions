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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { TbPopoverComponent } from '@shared/components/popover.component';
import {
  ModbusFunctionCodeTranslationsMap,
  noLeadTrailSpacesRegex,
  nonZeroFloat,
  ReportStrategyDefaultValue,
  TruncateWithTooltipDirective,
  ModbusDataType,
  ModbusEditableDataTypes,
  ModbusObjectCountByDataType
} from '../../../../../shared/public-api';
import {
  ModbusBitTargetType,
  ModbusBitTargetTypeTranslationMap,
  ModbusFormValue,
  ModbusValue,
  ModbusValueKey,
  ModifierType,
  ModifierTypesMap,
} from '../../../models/public-api';
import { CommonModule } from '@angular/common';
import { generateSecret } from '@core/public-api';
import { coerceBoolean, SharedModule } from '@shared/public-api';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ReportStrategyComponent } from '../../../../../shared/components/public-api';

@Component({
  selector: 'tb-modbus-data-keys-panel',
  templateUrl: './modbus-data-keys-panel.component.html',
  styleUrls: ['./modbus-data-keys-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReportStrategyComponent,
    TruncateWithTooltipDirective,
  ]
})
export class ModbusDataKeysPanelComponent implements OnInit, OnDestroy {

  @coerceBoolean()
  @Input() isMaster = false;
  @coerceBoolean()
  @Input() hideNewFields = false;
  @Input() panelTitle: string;
  @Input() addKeyTitle: string;
  @Input() deleteKeyTitle: string;
  @Input() noKeysText: string;
  @Input() keysType: ModbusValueKey;
  @Input() values: ModbusValue[];

  @Output() keysDataApplied = new EventEmitter<Array<ModbusValue>>();

  keysListFormArray: FormArray<UntypedFormGroup>;
  withFunctionCode = true;
  withReportStrategy = true;

  enableModifiersControlMap = new Map<string, FormControl<boolean>>();
  showModifiersMap = new Map<string, boolean>();
  functionCodesMap = new Map();
  defaultFunctionCodes = [];

  readonly modbusDataTypes = Object.values(ModbusDataType);
  readonly modifierTypes: ModifierType[] = Object.values(ModifierType) as ModifierType[];
  readonly bitTargetTypes: ModbusBitTargetType[] = Object.values(ModbusBitTargetType) as ModbusBitTargetType[];
  readonly BitTargetTypeTranslationMap = ModbusBitTargetTypeTranslationMap;
  readonly ModbusEditableDataTypes = ModbusEditableDataTypes;
  readonly ModbusFunctionCodeTranslationsMap = ModbusFunctionCodeTranslationsMap;
  readonly ModifierTypesMap = ModifierTypesMap;
  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;
  readonly ModbusDataType = ModbusDataType;
  readonly ModbusValueKey = ModbusValueKey;

  private destroy$ = new Subject<void>();

  private readonly defaultReadFunctionCodes = [3, 4];
  private readonly bitsReadFunctionCodes = [1, 2];
  private readonly defaultWriteFunctionCodes = [6, 16];
  private readonly bitsWriteFunctionCodes = [5, 15];

  constructor(
    private fb: FormBuilder,
    private popover: TbPopoverComponent<ModbusDataKeysPanelComponent>,
  ) {}

  ngOnInit(): void {
    this.withFunctionCode = !this.isMaster || (this.keysType !== ModbusValueKey.ATTRIBUTES && this.keysType !== ModbusValueKey.TIMESERIES);
    this.withReportStrategy = !this.isMaster
      && (this.keysType === ModbusValueKey.ATTRIBUTES || this.keysType === ModbusValueKey.TIMESERIES)
      && !this.hideNewFields;
    this.keysListFormArray = this.prepareKeysFormArray(this.values);
    this.defaultFunctionCodes = this.getDefaultFunctionCodes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByControlId(_: number, keyControl: AbstractControl): string {
    return keyControl.value.id;
  }

  addKey(): void {
    const id = generateSecret(5);
    const dataKeyFormGroup = this.fb.group({
      tag: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      value: [{value: '', disabled: !this.isMaster}, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      type: [ModbusDataType.BYTES, [Validators.required]],
      address: [null, [Validators.required]],
      objectsCount: [1, [Validators.required]],
      functionCode: [{ value: this.getDefaultFunctionCodes()[0], disabled: !this.withFunctionCode }, [Validators.required]],
      reportStrategy: [{ value: null, disabled: !this.withReportStrategy }],
      modifierType: [{ value: ModifierType.MULTIPLIER, disabled: true }],
      modifierValue: [{ value: 1, disabled: true }, [Validators.pattern(nonZeroFloat)]],
      bit: [{ value: null, disabled: true }],
      bitTargetType: [{ value: ModbusBitTargetType.IntegerType, disabled: true }],
      id: [{value: id, disabled: true}],
    });
    this.showModifiersMap.set(id, false);
    this.enableModifiersControlMap.set(id, this.fb.control(false));
    this.observeKeyDataType(dataKeyFormGroup);
    this.observeObjectsCount(dataKeyFormGroup);
    this.observeEnableModifier(dataKeyFormGroup);

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
    this.popover.hide();
  }

  applyKeysData(): void {
    this.keysDataApplied.emit(this.getFormValue());
  }

  private getFormValue(): ModbusValue[] {
    return this.mapKeysWithModifier(
      this.withReportStrategy
      ? this.cleanUpEmptyStrategies(this.keysListFormArray.value)
      : this.keysListFormArray.value
    );
  }

  private cleanUpEmptyStrategies(values: ModbusValue[]): ModbusValue[] {
    return values.map((key) => {
      const { reportStrategy, ...updatedKey } = key;
      return !reportStrategy ? updatedKey : key;
    });
  }

  private mapKeysWithModifier(values: Array<ModbusFormValue>): Array<ModbusValue> {
    return values.map((keyData, i) => {
      if (this.showModifiersMap.get(this.keysListFormArray.controls[i].get('id').value)) {
        const { modifierType, modifierValue, ...value } = keyData;
        return modifierType ? { ...value, [modifierType]: modifierValue } : value;
      }
      return keyData;
    });
  }

  private prepareKeysFormArray(values: ModbusValue[]): UntypedFormArray {
    const keysControlGroups: Array<AbstractControl> = [];

    if (values) {
      values.forEach(value => {
        const dataKeyFormGroup = this.createDataKeyFormGroup(value);
        this.observeKeyDataType(dataKeyFormGroup);
        this.observeObjectsCount(dataKeyFormGroup);
        this.observeEnableModifier(dataKeyFormGroup);
        this.functionCodesMap.set(dataKeyFormGroup.get('id').value, this.getFunctionCodes(value.type));

        keysControlGroups.push(dataKeyFormGroup);
      });
    }

    return this.fb.array(keysControlGroups);
  }

  private createDataKeyFormGroup(modbusValue: ModbusValue): FormGroup {
    const { tag, value, type, address, objectsCount, functionCode, multiplier, divider, reportStrategy, bit, bitTargetType } = modbusValue;
    const id = generateSecret(5);

    const showModifier = this.shouldShowModifier(type);
    this.showModifiersMap.set(id, showModifier);
    this.enableModifiersControlMap.set(id, this.fb.control((multiplier || divider) && showModifier));

    return this.fb.group({
      tag: [tag, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      value: [{ value, disabled: !this.isMaster }, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      type: [type, [Validators.required]],
      address: [address, [Validators.required]],
      objectsCount: [objectsCount, [Validators.required]],
      functionCode: [{ value: functionCode, disabled: !this.withFunctionCode }, [Validators.required]],
      modifierType: [{
        value: divider ? ModifierType.DIVIDER : ModifierType.MULTIPLIER,
        disabled: !this.enableModifiersControlMap.get(id).value
      }],
      bit: [{ value: bit, disabled: type !== ModbusDataType.BITS || objectsCount < 2 }, [Validators.max(objectsCount - 1)]],
      bitTargetType: [{ value: bitTargetType ?? ModbusBitTargetType.IntegerType, disabled: type !== ModbusDataType.BITS || this.hideNewFields }],
      modifierValue: [
        { value: multiplier ?? divider ?? 1, disabled: !this.enableModifiersControlMap.get(id).value },
        [Validators.pattern(nonZeroFloat)]
      ],
      id: [{ value: id, disabled: true }],
      reportStrategy: [{ value: reportStrategy, disabled: !this.withReportStrategy }],
    });
  }

  private shouldShowModifier(type: ModbusDataType): boolean {
    return !this.isMaster
      && (this.keysType === ModbusValueKey.ATTRIBUTES || this.keysType === ModbusValueKey.TIMESERIES)
      && (!this.ModbusEditableDataTypes.includes(type));
  }

  private observeKeyDataType(keyFormGroup: FormGroup): void {
    keyFormGroup.get('type').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(dataType => {
      if (!this.ModbusEditableDataTypes.includes(dataType)) {
        keyFormGroup.get('objectsCount').patchValue(ModbusObjectCountByDataType[dataType], {emitEvent: false});
      }
      this.toggleBitsFields(keyFormGroup);
      const withModifier = this.shouldShowModifier(dataType);
      this.showModifiersMap.set(keyFormGroup.get('id').value, withModifier);
      this.updateFunctionCodes(keyFormGroup, dataType);
    });
  }

  private observeObjectsCount(keyFormGroup: FormGroup): void {
    keyFormGroup.get('objectsCount').valueChanges
      .pipe(filter(() => keyFormGroup.get('type').value === ModbusDataType.BITS), takeUntil(this.destroy$))
      .subscribe(() => this.toggleBitsFields(keyFormGroup));
  }

  private toggleBitsFields(keyFormGroup: FormGroup): void {
    const { objectsCount, type, bit, bitTargetType } = keyFormGroup.controls;
    const isBitsType = type.value === ModbusDataType.BITS;
    const hasMultipleObjects = objectsCount.value > 1;

    if (isBitsType && hasMultipleObjects) {
      bit.enable({ emitEvent: false });
      bit.setValidators(Validators.max(objectsCount.value - 1));
    } else {
      bit.disable({ emitEvent: false });
    }

    bit.updateValueAndValidity({ emitEvent: false });
    bitTargetType[isBitsType ? 'enable' : 'disable']({ emitEvent: false });
  }

  private observeEnableModifier(keyFormGroup: FormGroup): void {
    this.enableModifiersControlMap.get(keyFormGroup.get('id').value).valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(showModifier => this.toggleModifierControls(keyFormGroup, showModifier));
  }

  private toggleModifierControls(keyFormGroup: FormGroup, enable: boolean): void {
    const modifierTypeControl = keyFormGroup.get('modifierType');
    const modifierValueControl = keyFormGroup.get('modifierValue');

    modifierTypeControl[enable ? 'enable' : 'disable']({emitEvent: false});
    modifierValueControl[enable ? 'enable' : 'disable']({emitEvent: false});

    modifierTypeControl.markAsDirty();
    modifierValueControl.markAsDirty();
  }

  private updateFunctionCodes(keyFormGroup: FormGroup, dataType: ModbusDataType): void {
    const functionCodes = this.getFunctionCodes(dataType);
    this.functionCodesMap.set(keyFormGroup.get('id').value, functionCodes);
    if (!functionCodes.includes(keyFormGroup.get('functionCode').value)) {
      keyFormGroup.get('functionCode').patchValue(functionCodes[0], {emitEvent: false});
    }
  }

  private getFunctionCodes(dataType: ModbusDataType): number[] {
    const writeFunctionCodes = [
      ...(dataType === ModbusDataType.BITS ? this.bitsWriteFunctionCodes : []), ...this.defaultWriteFunctionCodes
    ];

    if (this.keysType === ModbusValueKey.ATTRIBUTES_UPDATES) {
      return writeFunctionCodes.sort((a, b) => a - b);
    }

    const functionCodes = [...this.defaultReadFunctionCodes];
    if (dataType === ModbusDataType.BITS) {
      functionCodes.push(...this.bitsReadFunctionCodes);
    }
    if (this.keysType === ModbusValueKey.RPC_REQUESTS) {
      functionCodes.push(...writeFunctionCodes);
    }

    return functionCodes.sort((a, b) => a - b);
  }

  private getDefaultFunctionCodes(): number[] {
    if (this.keysType === ModbusValueKey.ATTRIBUTES_UPDATES) {
      return this.defaultWriteFunctionCodes;
    }
    if (this.keysType === ModbusValueKey.RPC_REQUESTS) {
      return [...this.defaultReadFunctionCodes, ...this.defaultWriteFunctionCodes];
    }
    return this.defaultReadFunctionCodes;
  }
}
