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

  @Input() leftSplit: number = 0;
  @Input() rightSplit: number = 0;

  @Input() css: string;

  private _scrollTop: number = 0;
  private _scrollLeft: number = 0;

  set scrollTop(scrollTop: number) {
    this._scrollTop = scrollTop;
  }

  get scrollTop(): number {
    return this._scrollTop;
  }

  set scrollLeft(scrollLeft: number) {
    this._scrollLeft = scrollLeft;
  }

  get scrollLeft(): number {
    return this._scrollLeft;
  }

  @ViewChild('defaultHeaderTpl')
  private _defaultHeaderTpl: TemplateRef<any>;
  @ViewChild('defaultTpl')
  private _defaultTpl: TemplateRef<any>;

  @ViewChild("scroll") scroll: any;
  @ViewChild("vscrollbar") vscrollbar: VxVScrollBarComponent;
  @ViewChild("hscrollbar") hscrollbar: VxHScrollBarComponent;

  private _startRowIndex:number = 0;
  private _endRowIndex:number;
  private _rowsInView: any[];

  get startRowIndex(): number {
    return this._startRowIndex;
  }

  get endRowIndex(): number {
    return this._endRowIndex;
  }

  get rowsInView(): any[] {
    return this._rowsInView;
  }

  private totalWidth:number;


  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    if (this.columnComponents && this.columnComponents.length > 0) {
      this.columns = this.columnComponents.toArray();
    }
    this.layout();
    this.refresh();
    this.refreshScrollbars();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.refresh();
    this.refreshScrollbars();
  }

  @ContentChildren(VxColumnComponent) columnComponents: QueryList<VxColumnComponent>;
  private _columns: any[];

  @Input()
  set columns(columns:any[]) {
    this._columns = columns;

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

  private _viewTopOffset: number = 0;

  get viewTopOffset(): number {
    return this._viewTopOffset;
  }

  private _leftColumns: any[];
  private _leftWidth: number = 0;
  private _middleColumns: any[];
  private _middleLeft: number = 0;
  private _middleWidth: number;
  private _middleColumnStart: number;
  private _middleColumnEnd: number;
  private _middleColumnsInView: any[];
  private _rightColumns: any[];
  private _rightWidth: number = 0;

  get leftColumns(): any[] {
    return this._leftColumns;
  }

  get leftWidth(): number {
    return this._leftWidth;
  }

  get middleColumns(): any[] {
    return this._middleColumns;
  }

  get middleColumnsInView(): any[] {
    return this._middleColumnsInView;
  }

  get middleLeft(): number {
    return this._middleLeft;
  }

  get middleWidth(): number {
    return this._middleWidth;
  }

  get rightColumns(): any[] {
    return this._rightColumns;
  }

  get rightWidth(): number {
    return this._rightWidth;
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

  addFilter(column: string, operator: Operator|string, value?: any) {
    this._dataStore.addFilter(column, operator, value);
    let col = this._columns.find(c => c.id === column);
    col.filter = true;
    this.refresh(true);
  }

  removeFilter(column: string) {
    this._dataStore.removeFilter(column);
    let col = this._columns.find(c => c.id === column);
    col.filter = this._dataStore.hasFilter(column);
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

  toggleSort(column: string, event: any) {
    this._dataStore.toggleSort(column);
    let sort = this._dataStore.getSort(column);
    let col = this.columns.find(c => c.id === column);
    if (sort == null) {
      col.sort = null;
    } else {
      col.sort = sort.direction;
    }
    //let dim = { left: event.target.offsetLeft, top: event.target.offsetTop, width: event.target.offsetWidth, height: event.target.offsetHeight };
    //let rect = event.target.getBoundingClientRect();
//    console.log(rect);
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

  layoutColumnsPosition(columns: any[], leftOffset:number = 0): number {
    var left:number = leftOffset;
    var width:number = 0;
    columns.forEach(c => {
      c.left = left;
      c.layoutWidth = c.width ? +c.width : 200;
      left += c.layoutWidth;
      width += c.layoutWidth;
    });
    return width;
  }

  layoutColumns(clientWidth: number, clientHeight: number) {
    if (this.leftSplit > 0) {
      this._leftColumns = this._columns.slice(0, this.leftSplit);
      this._leftWidth = this.layoutColumnsPosition(this._leftColumns);
      this._middleLeft = this._leftWidth;
    } else {
      this._leftColumns = null;
      this._leftWidth = 0;
      this._middleLeft = 0;
    }
    
    if (this.rightSplit > 0) {
      this._rightColumns = this._columns.slice(this._columns.length - this.rightSplit);
      this._rightWidth = this.layoutColumnsPosition(this._rightColumns);
    } else {
      this._rightColumns = null;
      this._rightWidth = 0;
    }

    if (this.leftSplit == 0 && this.rightSplit == 0) {
      this._middleColumns = this._columns;
    } else {
      this._middleColumns = this._columns.slice(Math.max(0, this.leftSplit), this._columns.length - this.rightSplit);
    }
    this._middleWidth = this.layoutColumnsPosition(this._middleColumns);
    this.totalWidth = this._middleWidth;
  }

  layoutScrollView(clientWidth: number, clientHeight: number) {
    this._startRowIndex = this.data ? Math.floor(this.scrollTop / this.rowHeight) : undefined;
    this._endRowIndex = this.data ? Math.min(this.data.length, Math.ceil((this.scrollTop + clientHeight) / this.rowHeight) + 1) : undefined;
    if (this._middleColumns) {
      let left = this.scrollLeft;
      let start = this._middleColumns.findIndex((c, i) => c.left <= left && left <= c.left + c.layoutWidth);
      this._middleColumnStart = start < 0 ? 0 : start;
  
      let right = this.scrollLeft + clientWidth;
      let end = this._middleColumns.findIndex((c, i) => c.left <= right && right <= c.left + c.layoutWidth);
      this._middleColumnEnd = end < 0 ? this._columns.length : end+1;
      this._middleColumnsInView = this._middleColumns.slice(this._middleColumnStart, this._middleColumnEnd);
      // console.log(this._middleColumns);
      // console.log(this._middleColumnsInView);
    }
    this._viewTopOffset = (this._startRowIndex*this.rowHeight) - this.scrollTop;
  }

  layout() {
    let clientHeight: number = this.scroll.nativeElement.clientHeight;
    let clientWidth:number = this.scroll.nativeElement.clientWidth;
    this.layoutColumns(clientWidth, clientHeight);
    this.layoutScrollView(clientWidth, clientHeight);
  }

  refresh(force: boolean = false) {
    let _startIndex = this._startRowIndex;
    this.layout();
    let data = this.data;
    if (data && (force || this._startRowIndex != _startIndex || !this.rowsInView)) {
      this._rowsInView = data.slice(this._startRowIndex, this._endRowIndex);
    }
  }

  wheel(event) {
    if (this._data) {
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


