import { AnimCmd } from "./animCmd";
import { ICVariable } from "./translations";

export const padHex = (v: number, len: number) => v.toString(16).toUpperCase().padStart(len, '0');

export const ArgType = AnimCmd.Argument.ArgType;
export type ValueOf<T> = T[keyof T];

export enum VarType {
  IC = 0x00000000,
  LA = 0x10000000,
  RA = 0x20000000
}
export enum VarDataType {
  INT = 0x00000000,
  FLOAT = 0x01000000,
  BOOL = 0x02000000
}

export class WorkVariable {
  public type: VarType;
  public dataType: VarDataType;
  public index: number;
  public name: string;
  
  constructor(value: number) {
    this.type = value & 0xF0000000;
    this.dataType = value & 0x0F000000;
    this.index = value & 0x00FFFFFF;
    if (this.type === VarType.IC) {
      this.name = ICVariable(this);
    }
  }

  public varName() {
    let out = "";

    switch (this.type) {
      case VarType.IC: out += "IC-"; break;
      case VarType.LA: out += "LA-"; break;
      case VarType.RA: out += "RA-"; break;
    }
    switch (this.dataType) {
      case VarDataType.INT: out += "Int"; break;
      case VarDataType.FLOAT: out += "Float"; break;
      case VarDataType.BOOL: out += "Bool"; break;
    }
    out += `[0x${this.index.toString(16).toUpperCase().padStart(2, '0')}]`;
    return out;
  }

  public toString() {
    if (this.name) {
      return this.name;
    } else {
      return this.varName();
    }
  }
}

export interface VarUsage {
  sectionName: string;
  command: number;
  argument: number;
  variable: WorkVariable;
}
