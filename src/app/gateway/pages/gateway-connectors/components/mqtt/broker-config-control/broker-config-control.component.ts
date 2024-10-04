///
/// Copyright © 2024 ThingsBoard, Inc.
///

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, OnDestroy } from '@angular/core';
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
  BrokerConfig,
  MqttVersions,
  noLeadTrailSpacesRegex,
  PortLimits,
  GatewayPortTooltipPipe
} from '../../../../../shared/public-api';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { generateSecret } from '@core/public-api';
import { Subject } from 'rxjs';
import { SecurityConfigComponent } from '../../security-config/security-config.component';

@Component({
  selector: 'tb-broker-config-control',
  templateUrl: './broker-config-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SecurityConfigComponent,
    GatewayPortTooltipPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BrokerConfigControlComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BrokerConfigControlComponent),
      multi: true
    }
  ]
})
export class BrokerConfigControlComponent implements ControlValueAccessor, Validator, OnDestroy {
  brokerConfigFormGroup: UntypedFormGroup;
  mqttVersions = MqttVersions;
  portLimits = PortLimits;

  private onChange: (value: string) => void;
  private onTouched: () => void;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder,
              private cdr: ChangeDetectorRef) {
    this.brokerConfigFormGroup = this.fb.group({
      host: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      port: [null, [Validators.required, Validators.min(PortLimits.MIN), Validators.max(PortLimits.MAX)]],
      version: [5, []],
      clientId: ['tb_gw_' + generateSecret(5), [Validators.pattern(noLeadTrailSpacesRegex)]],
      security: []
    });

    this.brokerConfigFormGroup.valueChanges.subscribe(value => {
      this.onChange(value);
      this.onTouched();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generate(formControlName: string): void {
    this.brokerConfigFormGroup.get(formControlName)?.patchValue('tb_gw_' + generateSecret(5));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(brokerConfig: BrokerConfig): void {
    const {
      version = 5,
      clientId = `tb_gw_${generateSecret(5)}`,
      security = {},
    } = brokerConfig;

    this.brokerConfigFormGroup.reset({ ...brokerConfig, version, clientId, security }, { emitEvent: false });
    this.cdr.markForCheck();
  }

  validate(): ValidationErrors | null {
    return this.brokerConfigFormGroup.valid ? null : {
      brokerConfigFormGroup: {valid: false}
    };
  }
}
