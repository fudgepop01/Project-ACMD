/*
 * This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild
 */
import KaitaiStream from 'kaitai-struct/KaitaiStream'
import {AnimCmd} from './anim-cmd'

export class MoveDef {
  _is_le?: boolean;

  constructor(
    readonly _io: KaitaiStream,
    readonly _parent: unknown | undefined,
    readonly _root: MoveDef | undefined,
    mdefKind: string,
  ) {
    this._root ??= this;
    this.mdefKind = mdefKind;

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
  mdefKind: string;
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
        this._sections.push(new MoveDef.SakuraiBody.Section(this._io, this, this._root, (this.lookupEntries as any).sections[i], (this.lookupEntries as any).stringTablePos, i));
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
      this.extraActionFlags = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
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
      this.boneRef2HandBones = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.entryActionOverridesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.exitActionOverridesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.extraActionInterrupts = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.samusArmCannonPositions = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.unknown24 = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.staticArticlesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.entryArticlesStart = (new MoveDef.Ptr(this._io, this, this._root, "u4")) as any
      this.flags1 = (this._io.readU4be()) as any
      this.flags2 = (this._io.readU4be()) as any
      this.flags3 = (this._io.readU4be()) as any
      this.flags4 = (this._io.readU4be()) as any
    }

    private _subactionOther: Array<MoveDef.Ptr>;
    get subactionOther(): Array<MoveDef.Ptr> {
      if (typeof this._subactionOther !== 'undefined')
        return this._subactionOther;
      let _pos = this._io.pos;
      this._io.seek((this.subactionOtherStart as any).offset);
      this._subactionOther = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionOther.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionOther;
    }

    private _entryActionOverrides: Array<MoveDef.SakuraiBody.ArcFighterData.ActionOverride>;
    get entryActionOverrides(): Array<MoveDef.SakuraiBody.ArcFighterData.ActionOverride> {
      if (typeof this._entryActionOverrides !== 'undefined')
        return this._entryActionOverrides;
      let _pos = this._io.pos;
      this._io.seek((this.entryActionOverridesStart as any).offset);
      this._entryActionOverrides = [];
      {
        let _, _buf, i = 0;
        do {
          _ = new MoveDef.SakuraiBody.ArcFighterData.ActionOverride(this._io, this, this._root);
          this._entryActionOverrides.push(_);
          i++;
        } while (!(_.actionId == -1));
      }
      this._io.seek(_pos);
      return this._entryActionOverrides;
    }

    private _entryActions: Array<MoveDef.Ptr>;
    get entryActions(): Array<MoveDef.Ptr> {
      if (typeof this._entryActions !== 'undefined')
        return this._entryActions;
      let _pos = this._io.pos;
      this._io.seek((this.entryActionsStart as any).offset);
      this._entryActions = [];
      for (let i = 0; i < (this.actionCount as any); i++) {
        this._entryActions.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._entryActions;
    }

    private _subactionFlags: Array<MoveDef.SoMotionData>;
    get subactionFlags(): Array<MoveDef.SoMotionData> {
      if (typeof this._subactionFlags !== 'undefined')
        return this._subactionFlags;
      let _pos = this._io.pos;
      this._io.seek((this.subactionFlagsStart as any).offset);
      this._subactionFlags = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionFlags.push(new MoveDef.SoMotionData(this._io, this, this._root));
      }
      this._io.seek(_pos);
      return this._subactionFlags;
    }

    private _actionCount: number;
    get actionCount(): number {
      if (typeof this._actionCount !== 'undefined')
        return this._actionCount;
      this._actionCount = (Math.floor(((this.exitActionsStart as any).offset - (this.entryActionsStart as any).offset) / 4)) as any
      return this._actionCount;
    }

    private _subactionSfx: Array<MoveDef.Ptr>;
    get subactionSfx(): Array<MoveDef.Ptr> {
      if (typeof this._subactionSfx !== 'undefined')
        return this._subactionSfx;
      let _pos = this._io.pos;
      this._io.seek((this.subactionSfxStart as any).offset);
      this._subactionSfx = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionSfx.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionSfx;
    }

    private _subactionGfx: Array<MoveDef.Ptr>;
    get subactionGfx(): Array<MoveDef.Ptr> {
      if (typeof this._subactionGfx !== 'undefined')
        return this._subactionGfx;
      let _pos = this._io.pos;
      this._io.seek((this.subactionGfxStart as any).offset);
      this._subactionGfx = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionGfx.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionGfx;
    }

    private _exitActions: Array<MoveDef.Ptr>;
    get exitActions(): Array<MoveDef.Ptr> {
      if (typeof this._exitActions !== 'undefined')
        return this._exitActions;
      let _pos = this._io.pos;
      this._io.seek((this.exitActionsStart as any).offset);
      this._exitActions = [];
      for (let i = 0; i < (this.actionCount as any); i++) {
        this._exitActions.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._exitActions;
    }

    private _exitActionOverrides: Array<MoveDef.SakuraiBody.ArcFighterData.ActionOverride>;
    get exitActionOverrides(): Array<MoveDef.SakuraiBody.ArcFighterData.ActionOverride> {
      if (typeof this._exitActionOverrides !== 'undefined')
        return this._exitActionOverrides;
      let _pos = this._io.pos;
      this._io.seek((this.exitActionOverridesStart as any).offset);
      this._exitActionOverrides = [];
      {
        let _, _buf, i = 0;
        do {
          _ = new MoveDef.SakuraiBody.ArcFighterData.ActionOverride(this._io, this, this._root);
          this._exitActionOverrides.push(_);
          i++;
        } while (!(_.actionId == -1));
      }
      this._io.seek(_pos);
      return this._exitActionOverrides;
    }

    private _subactionMain: Array<MoveDef.Ptr>;
    get subactionMain(): Array<MoveDef.Ptr> {
      if (typeof this._subactionMain !== 'undefined')
        return this._subactionMain;
      let _pos = this._io.pos;
      this._io.seek((this.subactionMainStart as any).offset);
      this._subactionMain = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionMain.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionMain;
    }

    private _subactionCount: number;
    get subactionCount(): number {
      if (typeof this._subactionCount !== 'undefined')
        return this._subactionCount;
      this._subactionCount = (Math.floor(((this.subactionGfxStart as any).offset - (this.subactionMainStart as any).offset) / 4)) as any
      return this._subactionCount;
    }

    subactionFlagsStart: MoveDef.Ptr;
    modelVisibilityStart: MoveDef.Ptr;
    attributeStart: MoveDef.Ptr;
    sseAttributeStart: MoveDef.Ptr;
    miscSectionOffset: MoveDef.Ptr;
    commonActionFlagsStart: MoveDef.Ptr;
    actionFlagsStart: MoveDef.Ptr;
    extraActionFlags: MoveDef.Ptr;
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
    boneRef2HandBones: MoveDef.Ptr;
    entryActionOverridesStart: MoveDef.Ptr;
    exitActionOverridesStart: MoveDef.Ptr;
    extraActionInterrupts: MoveDef.Ptr;
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

export namespace MoveDef.SakuraiBody.ArcFighterData {
  export class ActionOverride {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.ArcFighterData,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.actionId = (this._io.readS4be()) as any
      this.acmd = (new MoveDef.Ptr(this._io, this, this._root, "anim_cmd")) as any
    }

    actionId: number;
    acmd: MoveDef.Ptr;
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
      sectionIdx: number,
    ) {
      this.entry = entry;
      this.stringTablePos = stringTablePos;
      this.sectionIdx = sectionIdx;

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

    private _data: MoveDef.SakuraiBody.ArcFighterDataCommon | AnimCmd | number | MoveDef.SakuraiBody.ItAnimParam | MoveDef.SakuraiBody.ArcEnemyDataCommon | MoveDef.SakuraiBody.ArcEnemyData | MoveDef.SakuraiBody.ArcFighterData;
    get data(): MoveDef.SakuraiBody.ArcFighterDataCommon | AnimCmd | number | MoveDef.SakuraiBody.ItAnimParam | MoveDef.SakuraiBody.ArcEnemyDataCommon | MoveDef.SakuraiBody.ArcEnemyData | MoveDef.SakuraiBody.ArcFighterData {
      if (typeof this._data !== 'undefined')
        return this._data;
      let _pos = this._io.pos;
      this._io.seek((this.entry as any).contentOffset);
      switch (( (((this.name as any).substring(0, 12) == "gameAnimCmd_") || ((this.name as any).substring(0, 14) == "effectAnimCmd_") || ((this.name as any).substring(0, 19) == "statusAnimCmdGroup_") || ((this.name as any).substring(0, 17) == "statusAnimCmdPre_") || ((this.name as any).substring(0, 18) == "statusAnimCmdExit_") || ((this.name as any).substring(0, 14) == "statusAnimCmd_"))  ? MoveDef.SakuraiBody.Section.SectionType.ANIM_CMD : ((this.name as any) == "dataCommon" ? MoveDef.SakuraiBody.Section.SectionType.DATA_COMMON : ((this.name as any) == "commonData" ? MoveDef.SakuraiBody.Section.SectionType.DATA_ENEMY_COMMON : ( (((this.name as any) == "data") && ((this._root as any).mdefKind == "fighter"))  ? MoveDef.SakuraiBody.Section.SectionType.DATA_FIGHTER : ( (((this.name as any) == "data") && ((this._root as any).mdefKind == "enemy"))  ? MoveDef.SakuraiBody.Section.SectionType.DATA_ENEMY : ((this.name as any).substring(0, 9) == "animParam" ? MoveDef.SakuraiBody.Section.SectionType.IT_ANIM_PARAM : MoveDef.SakuraiBody.Section.SectionType.UNK))))))) {
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
        case MoveDef.SakuraiBody.Section.SectionType.DATA_ENEMY_COMMON: {
          this._data = (new MoveDef.SakuraiBody.ArcEnemyDataCommon(this._io, this, this._root)) as any
          break;
        }
        case MoveDef.SakuraiBody.Section.SectionType.DATA_ENEMY: {
          this._data = (new MoveDef.SakuraiBody.ArcEnemyData(this._io, this, this._root)) as any
          break;
        }
        case MoveDef.SakuraiBody.Section.SectionType.DATA_FIGHTER: {
          this._data = (new MoveDef.SakuraiBody.ArcFighterData(this._io, this, this._root)) as any
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
    sectionIdx: number;
  }
}
export namespace MoveDef.SakuraiBody.Section {
  export enum SectionType {
    UNK = -1,
    ANIM_CMD = 1,
    DATA_COMMON = 2,
    DATA_FIGHTER = 3,
    DATA_ENEMY_COMMON = 4,
    DATA_ENEMY = 5,
    IT_ANIM_PARAM = 6,
    SUB_PARAM = 7,
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
      this.offset = (this._io.readS4be()) as any
      this.stringOffset = (this._io.readS4be()) as any
    }

    private _string: string;
    get string(): string {
      if (typeof this._string !== 'undefined')
        return this._string;
      let _pos = this._io.pos;
      this._io.seek(((this._parent as any).stringTablePos + (this.stringOffset as any)));
      this._string = (KaitaiStream.bytesToStr(this._io.readBytesTerm(0, false, true, true), "ascii")) as any
      this._io.seek(_pos);
      return this._string;
    }

    offset: number;
    stringOffset: number;
  }
}

export namespace MoveDef.SakuraiBody {
  export class ArcEnemyData {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.Section,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.subactionFlagsStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.hitDataSet = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.hitWeaknessDataSet = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.params3 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unknownCount = (this._io.readS4be()) as any
      this.setableNodeData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.attributes1 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.attributes2 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unknownDatas8 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.actionFlags = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionMainStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionMainExitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionMainInitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionGfxStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionGfxExitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionGfxInitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionSfxStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionSfxExitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.subactionSfxInitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.actionStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.actionExitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.actionInitStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unknownDatas22 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.collisionData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.unkEventOffset = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.cameraRangeSet = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.cameraClipSphereData = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.grColDataSet = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
    }

    private _subactionFlags: Array<MoveDef.SoMotionData>;
    get subactionFlags(): Array<MoveDef.SoMotionData> {
      if (typeof this._subactionFlags !== 'undefined')
        return this._subactionFlags;
      let _pos = this._io.pos;
      this._io.seek((this.subactionFlagsStart as any).offset);
      this._subactionFlags = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionFlags.push(new MoveDef.SoMotionData(this._io, this, this._root));
      }
      this._io.seek(_pos);
      return this._subactionFlags;
    }

    private _actionCount: number;
    get actionCount(): number {
      if (typeof this._actionCount !== 'undefined')
        return this._actionCount;
      this._actionCount = (Math.floor(((this.actionExitStart as any).offset - (this.actionStart as any).offset) / 4)) as any
      return this._actionCount;
    }

    private _subactionSfx: Array<MoveDef.Ptr>;
    get subactionSfx(): Array<MoveDef.Ptr> {
      if (typeof this._subactionSfx !== 'undefined')
        return this._subactionSfx;
      let _pos = this._io.pos;
      this._io.seek((this.subactionSfxStart as any).offset);
      this._subactionSfx = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionSfx.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionSfx;
    }

    private _subactionMainInit: Array<MoveDef.Ptr>;
    get subactionMainInit(): Array<MoveDef.Ptr> {
      if (typeof this._subactionMainInit !== 'undefined')
        return this._subactionMainInit;
      let _pos = this._io.pos;
      this._io.seek((this.subactionMainInitStart as any).offset);
      this._subactionMainInit = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionMainInit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionMainInit;
    }

    private _actionInit: Array<MoveDef.Ptr>;
    get actionInit(): Array<MoveDef.Ptr> {
      if (typeof this._actionInit !== 'undefined')
        return this._actionInit;
      let _pos = this._io.pos;
      this._io.seek((this.actionInitStart as any).offset);
      this._actionInit = [];
      for (let i = 0; i < (this.actionCount as any); i++) {
        this._actionInit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._actionInit;
    }

    private _subactionGfxExit: Array<MoveDef.Ptr>;
    get subactionGfxExit(): Array<MoveDef.Ptr> {
      if (typeof this._subactionGfxExit !== 'undefined')
        return this._subactionGfxExit;
      let _pos = this._io.pos;
      this._io.seek((this.subactionGfxExitStart as any).offset);
      this._subactionGfxExit = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionGfxExit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionGfxExit;
    }

    private _subactionGfxInit: Array<MoveDef.Ptr>;
    get subactionGfxInit(): Array<MoveDef.Ptr> {
      if (typeof this._subactionGfxInit !== 'undefined')
        return this._subactionGfxInit;
      let _pos = this._io.pos;
      this._io.seek((this.subactionGfxInitStart as any).offset);
      this._subactionGfxInit = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionGfxInit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionGfxInit;
    }

    private _subactionGfx: Array<MoveDef.Ptr>;
    get subactionGfx(): Array<MoveDef.Ptr> {
      if (typeof this._subactionGfx !== 'undefined')
        return this._subactionGfx;
      let _pos = this._io.pos;
      this._io.seek((this.subactionGfxStart as any).offset);
      this._subactionGfx = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionGfx.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionGfx;
    }

    private _subactionMainExit: Array<MoveDef.Ptr>;
    get subactionMainExit(): Array<MoveDef.Ptr> {
      if (typeof this._subactionMainExit !== 'undefined')
        return this._subactionMainExit;
      let _pos = this._io.pos;
      this._io.seek((this.subactionMainExitStart as any).offset);
      this._subactionMainExit = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionMainExit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionMainExit;
    }

    private _subactionMain: Array<MoveDef.Ptr>;
    get subactionMain(): Array<MoveDef.Ptr> {
      if (typeof this._subactionMain !== 'undefined')
        return this._subactionMain;
      let _pos = this._io.pos;
      this._io.seek((this.subactionMainStart as any).offset);
      this._subactionMain = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionMain.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionMain;
    }

    private _subactionSfxInit: Array<MoveDef.Ptr>;
    get subactionSfxInit(): Array<MoveDef.Ptr> {
      if (typeof this._subactionSfxInit !== 'undefined')
        return this._subactionSfxInit;
      let _pos = this._io.pos;
      this._io.seek((this.subactionSfxInitStart as any).offset);
      this._subactionSfxInit = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionSfxInit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionSfxInit;
    }

    private _subactionCount: number;
    get subactionCount(): number {
      if (typeof this._subactionCount !== 'undefined')
        return this._subactionCount;
      this._subactionCount = (Math.floor(((this.subactionMainExitStart as any).offset - (this.subactionMainStart as any).offset) / 4)) as any
      return this._subactionCount;
    }

    private _action: Array<MoveDef.Ptr>;
    get action(): Array<MoveDef.Ptr> {
      if (typeof this._action !== 'undefined')
        return this._action;
      let _pos = this._io.pos;
      this._io.seek((this.actionStart as any).offset);
      this._action = [];
      for (let i = 0; i < (this.actionCount as any); i++) {
        this._action.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._action;
    }

    private _actionExit: Array<MoveDef.Ptr>;
    get actionExit(): Array<MoveDef.Ptr> {
      if (typeof this._actionExit !== 'undefined')
        return this._actionExit;
      let _pos = this._io.pos;
      this._io.seek((this.actionExitStart as any).offset);
      this._actionExit = [];
      for (let i = 0; i < (this.actionCount as any); i++) {
        this._actionExit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._actionExit;
    }

    private _subactionSfxExit: Array<MoveDef.Ptr>;
    get subactionSfxExit(): Array<MoveDef.Ptr> {
      if (typeof this._subactionSfxExit !== 'undefined')
        return this._subactionSfxExit;
      let _pos = this._io.pos;
      this._io.seek((this.subactionSfxExitStart as any).offset);
      this._subactionSfxExit = [];
      for (let i = 0; i < (this.subactionCount as any); i++) {
        this._subactionSfxExit.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._subactionSfxExit;
    }

    subactionFlagsStart: MoveDef.Ptr;
    hitDataSet: MoveDef.Ptr;
    hitWeaknessDataSet: MoveDef.Ptr;
    params3: MoveDef.Ptr;
    unknownCount: number;
    setableNodeData: MoveDef.Ptr;
    attributes1: MoveDef.Ptr;
    attributes2: MoveDef.Ptr;
    unknownDatas8: MoveDef.Ptr;
    actionFlags: MoveDef.Ptr;
    subactionMainStart: MoveDef.Ptr;
    subactionMainExitStart: MoveDef.Ptr;
    subactionMainInitStart: MoveDef.Ptr;
    subactionGfxStart: MoveDef.Ptr;
    subactionGfxExitStart: MoveDef.Ptr;
    subactionGfxInitStart: MoveDef.Ptr;
    subactionSfxStart: MoveDef.Ptr;
    subactionSfxExitStart: MoveDef.Ptr;
    subactionSfxInitStart: MoveDef.Ptr;
    actionStart: MoveDef.Ptr;
    actionExitStart: MoveDef.Ptr;
    actionInitStart: MoveDef.Ptr;
    unknownDatas22: MoveDef.Ptr;
    collisionData: MoveDef.Ptr;
    unkEventOffset: MoveDef.Ptr;
    cameraRangeSet: MoveDef.Ptr;
    cameraClipSphereData: MoveDef.Ptr;
    grColDataSet: MoveDef.Ptr;
  }
}

export namespace MoveDef.SakuraiBody {
  export class ArcEnemyDataCommon {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: MoveDef.SakuraiBody.Section,
      readonly _root?: MoveDef,
    ) {

      this._read();
    }

    _read() {
      this.params0 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.data1 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.data2 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.params3 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.gfxEventsStart = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.params5 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
      this.params6 = (new MoveDef.Ptr(this._io, this, this._root, "s4")) as any
    }

    private _gfxEvents: Array<MoveDef.Ptr>;
    get gfxEvents(): Array<MoveDef.Ptr> {
      if (typeof this._gfxEvents !== 'undefined')
        return this._gfxEvents;
      let _pos = this._io.pos;
      this._io.seek((this.gfxEventsStart as any).offset);
      this._gfxEvents = [];
      for (let i = 0; i < 26; i++) {
        this._gfxEvents.push(new MoveDef.Ptr(this._io, this, this._root, "anim_cmd"));
      }
      this._io.seek(_pos);
      return this._gfxEvents;
    }

    params0: MoveDef.Ptr;
    data1: MoveDef.Ptr;
    data2: MoveDef.Ptr;
    params3: MoveDef.Ptr;
    gfxEventsStart: MoveDef.Ptr;
    params5: MoveDef.Ptr;
    params6: MoveDef.Ptr;
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
      this.eventAnimCmd = (new MoveDef.PtrPtrTable(this._io, this, this._root, "anim_cmd", 5)) as any
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
