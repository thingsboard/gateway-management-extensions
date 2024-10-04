///
/// Copyright © 2024 ThingsBoard, Inc.
///

import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';
import { coerceBoolean } from '@shared/public-api';

@Directive({
  selector: '[tbTruncateWithTooltip]',
  providers: [MatTooltip],
  standalone: true
})
export class TruncateWithTooltipDirective implements OnInit, AfterViewInit, OnDestroy {

  @Input('tbTruncateWithTooltip')
  text: string;

  @Input()
  @coerceBoolean()
  tooltipEnabled = true;

  @Input()
  position: TooltipPosition = 'above';

  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private tooltip: MatTooltip
  ) {}

  ngOnInit(): void {
    this.observeMouseEvents();
    this.applyTruncationStyles();
  }

  ngAfterViewInit(): void {
    this.tooltip.position = this.position;
  }

  ngOnDestroy(): void {
    if (this.tooltip._isTooltipVisible()) {
      this.hideTooltip();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private observeMouseEvents(): void {
    fromEvent(this.elementRef.nativeElement, 'mouseenter')
      .pipe(
        filter(() => this.tooltipEnabled),
        filter(() => this.isOverflown(this.elementRef.nativeElement)),
        tap(() => this.showTooltip()),
        takeUntil(this.destroy$),
      )
      .subscribe();
    fromEvent(this.elementRef.nativeElement, 'mouseleave')
      .pipe(
        filter(() => this.tooltipEnabled),
        filter(() => this.tooltip._isTooltipVisible()),
        tap(() => this.hideTooltip()),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private applyTruncationStyles(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.elementRef.nativeElement, 'overflow', 'hidden');
    this.renderer.setStyle(this.elementRef.nativeElement, 'text-overflow', 'ellipsis');
  }

  private isOverflown(element: HTMLElement): boolean {
    return element.clientWidth < element.scrollWidth;
  }

  private showTooltip(): void {
    this.tooltip.message = this.text || this.elementRef.nativeElement.innerText;
    this.tooltip.show();
  }

  private hideTooltip(): void {
    this.tooltip.hide();
  }
}
