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
  ValidationErrors, ValidatorFn,
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
  styleUrls: ['./gateway-storage-configuration.component.scss'],
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

  private readonly numberValidators = [Validators.min(1), Validators.pattern(numberInputPattern)];
  private readonly requiredNumberValidators = [Validators.required, ...this.numberValidators];
  private readonly requiredDirValidators = [Validators.required, Validators.pattern(directoryRegex)];

  private readonly storageConfig: Record<StorageTypes, Record<string, ValidatorFn[]>> = {
    [StorageTypes.MEMORY]: {
      read_records_count: this.requiredNumberValidators,
      max_records_count: this.requiredNumberValidators
    },
    [StorageTypes.FILE]: {
      data_folder_path: this.requiredDirValidators,
      max_file_count: this.requiredNumberValidators,
      max_read_records_count: this.requiredNumberValidators,
      max_records_per_file: this.requiredNumberValidators
    },
    [StorageTypes.SQLITE]: {
      data_file_path: this.requiredDirValidators,
      messages_ttl_check_in_hours: this.requiredNumberValidators,
      messages_ttl_in_days: this.requiredNumberValidators,
      max_read_records_count: this.requiredNumberValidators,
      size_limit: this.numberValidators,
      max_db_amount: this.numberValidators,
      oversize_check_period: this.numberValidators,
      writing_batch_size: this.numberValidators
    }
  };

  constructor(private fb: FormBuilder) {
    this.storageFormGroup = this.initStorageFormGroup();
    this.observeStorageTypeChanges();
    this.storageFormGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      this.onChange(value);
    });
  }

  ngAfterViewInit(): void {
    this.updateValidators(this.storageFormGroup.get('type').value);
    this.initialized.emit({ storage: this.storageFormGroup.value });
  }

  writeValue(value: GatewayStorageConfig): void {
    if (isDefinedAndNotNull(value)) {
      this.storageFormGroup.patchValue(value, { emitEvent: false });
      this.updateValidators(value.type);
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

  private initStorageFormGroup(): FormGroup {
    return this.fb.group({
      type: [StorageTypes.MEMORY, [Validators.required]],
      read_records_count: [100],
      max_records_count: [100000],
      data_folder_path: ['./data/'],
      max_file_count: [10],
      max_read_records_count: [10],
      max_records_per_file: [10000],
      data_file_path: ['./data/'],
      messages_ttl_check_in_hours: [1],
      messages_ttl_in_days: [7],
      size_limit: [1024],
      max_db_amount: [10],
      oversize_check_period: [1],
      writing_batch_size: [1000]
    });
  }

  private observeStorageTypeChanges(): void {
    this.storageFormGroup.get('type').valueChanges.pipe(takeUntilDestroyed()).subscribe((type: StorageTypes) => {
      this.updateValidators(type);
    });
  }

  private updateValidators(type: StorageTypes): void {
    const activeConfig = this.storageConfig[type];

    Object.keys(this.storageFormGroup.controls).forEach(key => {
      if (key === 'type') return;

      const control = this.storageFormGroup.get(key);
      const activeValidators = activeConfig[key];

      if (activeValidators) {
        control.enable({ emitEvent: false });
        control.setValidators(activeValidators);
        control.updateValueAndValidity({ emitEvent: false });
        control.markAsTouched({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
        control.clearValidators();
        control.updateValueAndValidity({ emitEvent: false });
        control.markAsUntouched({ emitEvent: false });
      }
    });
  }
}
