///
/// Copyright © 2024 ThingsBoard, Inc.
///

import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import {
  DeviceInfoType,
  noLeadTrailSpacesRegex,
  OPCUaSourceType,
  SourceType,
  SourceTypeTranslationsMap
} from '../../../../shared/public-api';
import { coerceBoolean, PageComponent } from '@shared/public-api';

@Component({
  selector: 'tb-device-info-table',
  templateUrl: './device-info-table.component.html',
  styleUrls: ['./device-info-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DeviceInfoTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DeviceInfoTableComponent),
      multi: true
    }
  ]
})
export class DeviceInfoTableComponent extends PageComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {

  SourceTypeTranslationsMap = SourceTypeTranslationsMap;

  DeviceInfoType = DeviceInfoType;

  @coerceBoolean()
  @Input()
  useSource = true;

  @coerceBoolean()
  @Input()
  required = false;

  @Input()
  sourceTypes: Array<SourceType | OPCUaSourceType> = Object.values(SourceType);

  deviceInfoTypeValue: any;

  get deviceInfoType(): any {
    return this.deviceInfoTypeValue;
  }

  @Input()
  set deviceInfoType(value: any) {
    if (this.deviceInfoTypeValue !== value) {
      this.deviceInfoTypeValue = value;
    }
  }

  mappingFormGroup: UntypedFormGroup;

  private destroy$ = new Subject<void>();
  private propagateChange = (v: any) => {};

  constructor(protected store: Store<AppState>,
              public translate: TranslateService,
              public dialog: MatDialog,
              private fb: FormBuilder) {
    super(store);
  }

  ngOnInit() {
    this.mappingFormGroup = this.fb.group({
      deviceNameExpression: ['', this.required ?
        [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)] : [Validators.pattern(noLeadTrailSpacesRegex)]]
    });

    if (this.useSource) {
      this.mappingFormGroup.addControl('deviceNameExpressionSource',
        this.fb.control(this.sourceTypes[0], []));
    }

    if (this.deviceInfoType === DeviceInfoType.FULL) {
      if (this.useSource) {
        this.mappingFormGroup.addControl('deviceProfileExpressionSource',
          this.fb.control(this.sourceTypes[0], []));
      }
      this.mappingFormGroup.addControl('deviceProfileExpression',
        this.fb.control('', this.required ?
          [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)] : [Validators.pattern(noLeadTrailSpacesRegex)]));
    }

    this.mappingFormGroup.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      this.updateView(value);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  writeValue(deviceInfo: any) {
    this.mappingFormGroup.patchValue(deviceInfo, {emitEvent: false});
  }

  validate(): ValidationErrors | null {
    return this.mappingFormGroup.valid ? null : {
      mappingForm: { valid: false }
    };
  }

  updateView(value: any) {
    this.propagateChange(value);
  }
}
