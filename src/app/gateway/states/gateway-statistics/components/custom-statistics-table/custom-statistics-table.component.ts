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

import { AfterViewInit, Component, effect, input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Direction,
  PageLink,
  SharedModule,
  SortOrder
} from '@shared/public-api';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'tb-custom-statistics-table',
  templateUrl: './custom-statistics-table.component.html',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class CustomStatisticsTableComponent implements AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  data = input([]);

  dataSource: MatTableDataSource<string[]>;
  pageLink: PageLink;

  readonly defaultPageSizes = [10, 20, 30];
  private readonly defaultSortOrder: SortOrder = {
    property: '0',
    direction: Direction.DESC
  };

  constructor() {
    this.pageLink = new PageLink(Number.POSITIVE_INFINITY, 0, null, this.defaultSortOrder);
    this.dataSource = new MatTableDataSource<string[]>([]);
    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (item: string[]) => item[Number(this.sort?.active) || 0];
  }
}
