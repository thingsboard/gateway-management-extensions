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
import { GatewayGRPCConfig } from '../../../models/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { numberInputPattern } from '../../../../../shared/models/public-api';

@Component({
  selector: 'tb-gateway-grpc-configuration',
  templateUrl: './gateway-grpc-configuration.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GatewayGrpcConfigurationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GatewayGrpcConfigurationComponent),
      multi: true
    }
  ],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class GatewayGrpcConfigurationComponent implements AfterViewInit, Validators, ControlValueAccessor {

  @Output() initialized = new EventEmitter();

  grpcFormGroup: FormGroup;

  private onChange: (value: GatewayGRPCConfig) => void = () => {};

  constructor(private fb: FormBuilder) {
    this.grpcFormGroup = this.initGrpcFormGroup();
    this.grpcFormGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      this.onChange(value);
    });
    this.grpcFormGroup.get('enabled').valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      this.toggleRpcFields(value);
    });
  }

  ngAfterViewInit(): void {
    this.initialized.emit({ grpc: this.grpcFormGroup.value });
  }

  writeValue(value: GatewayGRPCConfig): void {
    if (value) {
      this.toggleRpcFields(value.enabled);
    }
    this.grpcFormGroup.patchValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (config: GatewayGRPCConfig) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => {}): void {}

  validate(): ValidationErrors | null {
    return this.grpcFormGroup.valid ? null : {
      grpcFormGroup: {valid: false}
    };
  }

  private toggleRpcFields(enable: boolean): void {
    const grpcGroup = this.grpcFormGroup as FormGroup;
    if (enable) {
      grpcGroup.get('serverPort').enable({emitEvent: false});
      grpcGroup.get('keepAliveTimeMs').enable({emitEvent: false});
      grpcGroup.get('keepAliveTimeoutMs').enable({emitEvent: false});
      grpcGroup.get('keepalivePermitWithoutCalls').enable({emitEvent: false});
      grpcGroup.get('maxPingsWithoutData').enable({emitEvent: false});
      grpcGroup.get('minTimeBetweenPingsMs').enable({emitEvent: false});
      grpcGroup.get('minPingIntervalWithoutDataMs').enable({emitEvent: false});
    } else {
      grpcGroup.get('serverPort').disable({emitEvent: false});
      grpcGroup.get('keepAliveTimeMs').disable({emitEvent: false});
      grpcGroup.get('keepAliveTimeoutMs').disable({emitEvent: false});
      grpcGroup.get('keepalivePermitWithoutCalls').disable({emitEvent: false});
      grpcGroup.get('maxPingsWithoutData').disable({emitEvent: false});
      grpcGroup.get('minTimeBetweenPingsMs').disable({emitEvent: false});
      grpcGroup.get('minPingIntervalWithoutDataMs').disable({emitEvent: false});
    }
  }

  private initGrpcFormGroup(): FormGroup {
    return this.fb.group({
      enabled: [false],
      serverPort: [9595, [Validators.required, Validators.min(1), Validators.max(65535), Validators.pattern(numberInputPattern)]],
      keepAliveTimeMs: [10000, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]],
      keepAliveTimeoutMs: [5000, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]],
      keepalivePermitWithoutCalls: [true],
      maxPingsWithoutData: [0, [Validators.required, Validators.min(0), Validators.pattern(numberInputPattern)]],
      minTimeBetweenPingsMs: [10000, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]],
      minPingIntervalWithoutDataMs: [5000, [Validators.required, Validators.min(1), Validators.pattern(numberInputPattern)]]
    });
  }
}
