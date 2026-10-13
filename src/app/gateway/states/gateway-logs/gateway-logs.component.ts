///
/// Copyright © 2016-2025 The Thingsboard Authors
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

import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { fromEvent, Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DataKeyType, PageLink, Direction, SortOrder, SharedModule, DEFAULT_OVERLAY_POSITIONS } from '@shared/public-api';
import { WidgetAction, WidgetContext } from '@home/models/widget-component.models';
import {
  GatewayLogData,
  LogLink,
  GatewayStatus,
  GatewayLogsFilterLevel,
  GatewayLogsFilterLevels
} from './models/public-api';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'tb-gateway-logs',
  templateUrl: './gateway-logs.component.html',
  styleUrls: ['./gateway-logs.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ]
})
export class GatewayLogsComponent implements OnInit, AfterViewInit, OnDestroy {

  pageLink: PageLink;

  dataSource: MatTableDataSource<GatewayLogData>;

  displayedColumns = ['ts', 'status', 'message'];

  @Input()
  ctx: WidgetContext;

  @Input()
  dialogRef: MatDialogRef<any>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('logFilterPanel') logFilterPanel: TemplateRef<any>;

  logLinks: Array<LogLink>;

  activeLink: LogLink;

  readonly logLevels = GatewayLogsFilterLevels;

  selectedLogLevel: GatewayLogsFilterLevel = 'ALL';

  logLevelControl = new FormControl<GatewayLogsFilterLevel>('ALL');

  private allLogs: Array<GatewayLogData> = [];

  private logFilterOverlayRef: OverlayRef;

  private resizeWindowSubscription: Subscription;

  private logFilterAction: WidgetAction = {
    name: 'gateway.logs.log-filter',
    show: true,
    icon: 'filter_list',
    onAction: ($event) => this.toggleLogFilterPanel($event)
  };

  gatewayLogLinks: Array<LogLink> = [
    {
      name: this.translate.instant('gateway.logs.columns.general'),
      key: 'LOGS'
    }, {
      name: this.translate.instant('gateway.logs.columns.service'),
      key: 'SERVICE_LOGS'
    },
    {
      name: this.translate.instant('gateway.logs.columns.connection'),
      key: 'CONNECTION_LOGS'
    }, {
      name: this.translate.instant('gateway.logs.columns.storage'),
      key: 'STORAGE_LOGS'
    },
    {
      key: 'EXTENSIONS_LOGS',
      name: this.translate.instant('gateway.logs.columns.extension'),
    }];


  constructor(
    private translate: TranslateService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
  ) {
    const sortOrder: SortOrder = {property: 'ts', direction: Direction.DESC};
    this.pageLink = new PageLink(10, 0, null, sortOrder);
    this.dataSource = new MatTableDataSource<GatewayLogData>([]);
  }

  ngOnInit(): void {
    this.updateWidgetTitle();
    if (!this.ctx.settings.isConnectorLog) {
      this.ctx.widgetActions = [this.logFilterAction];
      this.ctx.updateWidgetParams();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.ctx.defaultSubscription.onTimewindowChangeFunction = timewindow => {
      this.ctx.defaultSubscription.options.timeWindowConfig = timewindow;
      this.ctx.defaultSubscription.updateDataSubscriptions();
      return timewindow;
    };
    if (this.ctx.settings.isConnectorLog && this.ctx.settings.connectorLogState) {
      const connector = this.ctx.stateController.getStateParams()[this.ctx.settings.connectorLogState];
      this.logLinks = [{
        key: `${connector.key}_LOGS`,
        name: this.translate.instant('gateway.connector'),
        filterFn: (attrData) => !attrData.message.includes(`_converter.py`)
      }, {
        key: `${connector.key}_converter_LOGS`,
        name: this.translate.instant('gateway.converter'),
        filterFn: (attrData) => attrData.message.includes(`_converter.py`)
      }];
    } else {
      this.logLinks = this.gatewayLogLinks;
    }
    this.activeLink = this.logLinks[0];
    this.changeSubscription();
  }

  ngOnDestroy(): void {
    this.closeLogFilterPanel();
  }

  private updateWidgetTitle(): void {
    if (this.ctx.settings.isConnectorLog && this.ctx.settings.connectorLogState) {
      const widgetTitle = this.ctx.widgetConfig.title;
      const titlePlaceholder = '${connectorName}';
      if (widgetTitle.includes(titlePlaceholder)) {
        const connector = this.ctx.stateController.getStateParams()[this.ctx.settings.connectorLogState];
        this.ctx.widgetTitle = widgetTitle.replace(titlePlaceholder, connector.key);
      }
    }
  }


  private updateData() {
    if (this.ctx.defaultSubscription.data.length && this.ctx.defaultSubscription.data[0]) {
      let attrData = this.ctx.defaultSubscription.data[0].data.map(data => {
        const result = {
          ts: data[0],
          key: this.activeLink.key,
          message: data[1],
          status: 'INVALID LOG FORMAT' as GatewayStatus
        };

        try {
          result.message = /\[(.*)/.exec(data[1])[0];
        } catch (e) {
          result.message = data[1];
        }

        try {
          result.status = data[1].match(/\|(\w+)\|/)[1];
        } catch (e) {
          result.status = 'INVALID LOG FORMAT' as GatewayStatus;
        }

        return result;
      });
      if (this.activeLink.filterFn) {
        attrData = attrData.filter(data => this.activeLink.filterFn(data));
      }
      this.allLogs = attrData;
      this.applyLogLevelFilter();
    }
  }

  private get logFilterDisplayValue(): string {
    return this.selectedLogLevel === 'ALL'
      ? this.translate.instant('gateway.logs.log-filter')
      : `${this.translate.instant('gateway.logs.filter')}: ${this.selectedLogLevel}`;
  }

  private toggleLogFilterPanel($event: Event): void {
    $event?.stopPropagation();
    const target = ($event.currentTarget || $event.target) as HTMLElement;
    this.logLevelControl.reset(this.selectedLogLevel);
    const config = new OverlayConfig({
      panelClass: 'tb-filter-panel',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      maxHeight: '80vh',
      height: 'min-content',
      minWidth: ''
    });
    config.positionStrategy = this.overlay.position()
      .flexibleConnectedTo(target)
      .withPositions(DEFAULT_OVERLAY_POSITIONS);

    this.logFilterOverlayRef = this.overlay.create(config);
    this.logFilterOverlayRef.backdropClick().subscribe(() => this.closeLogFilterPanel());
    this.logFilterOverlayRef.attach(new TemplatePortal(this.logFilterPanel, this.viewContainerRef));
    this.resizeWindowSubscription = fromEvent(window, 'resize')
      .subscribe(() => this.logFilterOverlayRef.updatePosition());
  }

  resetLogFilter(): void {
    if (this.logLevelControl.value !== 'ALL') {
      this.logLevelControl.setValue('ALL');
      this.logLevelControl.markAsDirty();
    }
  }

  cancelLogFilter(): void {
    this.closeLogFilterPanel();
  }

  updateLogFilter(): void {
    this.selectedLogLevel = this.logLevelControl.value;
    this.logFilterAction.name = this.logFilterDisplayValue;
    this.applyLogLevelFilter();
    this.closeLogFilterPanel();
  }

  private closeLogFilterPanel(): void {
    this.resizeWindowSubscription?.unsubscribe();
    this.logFilterOverlayRef?.dispose();
    this.logFilterOverlayRef = null;
  }

  private applyLogLevelFilter(): void {
    this.dataSource.data = this.allLogs.filter(log => this.matchesLogLevel(log.status));
  }

  private matchesLogLevel(status: GatewayStatus): boolean {
    switch (this.selectedLogLevel) {
      case 'ALL':
        return true;
      case 'NONE':
        return false;
      default:
        return status === this.selectedLogLevel;
    }
  }

  onTabChanged(link: LogLink) {
    this.activeLink = link;
    this.changeSubscription();
  }

  statusClass(status: GatewayStatus): string {
    switch (status) {
      case GatewayStatus.DEBUG:
        return 'status status-debug';
      case GatewayStatus.WARNING:
        return 'status status-warning';
      case GatewayStatus.ERROR:
      case GatewayStatus.EXCEPTION:
        return 'status status-error';
      default:
        return 'status status-info';
    }
  }

  statusClassMsg(status?: GatewayStatus): string {
    if (status === GatewayStatus.EXCEPTION) {
      return 'msg-status-exception';
    }
  }

  trackByLogTs(_: number, log: GatewayLogData): number {
    return log.ts;
  }

  private changeSubscription() {
    if (this.ctx.datasources && this.ctx.datasources[0].entity && this.ctx.defaultSubscription.options.datasources) {
      this.ctx.defaultSubscription.options.datasources[0].dataKeys = [{
        name: this.activeLink.key,
        type: DataKeyType.timeseries,
        settings: {}
      }];
      this.ctx.defaultSubscription.unsubscribe();
      this.ctx.defaultSubscription.updateDataSubscriptions();
      this.ctx.defaultSubscription.callbacks.onDataUpdated = () => {
        this.updateData();
      };
    }
  }
}
