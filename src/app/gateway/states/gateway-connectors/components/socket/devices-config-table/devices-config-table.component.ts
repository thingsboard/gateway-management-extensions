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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { TruncateWithTooltipDirective } from '../../../../../shared/directives/public-api';
import { isDefinedAndNotNull, DialogService } from '@core/public-api';
import { CommonModule } from '@angular/common';
import {
  // @ts-ignore
  TbTableDatasource,
  SharedModule,
  coerceBoolean
} from '@shared/public-api';
import { DeviceDialogComponent } from '../device-dialog/device-dialog.component';
import { DeviceConfigInfo, DevicesConfigMapping } from '../../../models/public-api';

@Component({
  selector: 'tb-devices-config-table',
  templateUrl: './devices-config-table.component.html',
  styleUrls: ['./devices-config-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DevicesConfigTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DevicesConfigTableComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [CommonModule, SharedModule, TruncateWithTooltipDirective]
})
export class DevicesConfigTableComponent implements ControlValueAccessor, Validator, AfterViewInit, OnInit, OnDestroy {

  @Input() @coerceBoolean() withReportStrategy = true;

  @ViewChild('searchInput') searchInputField: ElementRef;

  textSearchMode = false;
  dataSource: DevicesDatasource & any;
  devicesFormGroup: FormArray;
  textSearch = this.fb.control('', {nonNullable: true});

  private onChange: (value: DevicesConfigMapping[]) => void = () => {};

  private destroy$ = new Subject<void>();

  constructor(
    public translate: TranslateService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.devicesFormGroup = this.fb.array([]);
    this.dataSource = new DevicesDatasource();
  }

  ngOnInit(): void {
    this.devicesFormGroup.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.updateTableData(value);
      this.onChange(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.textSearch.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged((prev, current) => (prev ?? '') === current.trim()),
      takeUntil(this.destroy$)
    ).subscribe(text => this.updateTableData(this.devicesFormGroup.value, text.trim()));
  }

  registerOnChange(fn: (value: DevicesConfigMapping[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {
  }

  writeValue(devices: DevicesConfigMapping[]): void {
    this.devicesFormGroup.clear();
    this.pushDataAsFormArrays(devices);
  }

  enterFilterMode(): void {
    this.textSearchMode = true;
    this.cdr.detectChanges();
    const searchInput = this.searchInputField.nativeElement;
    searchInput.focus();
    searchInput.setSelectionRange(0, 0);
  }

  exitFilterMode(): void {
    this.updateTableData(this.devicesFormGroup.value);
    this.textSearchMode = false;
    this.textSearch.reset();
  }

  manageDevices($event: Event, index?: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    const withIndex = isDefinedAndNotNull(index);
    const value = withIndex ? this.devicesFormGroup.at(index).value : {};
    this.getDeviceDialog(value, withIndex ? 'action.apply' : 'action.add').afterClosed()
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(res => {
        if (res) {
          if (withIndex) {
            this.devicesFormGroup.at(index).patchValue(res);
          } else {
            this.devicesFormGroup.push(this.fb.control(res));
          }
          this.devicesFormGroup.markAsDirty();
        }
    });
  }

  validate(): ValidationErrors | null {
    return this.devicesFormGroup.controls.length ? null : {
      devicesFormGroup: {valid: false}
    };
  }

  private getDeviceDialog(
    value: DevicesConfigMapping,
    buttonTitle: string
  ): MatDialogRef<DeviceDialogComponent> {
    return this.dialog.open<DeviceDialogComponent, DeviceConfigInfo, DevicesConfigMapping>(DeviceDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        value,
        buttonTitle,
        withReportStrategy: this.withReportStrategy,
      }
    });
  }

  deleteDevice($event: Event, index: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialogService.confirm(
      this.translate.instant('gateway.delete-device-title'),
      '',
      this.translate.instant('action.no'),
      this.translate.instant('action.yes'),
      true
    ).pipe(take(1), takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.devicesFormGroup.removeAt(index);
        this.devicesFormGroup.markAsDirty();
      }
    });
  }

  private updateTableData(data: DevicesConfigMapping[], textSearch?: string): void {
    if (textSearch) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(textSearch.toLowerCase())
        )
      );
    }
    this.dataSource.loadData(data);
  }

  private pushDataAsFormArrays(devices: DevicesConfigMapping[]): void {
    if (devices?.length) {
      devices.forEach((slave: any) => this.devicesFormGroup.push(this.fb.control(slave)));
    }
  }
}

export class DevicesDatasource extends TbTableDatasource<DevicesConfigMapping> {
  constructor() {
    super();
  }
}
