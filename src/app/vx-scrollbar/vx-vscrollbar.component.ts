import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, ViewEncapsulation, HostListener } from '@angular/core';

@Component({
  selector: 'vx-vscrollbar',
  templateUrl: './vx-vscrollbar.component.html',
  styleUrls: ['./vx-vscrollbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VxVScrollBarComponent implements OnInit {

  @Input() top:number = 0;
  @Input() bottom:number = 0;
  @Input() width: number = 15;

  @Output() scroll: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild("scrollbar") scrollbar: ElementRef;

  constructor() { }
  
  ngOnInit() {
  }

  @Input() value:number = 0;
  @Input() maxValue:number = 0;

  update(value:number, maxValue:number) {
    this.value = value;
    this.maxValue = maxValue;
  }

  onScroll(event) {
    this.scroll.emit({ eventType: 'scroll', value: event.target.scrollTop });
  }

}
