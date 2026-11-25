/*
 * This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild
 */
import * as KaitaiStream from 'kaitai-struct/KaitaiStream'
import {AnimCmd} from './animCmd'

export class MoveDef {
  _is_le?: boolean;

  constructor(
    readonly _io: KaitaiStream,
    readonly _parent?: unknown,
    readonly _root?: MoveDef,
  ) {
    this._root ??= this;

    this._read();
  }

  _read() {
    this._raw_header = (this._io.readBytes(32)) as any
    let _io__raw_header = new KaitaiStream(this._raw_header);
    this.header = (new MoveDef.SakuraiHeader(_io__raw_header, this, this._root)) as any
    this._raw_body = (this._io.readBytes(((this.header as any).size - 32))) as any
    let _io__raw_body = new KaitaiStream(this._raw_body);
    this.body = (new MoveDef.SakuraiBody(_io__raw_body, this, this._root)) as any
  }


  /**
   * i'm a header, WEEEEEEE
   */
  header: MoveDef.SakuraiHeader;
  body: MoveDef.SakuraiBody;
  _raw_header: Uint8Array;
  _raw_body: Uint8Array;
}

export namespace MoveDef {
  export class PtrPtr {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: unknown | undefined,
      readonly _root: MoveDef | undefined,
      dtype: string,
    ) {
      this.dtype = dtype;

      this._read();
    }

    _read() {
      this.offset = (this._io.readS4be()) as any
    }

    private _ptr: MoveDef.Ptr | undefined;
    get ptr(): MoveDef.Ptr | undefined {
      if (typeof this._ptr !== 'undefined')
        return this._ptr;
      if ((this.offset as any) != 0) {
        let _pos = this._io.pos;
        this._io.seek((this.offset as any));
        this._ptr = (new MoveDef.Ptr(this._io, this, this._root, (this.dtype as any))) as any
        this._io.seek(_pos);
      }
      return this._ptr;
    }

    offset: number;
    dtype: string;
  }
}

export namespace MoveDef {
  export class SakuraiBody {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
    }

    private _lookupEntries: MoveDef.SakuraiBody.LookupTable;
    get lookupEntries(): MoveDef.SakuraiBody.LookupTable {
      if (typeof this._lookupEntries !== 'undefined')
        return this._lookupEntries;
      let _pos = this._io.pos;
      this._io.seek((this._parent as any).header.lookupEntryOffset);
      this._lookupEntries = (new MoveDef.SakuraiBody.LookupTable(this._io, this, this._root, (this._parent as any).header.lookupEntryCount, (this._parent as any).header.sectionCount, (this._parent as any).header.externalSubroutineCount)) as any
      this._io.seek(_pos);
      return this._lookupEntries;
    }

    private _sections: Array<MoveDef.SakuraiBody.Section>;
    get sections(): Array<MoveDef.SakuraiBody.Section> {
      if (typeof this._sections !== 'undefined')
        return this._sections;
      let _pos = this._io.pos;
      this._io.seek(0);
      this._sections = [];
      for (let i = 0; i < (this._parent as any).header.sectionCount; i++) {
        this._sections.push(new MoveDef.SakuraiBody.Section(this._io, this, this._root, (this.lookupEntries as any).sections[i], (this.lookupEntries as any).stringTablePos));
      }
      this._io.seek(_pos);
      return this._sections;
    }

  }
}

export namespace MoveDef.SakuraiBody {
  export class LookupEntry {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.LookupTable,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.entryOffset = (this._io.readS4be()) as any
    }

    private _content: number;
    get content(): number {
      if (typeof this._content !== 'undefined')
        return this._content;
      let _pos = this._io.pos;
      this._io.seek((this.entryOffset as any));
      this._content = (this._io.readU1()) as any
      this._io.seek(_pos);
      return this._content;
    }

    entryOffset: number;
  }
}

export namespace MoveDef.SakuraiBody {
  export class ExternalSubroutine {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: unknown | undefined,
      readonly _root: MoveDef | undefined,
      entry: MoveDef.SakuraiBody.ExternalSubroutineEntry,
      stringTablePos: number,
    ) {
      this.entry = entry;
      this.stringTablePos = stringTablePos;

      this._read();
    }

    _read() {
    }

    private _name: string;
    get name(): string {
      if (typeof this._name !== 'undefined')
        return this._name;
      let _pos = this._io.pos;
      this._io.seek(((this.stringTablePos as any) + (this.entry as any).stringOffset));
      this._name = (KaitaiStream.bytesToStr(this._io.readBytesTerm(0, false, true, true), "ascii")) as any
      this._io.seek(_pos);
      return this._name;
    }

    private _offsets: Array<number>;
    get offsets(): Array<number> {
      if (typeof this._offsets !== 'undefined')
        return this._offsets;
      let _pos = this._io.pos;
      this._io.seek((this.entry as any).offsetLinkedList);
      this._offsets = [];
      {
        let _, _buf, i = 0;
        do {
          _ = this._io.readS4be();
          this._offsets.push(_);
          i++;
        } while (!(_ == 0));
      }
      this._io.seek(_pos);
      return this._offsets;
    }

    entry: MoveDef.SakuraiBody.ExternalSubroutineEntry;
    stringTablePos: number;
  }
}

export namespace MoveDef.SakuraiBody {
  export class ArcFighterData {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.Section,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.subactionFlagsStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.modelVisibilityStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.attributeStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.sseAttributeStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.miscSectionOffset = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.commonActionFlagsStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.actionFlagsStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.unknown7 = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.actionInterrupts = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.entryActionsStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.exitActionsStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.actionPreStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.subactionMainStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.subactionGfxStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.subactionSfxStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.subactionOtherStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.anchoredItemPositions = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.gooeyBombPositions = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.boneRef1 = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.boneRef2 = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.entryActionOverridesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.exitActionOverridesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.unknown22 = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.samusArmCannonPositions = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.unknown24 = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.staticArticlesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.entryArticlesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.flags1 = (this._io.readU4be()) as any
      this.flags2 = (this._io.readU4be()) as any
      this.flags3 = (this._io.readU4be()) as any
      this.flags4 = (this._io.readU4be()) as any
    }

    subactionFlagsStart: MoveDef.Ptr;
    modelVisibilityStart: MoveDef.Ptr;
    attributeStart: MoveDef.Ptr;
    sseAttributeStart: MoveDef.Ptr;
    miscSectionOffset: MoveDef.Ptr;
    commonActionFlagsStart: MoveDef.Ptr;
    actionFlagsStart: MoveDef.Ptr;
    unknown7: MoveDef.Ptr;
    actionInterrupts: MoveDef.Ptr;
    entryActionsStart: MoveDef.Ptr;
    exitActionsStart: MoveDef.Ptr;
    actionPreStart: MoveDef.Ptr;
    subactionMainStart: MoveDef.Ptr;
    subactionGfxStart: MoveDef.Ptr;
    subactionSfxStart: MoveDef.Ptr;
    subactionOtherStart: MoveDef.Ptr;
    anchoredItemPositions: MoveDef.Ptr;
    gooeyBombPositions: MoveDef.Ptr;
    boneRef1: MoveDef.Ptr;
    boneRef2: MoveDef.Ptr;
    entryActionOverridesStart: MoveDef.Ptr;
    exitActionOverridesStart: MoveDef.Ptr;
    unknown22: MoveDef.Ptr;
    samusArmCannonPositions: MoveDef.Ptr;
    unknown24: MoveDef.Ptr;
    staticArticlesStart: MoveDef.Ptr;
    entryArticlesStart: MoveDef.Ptr;
    flags1: number;
    flags2: number;
    flags3: number;
    flags4: number;
  }
}

export namespace MoveDef.SakuraiBody {
  export class Section {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: MoveDef.SakuraiBody | undefined,
      readonly _root: MoveDef | undefined,
      entry: MoveDef.SakuraiBody.SectionEntry,
      stringTablePos: number,
    ) {
      this.entry = entry;
      this.stringTablePos = stringTablePos;

      this._read();
    }

    _read() {
    }

    private _name: string;
    get name(): string {
      if (typeof this._name !== 'undefined')
        return this._name;
      let _pos = this._io.pos;
      this._io.seek(((this.stringTablePos as any) + (this.entry as any).stringOffset));
      this._name = (KaitaiStream.bytesToStr(this._io.readBytesTerm(0, false, true, true), "ascii")) as any
      this._io.seek(_pos);
      return this._name;
    }

    private _dataPos: number;
    get dataPos(): number {
      if (typeof this._dataPos !== 'undefined')
        return this._dataPos;
      this._dataPos = ((this.entry as any).contentOffset) as any
      return this._dataPos;
    }

    private _data: MoveDef.SakuraiBody.ArcFighterData | MoveDef.SakuraiBody.ArcFighterDataCommon | AnimCmd | number | MoveDef.SakuraiBody.ItAnimParam;
    get data(): MoveDef.SakuraiBody.ArcFighterData | MoveDef.SakuraiBody.ArcFighterDataCommon | AnimCmd | number | MoveDef.SakuraiBody.ItAnimParam {
      if (typeof this._data !== 'undefined')
        return this._data;
      let _pos = this._io.pos;
      this._io.seek((this.entry as any).contentOffset);
      switch (( (((this.name as any).substring(0, 12) == "gameAnimCmd_") || ((this.name as any).substring(0, 14) == "effectAnimCmd_") || ((this.name as any).substring(0, 19) == "statusAnimCmdGroup_") || ((this.name as any).substring(0, 17) == "statusAnimCmdPre_") || ((this.name as any).substring(0, 18) == "statusAnimCmdExit_") || ((this.name as any).substring(0, 14) == "statusAnimCmd_"))  ? MoveDef.SakuraiBody.Section.SectionType.ANIM_CMD : ((this.name as any) == "dataCommon" ? MoveDef.SakuraiBody.Section.SectionType.DATA_COMMON : ((this.name as any) == "data" ? MoveDef.SakuraiBody.Section.SectionType.DATA : ((this.name as any).substring(0, 9) == "animParam" ? MoveDef.SakuraiBody.Section.SectionType.IT_ANIM_PARAM : MoveDef.SakuraiBody.Section.SectionType.UNK))))) {
        case MoveDef.SakuraiBody.Section.SectionType.DATA: {
          this._data = (new MoveDef.SakuraiBody.ArcFighterData(this._io, this, this._root)) as any
          break;
        }
        case MoveDef.SakuraiBody.Section.SectionType.DATA_COMMON: {
          this._data = (new MoveDef.SakuraiBody.ArcFighterDataCommon(this._io, this, this._root)) as any
          break;
        }
        case MoveDef.SakuraiBody.Section.SectionType.ANIM_CMD: {
          this._data = (new AnimCmd(this._io, this, null)) as any
          break;
        }
        case MoveDef.SakuraiBody.Section.SectionType.IT_ANIM_PARAM: {
          this._data = (new MoveDef.SakuraiBody.ItAnimParam(this._io, this, this._root)) as any
          break;
        }
        default: {
          this._data = (this._io.readU4be()) as any
          break;
        }
      }
      this._io.seek(_pos);
      return this._data;
    }

    entry: MoveDef.SakuraiBody.SectionEntry;
    stringTablePos: number;
  }
}
export namespace MoveDef.SakuraiBody.Section {
  export enum SectionType {
    UNK = -1,
    ANIM_CMD = 1,
    DATA_COMMON = 2,
    DATA = 3,
    IT_ANIM_PARAM = 4,
    SUB_PARAM = 5,
  }
}

export namespace MoveDef.SakuraiBody {
  export class ExternalSubroutineEntry {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.LookupTable,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.offsetLinkedList = (this._io.readS4be()) as any
      this.stringOffset = (this._io.readS4be()) as any
    }

    offsetLinkedList: number;
    stringOffset: number;
  }
}

export namespace MoveDef.SakuraiBody {
  export class LookupTable {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: MoveDef.SakuraiBody | undefined,
      readonly _root: MoveDef | undefined,
      lookupCount: number,
      sectionCount: number,
      externalSubroutineCount: number,
    ) {
      this.lookupCount = lookupCount;
      this.sectionCount = sectionCount;
      this.externalSubroutineCount = externalSubroutineCount;

      this._read();
    }

    _read() {
      this.entries = [];
      for (let i = 0; i < (this.lookupCount as any); i++) {
        this.entries.push(new MoveDef.SakuraiBody.LookupEntry(this._io, this, this._root));
      }
      this.sections = [];
      for (let i = 0; i < (this.sectionCount as any); i++) {
        this.sections.push(new MoveDef.SakuraiBody.SectionEntry(this._io, this, this._root));
      }
      this.externalSubroutines = [];
      for (let i = 0; i < (this.externalSubroutineCount as any); i++) {
        this.externalSubroutines.push(new MoveDef.SakuraiBody.ExternalSubroutineEntry(this._io, this, this._root));
      }
      if ((this.stringTablePos as any) < 0) {
        this._unnamed3 = (this._io.readBytes(0)) as any
      }
    }

    private _stringTablePos: number;
    get stringTablePos(): number {
      if (typeof this._stringTablePos !== 'undefined')
        return this._stringTablePos;
      this._stringTablePos = ((this._io as any).pos) as any
      return this._stringTablePos;
    }

    entries: Array<MoveDef.SakuraiBody.LookupEntry>;
    sections: Array<MoveDef.SakuraiBody.SectionEntry>;
    externalSubroutines: Array<MoveDef.SakuraiBody.ExternalSubroutineEntry>;
    _unnamed3: Uint8Array | undefined;
    lookupCount: number;
    sectionCount: number;
    externalSubroutineCount: number;
  }
}

export namespace MoveDef.SakuraiBody {
  export class ArcFighterDataCommon {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.Section,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.globalIcs = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.globalIcsSse = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.ics = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.icsSse = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.entryActionsStart = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", 274)) as any
      this.exitActionsStart = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", 274)) as any
      this.flashOverlayArray = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk7 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk8 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.itemSwingData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk10 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk11OffsetTable = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk12 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk13 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk14 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk15 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk16 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.patterPowerMul = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.rgbaColor = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.flashOverlayOffset = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.screenTints = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.legBones = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unk22TableReference = (new MoveDef.Ptr(this._io, this, this._root, "unk22_table")) as any
    }

    globalIcs: MoveDef.Ptr;
    globalIcsSse: MoveDef.Ptr;
    ics: MoveDef.Ptr;
    icsSse: MoveDef.Ptr;
    entryActionsStart: MoveDef.PtrPtrTable;
    exitActionsStart: MoveDef.PtrPtrTable;
    flashOverlayArray: MoveDef.Ptr;
    unk7: MoveDef.Ptr;
    unk8: MoveDef.Ptr;
    itemSwingData: MoveDef.Ptr;
    unk10: MoveDef.Ptr;
    unk11OffsetTable: MoveDef.Ptr;
    unk12: MoveDef.Ptr;
    unk13: MoveDef.Ptr;
    unk14: MoveDef.Ptr;
    unk15: MoveDef.Ptr;
    unk16: MoveDef.Ptr;
    patterPowerMul: MoveDef.Ptr;
    rgbaColor: MoveDef.Ptr;
    flashOverlayOffset: MoveDef.Ptr;
    screenTints: MoveDef.Ptr;
    legBones: MoveDef.Ptr;
    unk22TableReference: MoveDef.Ptr;
  }
}

export namespace MoveDef.SakuraiBody {
  export class SectionEntry {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.LookupTable,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.contentOffset = (this._io.readS4be()) as any
      this.stringOffset = (this._io.readS4be()) as any
    }

    contentOffset: number;
    stringOffset: number;
  }
}

export namespace MoveDef.SakuraiBody {
  export class ItAnimParam {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.Section,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.motionDataPtr = (this._io.readU4be()) as any
      this.motionNum = (this._io.readU4be()) as any
      this.statusData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.statusNum = (this._io.readU4be()) as any
      this.visibilityData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.physicsIkData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.effectNodeData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.motionAnimCmdGame = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", (this.motionNum as any))) as any
      this.motionAnimCmdEffect = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", (this.motionNum as any))) as any
      this.motionAnimCmdSound = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", (this.motionNum as any))) as any
      this.statusAnimCmd = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", (this.statusNum as any))) as any
      this.eventAnimCmd = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", 0)) as any
      this.collisionHitDataSet = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.collisionReflectorDataSet = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.groundShapeDataSet = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.modelFlags = (this._io.readS4be()) as any
    }

    private _motionData: Array<MoveDef.SoMotionData>;
    get motionData(): Array<MoveDef.SoMotionData> {
      if (typeof this._motionData !== 'undefined')
        return this._motionData;
      let _pos = this._io.pos;
      this._io.seek((this.motionDataPtr as any));
      this._motionData = [];
      for (let i = 0; i < (this.motionNum as any); i++) {
        this._motionData.push(new MoveDef.SoMotionData(this._io, this, this._root));
      }
      this._io.seek(_pos);
      return this._motionData;
    }

    motionDataPtr: number;
    motionNum: number;
    statusData: MoveDef.Ptr;
    statusNum: number;
    visibilityData: MoveDef.Ptr;
    physicsIkData: MoveDef.Ptr;
    effectNodeData: MoveDef.Ptr;
    motionAnimCmdGame: MoveDef.PtrPtrTable;
    motionAnimCmdEffect: MoveDef.PtrPtrTable;
    motionAnimCmdSound: MoveDef.PtrPtrTable;
    statusAnimCmd: MoveDef.PtrPtrTable;
    eventAnimCmd: MoveDef.PtrPtrTable;
    collisionHitDataSet: MoveDef.Ptr;
    collisionReflectorDataSet: MoveDef.Ptr;
    groundShapeDataSet: MoveDef.Ptr;
    modelFlags: number;
  }
}

export namespace MoveDef {
  export class PtrPtrTable {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: unknown | undefined,
      readonly _root: MoveDef | undefined,
      dtype: string,
      amt: number,
    ) {
      this.dtype = dtype;
      this.amt = amt;

      this._read();
    }

    _read() {
      this.offset = (this._io.readS4be()) as any
      if ((this.amt as any) == 0) {
        this.count = (this._io.readU4be()) as any
      }
    }

    private _len: number;
    get len(): number {
      if (typeof this._len !== 'undefined')
        return this._len;
      this._len = (((this.amt as any) == -1 ? 0 : ((this.amt as any) == 0 ? (this.count as any) : (this.amt as any)))) as any
      return this._len;
    }

    private _ptrTable: MoveDef.PtrTable | undefined;
    get ptrTable(): MoveDef.PtrTable | undefined {
      if (typeof this._ptrTable !== 'undefined')
        return this._ptrTable;
      if ((this.offset as any) != 0) {
        let _pos = this._io.pos;
        this._io.seek((this.offset as any));
        this._ptrTable = (new MoveDef.PtrTable(this._io, this, this._root, (this.dtype as any), (this.len as any))) as any
        this._io.seek(_pos);
      }
      return this._ptrTable;
    }

    offset: number;
    count: number | undefined;
    dtype: string;
    amt: number;
  }
}

export namespace MoveDef {
  export class PtrTable {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: MoveDef.PtrPtrTable | undefined,
      readonly _root: MoveDef | undefined,
      dtype: string,
      amt: number,
    ) {
      this.dtype = dtype;
      this.amt = amt;

      this._read();
    }

    _read() {
      this.entries = [];
      for (let i = 0; i < (this.amt as any); i++) {
        this.entries.push(new MoveDef.Ptr(this._io, this, this._root, (this.dtype as any)));
      }
    }

    entries: Array<MoveDef.Ptr>;
    dtype: string;
    amt: number;
  }
}

export namespace MoveDef {
  export class Dummy {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.Atype,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
    }

    private _d: string;
    get d(): string {
      if (typeof this._d !== 'undefined')
        return this._d;
      this._d = ("dummy") as any
      return this._d;
    }

  }
}

export namespace MoveDef {
  export class Unk22Table {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.Atype,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.offset = (this._io.readS4be()) as any
      this.length = (this._io.readU4be()) as any
    }

    private _objects: Array<number>;
    get objects(): Array<number> {
      if (typeof this._objects !== 'undefined')
        return this._objects;
      let _pos = this._io.pos;
      this._io.seek((this.offset as any));
      this._objects = [];
      for (let i = 0; i < (this.length as any); i++) {
        this._objects.push(this._io.readS4be());
      }
      this._io.seek(_pos);
      return this._objects;
    }

    offset: number;
    length: number;
  }
}

export namespace MoveDef {
  export class SakuraiHeader {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.size = (this._io.readS4be()) as any
      this.lookupEntryOffset = (this._io.readS4be()) as any
      this.lookupEntryCount = (this._io.readS4be()) as any
      this.sectionCount = (this._io.readS4be()) as any
      this.externalSubroutineCount = (this._io.readS4be()) as any
      this.padding = (this._io.readBytesFull()) as any
    }

    size: number;
    lookupEntryOffset: number;
    lookupEntryCount: number;
    sectionCount: number;
    externalSubroutineCount: number;
    padding: Uint8Array;
  }
}

export namespace MoveDef {
  export class Ptr {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: unknown | undefined,
      readonly _root: MoveDef | undefined,
      dtype: string,
    ) {
      this.dtype = dtype;

      this._read();
    }

    _read() {
      this.offset = (this._io.readS4be()) as any
    }

    private _data: MoveDef.Atype | undefined;
    get data(): MoveDef.Atype | undefined {
      if (typeof this._data !== 'undefined')
        return this._data;
      if ( (((this.offset as any) != 0) || ((this.dtype as any) == "strz")) ) {
        let _pos = this._io.pos;
        this._io.seek((this.offset as any));
        this._data = (new MoveDef.Atype(this._io, this, this._root, (this.dtype as any))) as any
        this._io.seek(_pos);
      }
      return this._data;
    }

    offset: number;
    dtype: string;
  }
}

export namespace MoveDef {
  export class SoMotionData {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: unknown,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.flags = (this._io.readU4be()) as any
      this.motionName = (new MoveDef.Ptr(this._io, this, this._root, "strz")) as any
    }

    flags: number;
    motionName: MoveDef.Ptr;
  }
}

export namespace MoveDef {
  export class Atype {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent: MoveDef.Ptr | undefined,
      readonly _root: MoveDef | undefined,
      dtype: string,
    ) {
      this.dtype = dtype;

      this._read();
    }

    _read() {
      switch ((this.dtype as any)) {
        case "s4": {
          this.data = (this._io.readS4be()) as any
          break;
        }
        case "s1": {
          this.data = (this._io.readS1()) as any
          break;
        }
        case "u4": {
          this.data = (this._io.readU4be()) as any
          break;
        }
        case "u2": {
          this.data = (this._io.readU2be()) as any
          break;
        }
        case "s2": {
          this.data = (this._io.readS2be()) as any
          break;
        }
        case "strz": {
          this.data = (KaitaiStream.bytesToStr(this._io.readBytesTerm(0, false, true, true), "ascii")) as any
          break;
        }
        case "f4": {
          this.data = (this._io.readF4be()) as any
          break;
        }
        case "u1": {
          this.data = (this._io.readU1()) as any
          break;
        }
        case "anim_cmd": {
          this.data = (new AnimCmd(this._io, this, null)) as any
          break;
        }
        case "so_motion_data": {
          this.data = (new MoveDef.SoMotionData(this._io, this, this._root)) as any
          break;
        }
        case "unk22_table": {
          this.data = (new MoveDef.Unk22Table(this._io, this, this._root)) as any
          break;
        }
        default: {
          this.data = (new MoveDef.Dummy(this._io, this, this._root)) as any
          break;
        }
      }
    }

    data: number | number | number | number | number | string | number | number | AnimCmd | MoveDef.Dummy | MoveDef.SoMotionData | MoveDef.Unk22Table;
    dtype: string;
  }
}
