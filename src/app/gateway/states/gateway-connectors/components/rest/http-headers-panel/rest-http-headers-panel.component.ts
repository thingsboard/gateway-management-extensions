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
import { booleanAttribute, ChangeDetectionStrategy, Component, Input, OnInit, output } from '@angular/core';
import { AbstractControl, FormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import { PageComponent, SharedModule } from '@shared/public-api';
import { TbPopoverComponent } from '@shared/components/popover.component';
import { noLeadTrailSpacesRegex, ReportStrategyDefaultValue } from '../../../../../shared/models/public-api';

@Component({
  selector: 'tb-rest-http-headers-panel',
  templateUrl: './rest-http-headers-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class RestHttpHeadersPanelComponent extends PageComponent implements OnInit {

  @Input() keys: Record<string, unknown>;
  @Input() popover: TbPopoverComponent<RestHttpHeadersPanelComponent>;
  @Input({ transform: booleanAttribute }) withReportStrategy = true;

  keysDataApplied = output<Record<string, unknown>>();

  keysListFormArray: FormArray;

  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;

  constructor(private fb: UntypedFormBuilder,
              protected store: Store<AppState>) {
    super(store);
  }

  ngOnInit(): void {
    this.keysListFormArray = this.prepareKeysFormArray(this.keys);
  }

  addKey(): void {
    this.keysListFormArray.push(this.fb.group({
      key: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      value: ['', [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
    }));
  }

  deleteKey($event: Event, index: number): void {
    if ($event) {
      $event.stopPropagation();
    }
    this.keysListFormArray.removeAt(index);
    this.keysListFormArray.markAsDirty();
  }

  cancel(): void {
    this.popover?.hide();
  }

  applyKeysData(): void {
    this.keysDataApplied.emit(
      this.keysListFormArray.value.reduce((acc, {key, value}) => ({...acc, [key]: value}), {})
    );
  }

  private prepareKeysFormArray(keys: Record<string, unknown>): FormArray {
    const keysControlGroups: Array<AbstractControl> = [];
    Object.keys(keys)?.forEach((key) => {
      keysControlGroups.push(this.fb.group({
        key: [key, [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
        value: [keys[key], [Validators.required, Validators.pattern(noLeadTrailSpacesRegex)]],
      }));
    });
    return this.fb.array(keysControlGroups);
  }
}
