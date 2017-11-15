
export enum Type {
  String = "string",
  Number = "number",
  Date = "date",
  Boolean = "boolean"
}

export class Column {
  constructor(public name: string, public type: Type) {
  }
}

export class Schema {
  columnMap:Map<string, Column> = new Map();
  constructor (public columns: Column[]) {
    columns.forEach(c => this.columnMap.set(c.name, c));
  }

  findColumnByName(column:string):Column {
    return this.columnMap.get(column);
  }
}

export enum Direction {
  Asc = "asc", Desc = "desc"
}
export class Sort {
  constructor(public column:string, public direction:Direction) {
  }

  comparator(type:Type):Function {
    let column = this.column;
    let direction:number = this.direction === Direction.Desc ? -1 : 1;
    let comparator;
    if (type === Type.String) {
      return (obj1, obj2) => {
        let a = obj1 ? obj1[column] : null;
        let b = obj2 ? obj2[column] : null;
        if (a == null && b == null) {
          return 0;
        } else if (a == null && b != null) {
          return -1 * direction;
        } else if (a != null && b == null) {
          return 1 * direction;
        } else {
          return a.localeCompare(b) * direction;
        }
      }
    } else if (type === Type.Number) {
      return (obj1, obj2) => {
        let a = obj1 ? obj1[column] : null;
        let b = obj2 ? obj2[column] : null;
        if (a == null && b == null) {
          return 0;
        } else if (a == null && b != null) {
          return -1 * direction;
        } else if (a != null && b == null) {
          return 1 * direction;
        } else {
          return (a - b) * direction;
        }
      };
    } else if (type === Type.Date) {
      return (obj1, obj2) => {
        let a = obj1 ? obj1[column] : null;
        let b = obj2 ? obj2[column] : null;
        if (a == null && b == null) {
          return 0;
        } else if (a == null && b != null) {
          return -1 * direction;
        } else if (a != null && b == null) {
          return 1 * direction;
        } else {
          return (a.getTime() - b.getTime()) * direction;
        }
      }
    } else if (type === Type.Boolean) {
      return (obj1, obj2) => {
        let a = obj1 ? obj1[column] : null;
        let b = obj2 ? obj2[column] : null;
        return ((a === b) ? 0 : (a ? -1 : 1)) * direction;
      };
    } else {
      return (obj1, obj2) => 0;
    }
  }
}

export enum Operator {
  Equals = "==",
  NotEqual = "!=",
  In = "in",
  NotIn = "not_in",
  LessThan = "<",
  LessThanOrEquals = "<=",
  GreaterThan = ">",
  GreaterThanOrEquals = ">=",
  IsEmpty = "is_empty",
  NotEmpty = "not_empty"
}

export class Filter {
  constructor(public column:string, public operator:Operator = Operator.Equals, public value?:any) {
  }

  predicate():Function {
    let prop = this.column;
    let val = this.value;
    if (this.operator === Operator.Equals) {
      return (row:Object) => row[prop] === val;
    } else if (this.operator === Operator.NotEqual) {
      return (row:Object) => row[prop] !== val;
    } else if (this.operator === Operator.In) {
      return (row:Object) => val.has(row[prop]);
    } else if (this.operator === Operator.NotIn) {
      return (row:Object) => !val.has(row[prop]);
    } else if (this.operator === Operator.LessThan) {
      return (row:Object) => row[prop] < val;
    } else if (this.operator === Operator.LessThanOrEquals) {
      return (row:Object) => row[prop] <= val;
    } else if (this.operator === Operator.GreaterThan) {
      return (row:Object) => row[prop] > val;
    } else if (this.operator === Operator.GreaterThanOrEquals) {
      return (row:Object) => row[prop] >= val;
    } else if (this.operator === Operator.IsEmpty) {
      return (row:Object) => row[prop] === null || row[prop] === "";
    } else if (this.operator === Operator.NotEmpty) {
      return (row:Object) => row[prop] !== null || row[prop] !== "";
    } else {
      return (row:Object) => true;
    }
  }
}

export class DataStore {
  public filters:Filter[] = [];
  public sorts:Sort[] = [];

  public filtered:any[];
  constructor (public data?: any[], public schema?: Schema, public page: number = 1, public size: number = 100) {
  }

  addSort(column:string, direction:Direction|string = Direction.Asc) {
    var s:Sort = this.sorts.find((s) => s.column === column);
    if (s == null) {
      s = new Sort(column, direction as Direction)
    }
    this.refresh();
  }

  removeSort(column:string|number) {
    let idx:number = typeof column === "string"
        ? this.sorts.findIndex(s => s.column === column)
        : column as number;
    if (idx >= 0) {
      this.sorts.splice(idx, 1);
    }
    this.refresh();
  }

  hasSort(column: string): boolean {
    return this.sorts.findIndex(s => s.column === column) >= 0;
  }

  toggleSort(column:string) {
    var s:Sort = this.sorts.find(s => s.column === column);
    if (s == null) {
      s = new Sort(column, Direction.Asc)
      this.sorts.push(s);
    } else {
      if (s.direction === Direction.Asc) {
        s.direction = Direction.Desc;
      } else {
        this.removeSort(column);
        s = null;
      }
    }
    this.refresh();
  }

  clearSorts() {
    this.sorts = [];
  }

  applySorts(data:any[]) {
    if (data && this.sorts.length > 0) {
      let comparators = this.sorts.map(s => s.comparator(this.schema.findColumnByName(s.column).type));
      data.sort((obj1, obj2) => {
        var result = 0;
        for (let i = 0; result === 0 && i < comparators.length; i++) {
          result = comparators[i](obj1, obj2);
        }
        return result;
      });
    }
    return data;
  }

  addFilter(column: string, operator:Operator|string, value?:any) {
    this.filters.push(new Filter(column, operator as Operator, value));
    this.refresh();
  }

  removeFilter(column: string|number) {
    let idx:number = typeof column === "string"
        ? this.filters.findIndex(f => f.column === column)
        : column as number;
    if (idx >= 0) {
      this.filters.splice(idx, 1);
    }
    this.refresh();
  }

  hasFilter(column: string): boolean {
    return this.filters.findIndex(f => f.column === column) >= 0;
  }

  applyFilters(data:any[]) {
    if (data && this.filters.length > 0) {
      let predicates = this.filters.map(f => f.predicate());
      return data.filter(row => predicates.findIndex(p => !p(row)) < 0);
    }
    return data.slice();
  }

  clearFilters() {
    this.filters = [];
  }

  refresh():any[] {
    if (this.data && this.data.length > 0) {
      this.filtered = this.applySorts(this.applyFilters(this.data));
    } else {
      this.filtered = [];
    }
    return this.filtered;
  }

  slice(from:number, to:number):any[] {
    return this.data.slice(from, to);
  }

}