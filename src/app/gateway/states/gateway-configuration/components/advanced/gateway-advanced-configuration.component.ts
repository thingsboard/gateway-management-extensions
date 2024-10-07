///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { Component, forwardRef, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { GatewayConfigValue } from '../../models/public-api';

@Component({
  selector: 'tb-gateway-advanced-configuration',
  templateUrl: './gateway-advanced-configuration.component.html',
  styleUrls: ['./gateway-advanced-configuration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GatewayAdvancedConfigurationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GatewayAdvancedConfigurationComponent),
      multi: true
    }
  ],
})
export class GatewayAdvancedConfigurationComponent implements OnDestroy, ControlValueAccessor, Validators {

  advancedFormControl: FormControl;

  private onChange: (value: unknown) => void;
  private onTouched: () => void;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.advancedFormControl = this.fb.control('');
    this.advancedFormControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onChange(value);
        this.onTouched();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(advancedConfig: GatewayConfigValue): void {
    this.advancedFormControl.reset(advancedConfig, {emitEvent: false});
  }

  validate(): ValidationErrors | null {
    return this.advancedFormControl.valid ? null : {
      advancedFormControl: {valid: false}
    };
  }
}
