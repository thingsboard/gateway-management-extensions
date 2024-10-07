///
/// Copyright © 2024 ThingsBoard, Inc.
///

import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnDestroy,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import {
  integerRegex,
  noLeadTrailSpacesRegex,
  RPCTemplateConfigMQTT
} from '../../../../shared/public-api';

@Component({
  selector: 'tb-gateway-mqtt-rpc-parameters',
  templateUrl: './mqtt-rpc-parameters.component.html',
  styleUrls: ['./mqtt-rpc-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MqttRpcParametersComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MqttRpcParametersComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class MqttRpcParametersComponent implements ControlValueAccessor, Validator, OnDestroy {

  rpcParametersFormGroup: UntypedFormGroup;

  private onChange: (value: RPCTemplateConfigMQTT) => void = (_) => {};
  private onTouched: () => void = () => {};

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.rpcParametersFormGroup = this.fb.group({
      methodFilter: [null, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      requestTopicExpression: [null, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      responseTopicExpression: [{ value: null, disabled: true }, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      responseTimeout: [{ value: null, disabled: true }, [Validators.min(10), Validators.pattern(integerRegex)]],
      valueExpression: [null, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      withResponse: [false, []],
    });

    this.observeValueChanges();
    this.observeWithResponse();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerOnChange(fn: (value: RPCTemplateConfigMQTT) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(): ValidationErrors | null {
    return this.rpcParametersFormGroup.valid ? null : {
      rpcParametersFormGroup: { valid: false }
    };
  }

  writeValue(value: RPCTemplateConfigMQTT): void {
    this.rpcParametersFormGroup.patchValue(value, {emitEvent: false});
    this.toggleResponseFields(value.withResponse);
  }

  private observeValueChanges(): void {
    this.rpcParametersFormGroup.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      this.onChange(value);
      this.onTouched();
    });
  }

  private observeWithResponse(): void {
    this.rpcParametersFormGroup.get('withResponse').valueChanges.pipe(
      tap((isActive: boolean) => this.toggleResponseFields(isActive)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private toggleResponseFields(enabled: boolean): void {
    const responseTopicControl = this.rpcParametersFormGroup.get('responseTopicExpression');
    const responseTimeoutControl = this.rpcParametersFormGroup.get('responseTimeout');
    if (enabled) {
      responseTopicControl.enable();
      responseTimeoutControl.enable();
    } else {
      responseTopicControl.disable();
      responseTimeoutControl.disable();
    }
  }
}
