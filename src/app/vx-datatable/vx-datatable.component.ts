import { Component, OnInit, OnChanges, SimpleChanges, TemplateRef, Input, Output, Host, HostListener, ContentChild, ContentChildren, ViewChild, QueryList, ViewEncapsulation } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

import { VxVScrollBarComponent } from '../vx-scrollbar/vx-vscrollbar.component';
import { VxHScrollBarComponent } from '../vx-scrollbar/vx-hscrollbar.component';

import { DataStore, Schema, Column, Type, Direction, Sort, Filter, Operator } from './vx-datastore';

@Component({
  selector: 'vx-column',
  template: ''
})
export class VxColumnComponent implements OnInit {

  @Input() id: string|number;
  @Input() title: string;
  @Input() width: number;
  @Input() minWidth: number;
  @Input() maxWidth: number;
  @Input() visible: boolean = true;
  @Input() type: string = "string";

  @Host() datatable: VxDataTableComponent;

  constructor() {
  }

  ngOnInit() {
  }

  private _headerTemplate: TemplateRef<any>;

  set headerTemplate(headerTemplate: TemplateRef<any>) {
    this._headerTemplate = headerTemplate;
  }

  get headerTemplate(): TemplateRef<any> {
    return this._headerTemplate;
  }

  private _template: TemplateRef<any>;

  set template(template: TemplateRef<any>) {
    this._template = template;
  }

  get template(): TemplateRef<any> {
    return this._template;
  }

  left: number;
  layoutWidth: number;

}

@Component({
  selector: 'vx-datatable',
  templateUrl: './vx-datatable.component.html',
  styleUrls: ['./vx-datatable.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VxDataTableComponent implements OnInit, OnChanges {
  @Input() width: number;
  @Input() height: number;
  @Input() headerRowHeight: number = 40;
  @Input() rowHeight: number = 40;

  @Input() leftSplit: number;
  @Input() rightSplit: number;

  @Input() css: string;

  scrollTop: number = 0;
  scrollLeft: number = 0;

  @ViewChild('defaultHeaderTpl')
  private _defaultHeaderTpl: TemplateRef<any>;
  @ViewChild('defaultTpl')
  private _defaultTpl: TemplateRef<any>;

  @ViewChild("scroll") scroll: any;
  @ViewChild("vscrollbar") vscrollbar: VxVScrollBarComponent;
  @ViewChild("hscrollbar") hscrollbar: VxHScrollBarComponent;

  startIndex:number = 0;
  endIndex:number;
  rowsInView: any[];

  private totalWidth:number;

  @ContentChildren(VxColumnComponent) columnComponents: QueryList<VxColumnComponent>;
  private _columns: any[];
  columnTop: number = 0;
  startColumnIndex:number = 0;
  endColumnIndex:number;
  columnsInView: any[];

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    if (this.columnComponents && this.columnComponents.length > 0) {
      this.columns = this.columnComponents.toArray();
    }
    this.refresh();
    this.refreshScrollbars();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.refresh();
    this.refreshScrollbars();
  }

  _data: any[];
  _dataStore: DataStore = new DataStore();

  @Input()
  set data(data: any[]) {
    this._data = data;
    this._dataStore.data = data;
    this._dataStore.refresh();
  }
  
  get data(): any[] {
    return this._dataStore.filtered;
  }

  set dataStore(dataStore: DataStore) {
    this._dataStore = dataStore;
  }

  get dataStore(): DataStore {
    return this._dataStore;
  }

  @Input()
  set columns(columns:any[]) {
    this._columns = columns;
    this.layoutColumns();

    var cols = this._columns.map(c => {
      let type;
      if (c.type === "number") {
        type = Type.Number;
      } else if (c.type === "date") {
        type = Type.Date;
      } else {
        type = Type.String;
      }
      return new Column(c.id, type);
    });
    this._dataStore.schema = new Schema(cols);
  }

  get columns() {
    return this._columns;
  }

  addFilter(column: string, operator: Operator|string, value?: any) {
    this._dataStore.addFilter(column, operator, value);
    this.refresh(true);
  }

  removeFilter(column: string) {
    this._dataStore.removeFilter(column);
    this.refresh(true);
  }

  hasFilter(column: string): boolean {
    return this._dataStore.hasFilter(column);
  }

  addSort(column: string, direction: Direction|string) {
    this._dataStore.addSort(column, direction);
    this.refresh(true);
  }

  removeSort(column: string) {
    this._dataStore.removeSort(column);
    this.refresh(true);
  }

  toggleSort(column: string) {
    this._dataStore.toggleSort(column);
    let sort = this._dataStore.getSort(column);
    let col = this.columns.find(c => c.id === column);
    if (sort == null) {
      col.sort = null;
    } else {
      col.sort = sort.direction;
    }
    this.refresh(true);
  }

  hasSort(column: string): boolean {
    return this._dataStore.hasSort(column);
  }

  getSort(column: string): Sort {
    return this._dataStore.getSort(column);
  }

  refreshScrollbars() {
    if (this.data) {
      this.vscrollbar.update(this.scrollTop, this.data.length * this.rowHeight);
      this.hscrollbar.update(this.scrollLeft, this.totalWidth);
    }
  }

  layoutColumns() {
    var left:number = 0;
    this.totalWidth = 0;
    this._columns.forEach((c) => {
      c.left = left;
      c.layoutWidth = c.width ? +c.width : 200;
      left = left + c.layoutWidth;
      this.totalWidth += c.layoutWidth;
    });
  }

  resize() {
    let clientHeight: number = this.scroll.nativeElement.clientHeight;
    let clientWidth:number = this.scroll.nativeElement.clientWidth;
    this.startIndex = this.data ? Math.floor(this.scrollTop / this.rowHeight) : undefined;
    this.endIndex = this.data ? Math.min(this.data.length, Math.ceil((this.scrollTop + clientHeight) / this.rowHeight) + 1) : undefined;

    if (this._columns) {
      let idx0 = this._columns.findIndex((c, i) => c.left <= this.scrollLeft && this.scrollLeft <= c.left + c.layoutWidth);
      this.startColumnIndex = idx0 < 0 ? 0 : idx0;

      let right = this.scrollLeft + clientWidth;
      let idx = this._columns.findIndex((c, i) => c.left <= right && right <= c.left + c.layoutWidth);
      this.endColumnIndex = idx < 0 ? this._columns.length : idx+1;
    }

    this.columnTop = (this.startIndex*this.rowHeight) - this.scrollTop;
  }

  refresh(force: boolean = false) {
    let _startIndex = this.startIndex;
    this.resize();
    let data = this.data;
    if (data && (force || this.startIndex != _startIndex || !this.rowsInView)) {
      this.rowsInView = data.slice(this.startIndex, this.endIndex);
    }
    if (data && this._columns) {
      this.columnsInView = this._columns.slice(this.startColumnIndex, this.endColumnIndex);
    }
  }

  wheel(event) {
    if (this.data) {
      let clientHeight = this.scroll.nativeElement.clientHeight;
      let clientWidth = this.scroll.nativeElement.clientWidth;
      this.scrollTop = Math.min(
        Math.max(this.scrollTop + event.deltaY, 0),
        this.data.length * this.rowHeight - clientHeight
      );
      this.scrollLeft = Math.min(
        Math.max(this.scrollLeft + event.deltaX, 0),
        this.totalWidth - clientWidth
      );
      this.refresh();
      this.refreshScrollbars();
      event.preventDefault();
    }
  }

  @HostListener('window:resize')
  windowResize() {
    this.refresh();
  }

  vscroll(event) {
    this.scrollTop = event.value;
    this.refresh();
  }

  hscroll(event) {
    this.scrollLeft = event.value;
    this.refresh();
  }
}


