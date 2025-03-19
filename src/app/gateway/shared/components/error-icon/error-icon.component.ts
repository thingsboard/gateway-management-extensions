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
import { Component, Input } from '@angular/core';
import { SharedModule } from '@shared/public-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tb-error-icon',
  template: `
    <mat-icon
      matTooltipPosition="above"
      matTooltipClass="tb-error-tooltip"
      [matTooltip]="tooltipText"
      class="tb-error"
    >
      warning
    </mat-icon>
  `,
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
  ],
  styles: [`
    :host {
      display: flex;
      width: 40px;
      height: 40px;
      padding: 10px;
    }
    mat-icon {
      font-size: 20px;
    }
  `]
})
export class ErrorTooltipIconComponent {
  @Input() tooltipText: string = '';
}
