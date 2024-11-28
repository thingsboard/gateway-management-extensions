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

import { ChangeDetectionStrategy, Component, Input, OnInit, output } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '@core/public-api';
import { PageComponent, SharedModule } from '@shared/public-api';
import { TbPopoverComponent } from '@shared/components/popover.component';

import { ReportStrategyDefaultValue } from '../../../../../shared/models/public-api';
import { EllipsisChipListDirective } from '../../../../../shared/directives/public-api';
import { ConnectorMappingHelpLinkPipe } from '../../../pipes/gateway-help-link.pipe';
import { ReportStrategyComponent } from '../../../../../shared/components/public-api';
import { BacnetDeviceKey, BacnetDeviceKeysType } from '../../../models/public-api';
import { BacnetDeviceDataKeyComponent } from '../device-data-key/bacnet-device-data-key.component';

@Component({
  selector: 'tb-bacnet-device-data-keys-panel',
  templateUrl: './bacnet-device-data-keys-panel.component.html',
  styleUrls: ['./bacnet-device-data-keys-panel.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    EllipsisChipListDirective,
    ConnectorMappingHelpLinkPipe,
    ReportStrategyComponent,
    BacnetDeviceDataKeyComponent,
  ]
})
export class BacnetDeviceDataKeysPanelComponent extends PageComponent implements OnInit {

  @Input() panelTitle: string;
  @Input() addKeyTitle: string;
  @Input() deleteKeyTitle: string;
  @Input() noKeysText: string;
  @Input() keys: Array<BacnetDeviceKey>;
  @Input() keysType: BacnetDeviceKeysType;
  @Input() popover: TbPopoverComponent<BacnetDeviceDataKeysPanelComponent>;
  @Input() withReportStrategy = true;

  keysDataApplied = output<Array<BacnetDeviceKey>>();

  keysListFormArray: UntypedFormArray;

  readonly ReportStrategyDefaultValue = ReportStrategyDefaultValue;

  constructor(private fb: UntypedFormBuilder,
              protected store: Store<AppState>) {
    super(store);
  }

  ngOnInit(): void {
    this.keysListFormArray = this.prepareKeysFormArray(this.keys);
  }

  addKey(): void {
    this.keysListFormArray.push(this.fb.control({}));
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
    this.keysDataApplied.emit(this.keysListFormArray.value);
  }

  private prepareKeysFormArray(keys: Array<BacnetDeviceKey>): UntypedFormArray {
    const keysControlGroups: Array<AbstractControl> = [];
    keys?.forEach(keyData => {
      keysControlGroups.push(this.fb.control(keyData));
    });
    return this.fb.array(keysControlGroups);
  }
}
