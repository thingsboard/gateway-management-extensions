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
import { ChangeDetectionStrategy, Component, forwardRef, OnDestroy } from '@angular/core';
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
  noLeadTrailSpacesRegex,
} from '../../../../../shared/models/public-api';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { GatewayPortTooltipPipe } from '../../../pipes/public-api';
import { takeUntil } from 'rxjs/operators';
import { TruncateWithTooltipDirective } from '../../../../../shared/directives/public-api';
import { SocketConfig, SocketType, PortLimits } from '../../../models/public-api';

@Component({
  selector: 'tb-socket-config',
  templateUrl: './socket-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    GatewayPortTooltipPipe,
    TruncateWithTooltipDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SocketConfigComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SocketConfigComponent),
      multi: true
    }
  ]
})
export class SocketConfigComponent implements ControlValueAccessor, Validator, OnDestroy {

  socketConfigFormGroup: UntypedFormGroup;

  readonly portLimits = PortLimits;
  readonly socketTypes = Object.values(SocketType);

  private onChange: (value: SocketConfig) => void;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.socketConfigFormGroup = this.fb.group({
      address: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      type: [SocketType.TCP],
      port: [50000, [Validators.required, Validators.min(PortLimits.MIN), Validators.max(PortLimits.MAX)]],
      bufferSize: [1024, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]]
    });

    this.socketConfigFormGroup.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
      this.onChange(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerOnChange(fn: (value: SocketConfig) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {
  }

  writeValue(socketConfig: SocketConfig): void {
    const {
      address = '',
      type = SocketType.TCP,
      port = 50000,
      bufferSize = 1024,
    } = socketConfig ?? {};

    this.socketConfigFormGroup.reset({
      address,
      type,
      port,
      bufferSize,
    }, { emitEvent: false });
  }

  validate(): ValidationErrors | null {
    return this.socketConfigFormGroup.valid ? null : {
      socketConfigFormGroup: {valid: false}
    };
  }
}
