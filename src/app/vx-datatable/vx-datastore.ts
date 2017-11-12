
export enum Type {
  string = 1,
  number = 2,
  date = 3,
  boolean = 4
}

export class Field {
  constructor(public name: string, public type: Type) {
  }
}

export class Schema {
  constructor (public fields: Field[]) {
  }
}

export class DataStore {
  constructor (public schema: Schema, private data: any[]) {
  }

}