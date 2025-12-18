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
import { AfterViewInit, Component, EventEmitter, forwardRef, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/public-api';
import {
  GatewayStorageConfig,
  StorageTypes,
  StorageTypesTranslationMap
} from '../../../models/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { directoryRegex, numberInputPattern } from '../../../../../shared/models/public-api';
import { isDefinedAndNotNull } from "@core/public-api";

@Component({
  selector: 'tb-gateway-storage-configuration',
  templateUrl: './gateway-storage-configuration.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GatewayStorageConfigurationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GatewayStorageConfigurationComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class GatewayStorageConfigurationComponent implements AfterViewInit, Validators, ControlValueAccessor {

  @Output() initialized = new EventEmitter();

  readonly StorageTypes = StorageTypes;
  readonly storageTypes = Object.values(StorageTypes);
  readonly storageTypesTranslationMap = StorageTypesTranslationMap;

  storageFormGroup: FormGroup;

  private onChange: (value: GatewayStorageConfig) => void = () => {};

  constructor(private fb: FormBuilder) {
    this.storageFormGroup = this.initStorageFormGroup();
    this.observeStorageTypeChanges();
    this.storageFormGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      this.onChange(value);
    });
  }

  ngAfterViewInit(): void {
    this.initialized.emit({ storage: this.storageFormGroup.value });
  }

  writeValue(value: GatewayStorageConfig): void {
    if (isDefinedAndNotNull(value)) {
      const type = this.storageFormGroup.get('type').value;
      this.storageFormGroup.patchValue(value, { emitEvent: false });
      if (type !== value.type) {
        this.removeAllStorageValidators();
        this.storageValidators(value.type);
      }
    }
  }

  registerOnChange(fn: (config: GatewayStorageConfig) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => {}): void {}

  validate(): ValidationErrors | null {
    return this.storageFormGroup.valid ? null : {
      storageFormGroup: {valid: false}
    };
  }

  private removeAllStorageValidators(): void {
    for (const storageKey in this.storageFormGroup.controls) {
      if (storageKey !== 'type') {
        this.storageFormGroup.controls[storageKey].clearValidators();
        this.storageFormGroup.controls[storageKey].setErrors(null);
        this.storageFormGroup.controls[storageKey].updateValueAndValidity();
      }
    }
  }

  private initStorageFormGroup(): FormGroup {
    return this.fb.group({
      type: [StorageTypes.MEMORY, [Validators.required]],
      read_records_count: [100, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]],
      max_records_count: [100000, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]],
      data_folder_path: ['./data/', [Validators.required, Validators.pattern(directoryRegex)]],
      max_file_count: [10, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      max_read_records_count: [10, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      max_records_per_file: [10000, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      data_file_path: ['./data/', [Validators.required, Validators.pattern(directoryRegex)]],
      messages_ttl_check_in_hours: [1, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      messages_ttl_in_days: [7, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      size_limit: [1024, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      max_db_amount: [10, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      oversize_check_period: [1, [Validators.min(1), Validators.pattern(numberInputPattern)]],
      writing_batch_size: [1000, [Validators.min(1), Validators.pattern(numberInputPattern)]]
    });
  }

  private observeStorageTypeChanges(): void {
    this.storageFormGroup.get('type').valueChanges.pipe(takeUntilDestroyed()).subscribe(type => {
      this.removeAllStorageValidators();
      this.storageValidators(type);
    });
  }

  private storageValidators(type: StorageTypes) {
    switch (type) {
      case StorageTypes.MEMORY:
        this.addMemoryStorageValidators(this.storageFormGroup);
        break;
      case StorageTypes.FILE:
        this.addFileStorageValidators(this.storageFormGroup);
        this.storageFormGroup.get('data_folder_path').addValidators([Validators.required, Validators.pattern(/.*\/$/)]);
        this.storageFormGroup.get('data_folder_path').updateValueAndValidity({ emitEvent: false });
        break;
      case StorageTypes.SQLITE:
        this.addSqliteStorageValidators(this.storageFormGroup);
        this.storageFormGroup.get('data_file_path').addValidators([Validators.required, Validators.pattern(/.*\/$/)]);
        this.storageFormGroup.get('data_file_path').updateValueAndValidity({ emitEvent: false });
        break;
    }
  }

  private addMemoryStorageValidators(group: FormGroup): void {
    group.get('read_records_count').addValidators([Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]);
    group.get('max_records_count').addValidators([Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]);
    group.get('read_records_count').updateValueAndValidity({ emitEvent: false });
    group.get('max_records_count').updateValueAndValidity({ emitEvent: false });
  }

  private addFileStorageValidators(group: FormGroup): void {
    group.get('data_folder_path').addValidators([Validators.required, Validators.pattern(directoryRegex)]);
    group.get('data_folder_path').updateValueAndValidity({ emitEvent: false });

    ['max_file_count', 'max_read_records_count', 'max_records_per_file'].forEach(field => {
      group.get(field).addValidators([Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]);
      group.get(field).updateValueAndValidity({ emitEvent: false });
    });
  }

  private addSqliteStorageValidators(group: FormGroup): void {
    group.get('data_file_path').addValidators([Validators.required, Validators.pattern(directoryRegex)]);
    group.get('data_file_path').updateValueAndValidity({ emitEvent: false });

    ['messages_ttl_check_in_hours', 'messages_ttl_in_days', 'max_records_per_file'].forEach(field => {
      group.get(field).addValidators([Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]);
      group.get(field).updateValueAndValidity({ emitEvent: false });
    });
  }
}
