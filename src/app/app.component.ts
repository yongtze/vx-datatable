import { Component, ViewChild } from '@angular/core';
import { VxDataTableComponent } from './vx-datatable/vx-datatable.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  data: any[];
  columns: any[];
  
  @ViewChild("vx-datatable") datatable: VxDataTableComponent;

  constructor() {
    this.data = this.generateData(10000);
    var cols = [];
    for (var i = 1; i < 100; i++) {
      cols.push({ 'id': 'col_' + i, 'title': 'Column ' + i, 'width': 100, type: 'number' });
    }
    this.columns = cols;
  }

  getRandomInt(min, max): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  generateData(n:number) {
    var data = [];
    for (var i = 1; i <= n; i++) {
      var item = {};
      for (var j = 1; j <= 100; j++) {
        item['col_' + j] = this.getRandomInt(1, 100);
      }
      data.push(item);
    }
    return data;
  }


}
