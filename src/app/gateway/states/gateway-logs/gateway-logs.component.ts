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

import { AfterViewInit, Component, DestroyRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DataKeyType, PageLink, Direction, SortOrder, SharedModule, widgetType } from '@shared/public-api';
import { IWidgetSubscription } from '@core/public-api';
import { WidgetContext } from '@home/models/widget-component.models';
import { GatewayLogData, LogLink, GatewayStatus } from './models/public-api';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class GatewayLogsComponent implements OnInit, AfterViewInit {

  pageLink: PageLink;

  dataSource: MatTableDataSource<GatewayLogData>;

  displayedColumns = ['ts', 'status', 'message'];

  @Input()
  ctx: WidgetContext;

  @Input()
  dialogRef: MatDialogRef<any>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  logLinks: Array<LogLink>;

  activeLink: LogLink;

  private logsSubscription: IWidgetSubscription;

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
    private destroyRef: DestroyRef,
  ) {
    const sortOrder: SortOrder = {property: 'ts', direction: Direction.DESC};
    this.pageLink = new PageLink(10, 0, null, sortOrder);
    this.dataSource = new MatTableDataSource<GatewayLogData>([]);
  }

  ngOnInit(): void {
    this.updateWidgetTitle();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    if (this.ctx.settings.isConnectorLog && this.ctx.settings.connectorLogState) {
      const connector = this.ctx.stateController.getStateParams()[this.ctx.settings.connectorLogState];
      this.logLinks = this.ctx.settings.isRpcLog ? [{
        key: `${connector.key}_LOGS`,
        name: this.translate.instant('gateway.connector'),
        filterFn: (attrData) => /(?<!g)rpc/i.test(attrData.message)
      }] : [{
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


  private updateData(subscription: IWidgetSubscription) {
    if (subscription.data.length && subscription.data[0]) {
      let attrData = subscription.data[0].data.map(data => {
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
      this.dataSource.data = attrData;
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
    if (!this.ctx.datasources?.[0]?.entity || !this.ctx.defaultSubscription.options.datasources) {
      return;
    }
    const timeWindowConfig = (this.logsSubscription ?? this.ctx.defaultSubscription).timeWindowConfig;
    this.ctx.defaultSubscription.unsubscribe();
    if (this.logsSubscription) {
      this.ctx.subscriptionApi.removeSubscription(this.logsSubscription.id);
      this.logsSubscription = null;
    }
    this.dataSource.data = [];
    const link = this.activeLink;
    const datasource = {
      ...this.ctx.defaultSubscription.options.datasources[0],
      dataKeys: [{
        name: link.key,
        type: DataKeyType.timeseries,
        settings: {}
      }]
    };
    this.ctx.subscriptionApi.createSubscription({
      type: widgetType.timeseries,
      datasources: [datasource],
      useDashboardTimewindow: false,
      timeWindowConfig,
      callbacks: {
        onDataUpdated: subscription => this.ctx.ngZone.run(() => this.updateData(subscription))
      }
    }, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(subscription => {
      if (link !== this.activeLink) {
        this.ctx.subscriptionApi.removeSubscription(subscription.id);
        return;
      }
      this.logsSubscription = subscription;
    });
  }
}
