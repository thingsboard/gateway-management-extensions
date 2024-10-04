///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { AfterViewInit, Directive, EventEmitter, inject, Input, OnDestroy, Output, TemplateRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, ValidationErrors, Validator } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive()
export abstract class GatewayConnectorBasicConfigDirective<InputBasicConfig, OutputBasicConfig>
  implements AfterViewInit, ControlValueAccessor, Validator, OnDestroy {

  @Input() generalTabContent: TemplateRef<any>;
  @Output() initialized = new EventEmitter<void>();

  basicFormGroup: FormGroup;

  protected fb = inject(FormBuilder);
  protected onChange!: (value: OutputBasicConfig) => void;
  protected onTouched!: () => void;
  protected destroy$ = new Subject<void>();

  constructor() {
    this.basicFormGroup = this.initBasicFormGroup();

    this.basicFormGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.onBasicFormGroupChange(value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.initialized.emit();
  }

  validate(): ValidationErrors | null {
    return this.basicFormGroup.valid ? null : { basicFormGroup: { valid: false } };
  }

  registerOnChange(fn: (value: OutputBasicConfig) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(config: OutputBasicConfig): void {
    this.basicFormGroup.setValue(this.mapConfigToFormValue(config), { emitEvent: false });
  }

  protected onBasicFormGroupChange(value: InputBasicConfig): void {
    this.onChange(this.getMappedValue(value));
    this.onTouched();
  }

  protected abstract mapConfigToFormValue(config: OutputBasicConfig): InputBasicConfig;
  protected abstract getMappedValue(config: InputBasicConfig): OutputBasicConfig;
  protected abstract initBasicFormGroup(): FormGroup;
}
