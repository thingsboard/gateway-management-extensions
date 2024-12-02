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
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { DialogService } from '@core/public-api';
import { TbTableDatasource, } from '@shared/public-api';
import { ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive()
export abstract class AbstractDevicesConfigTableComponent<Entity> implements ControlValueAccessor, Validator, AfterViewInit {

  withReportStrategy = input(true);

  @ViewChild('searchInput') searchInputField: ElementRef;

  textSearchMode = false;
  dataSource: TbTableDatasource<Entity>;
  entityFormGroup: FormArray;

  protected onChange: (value: Entity[]) => void = () => {};
  protected translate = inject(TranslateService);
  protected dialog = inject(MatDialog);
  protected dialogService = inject(DialogService);
  protected fb = inject(FormBuilder);
  protected cd = inject(ChangeDetectorRef);
  protected destroyRef = inject(DestroyRef);

  textSearch = this.fb.control('', { nonNullable: true });

  constructor() {
    this.entityFormGroup = this.fb.array([]);
    this.entityFormGroup.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(value => {
      this.updateTableData(value);
      this.onChange(value);
    });
    this.dataSource = this.getDatasource();
  }

  ngAfterViewInit(): void {
    this.textSearch.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged((prev, current) => (prev ?? '') === current.trim()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(text => this.updateTableData(this.entityFormGroup.value, text.trim()));
  }

  registerOnChange(fn: (value: Entity[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {}

  writeValue(devices: Entity[]): void {
    this.entityFormGroup.clear();
    this.pushDataAsFormArrays(devices);
  }

  enterFilterMode(): void {
    this.textSearchMode = true;
    this.cd.detectChanges();
    const searchInput = this.searchInputField.nativeElement;
    searchInput.focus();
    searchInput.setSelectionRange(0, 0);
  }

  exitFilterMode(): void {
    this.updateTableData(this.entityFormGroup.value);
    this.textSearchMode = false;
    this.textSearch.reset();
  }

  validate(): ValidationErrors | null {
    return this.entityFormGroup.controls.length ? null : {
      devicesFormGroup: {valid: false}
    };
  }

  protected updateTableData(data: Entity[], textSearch?: string): void {
    if (textSearch) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(textSearch.toLowerCase())
        )
      );
    }
    this.dataSource.loadData(data);
  }

  private pushDataAsFormArrays(entity: Entity[]): void {
    if (entity?.length) {
      entity.forEach((slave: any) => this.entityFormGroup.push(this.fb.control(slave)));
    }
  }

  protected abstract getDatasource(): TbTableDatasource<Entity>;
}
