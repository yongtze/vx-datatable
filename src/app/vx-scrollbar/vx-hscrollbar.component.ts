import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, ViewEncapsulation, HostListener } from '@angular/core';

@Component({
  selector: 'vx-hscrollbar',
  templateUrl: './vx-hscrollbar.component.html',
  styleUrls: ['./vx-hscrollbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VxHScrollBarComponent implements OnInit {

  @Input() left:number = 0;
  @Input() right:number = 0;
  @Input() height: number = 15;

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
    this.scroll.emit({ eventType: 'scroll', value: event.target.scrollLeft });
  }

}
