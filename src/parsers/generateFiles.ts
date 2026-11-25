import { join } from "path";
import { readFile, writeFile, readdir, mkdir, access } from 'fs/promises';

import { MoveDef, MoveDef as Movedef } from './movedef';
import * as KaitaiStream from 'kaitai-struct/KaitaiStream';
import { AnimCmd } from './animCmd';
import KnownCommands, { ICommandFullMetadata, ICommandMetadata } from "./commands";
import { VarUsage, padHex, ArgType, ValueOf, WorkVariable, VarDataType, VarType } from './util';
import { AnimationFlag as AnimationFlags, Comparison, Requirement, TrueFalse } from "./translations";
import statusNames from "./statusNames";

interface CmdContext {
  name: string;
};

interface PtrOffsetPair {
  offset: number;
  ptr: Movedef.Ptr;
}

const variableTracker: VarUsage[] = [];

const dataOffsets = {};
const unnamedOffsets = {};
const hiddenSubRoutines = [];
const externalSubroutines = {};

const makeArgument = (args: AnimCmd.Argument[], argIdx: number, cmdIdx: number, offset: number, ctx: CmdContext, baseTranslator?: (arg: AnimCmd.Argument) => string): {out: string, consumed: number} => {
  const parseArg = (idx: number, initial: boolean, translator?: (arg: AnimCmd.Argument) => string) => {
    let out = "";
    const arg = args[idx];
    let consumed = 1;
    if (initial) {
      if (!arg) out += "ERR(";
      else {
        switch (arg.type) {
          // case ArgType.INT: out += "I("; break;
          // case ArgType.SCALAR: out += "S("; break;
          case ArgType.OFFSET: out += "O("; break;
          // case ArgType.BOOL: out += "B("; break;
          case ArgType.FILE: out += "F("; break;
          // case ArgType.VARIABLE: out += "V("; break;
          case ArgType.REQUIREMENT: out += "R("; break;
        }
      }
    }
  
    if (translator) {
      out += translator(arg);
    } else {
      if (!arg) out += `ERRVALUE`;
      else {
        switch (arg.type) {
          case ArgType.INT:
            const intValue = (arg.content > 0x7FFFFFFF) ? ((arg.content - 0xFFFFFFFF - 1)) : arg.content;
            out += `${intValue}`; // Int
            break;
          case ArgType.SCALAR:
            const scaValue = (arg.content > 0x7FFFFFFF) ? ((arg.content - 0xFFFFFFFF - 1)) : arg.content;
            out += `${scaValue / 60000}`; // Scalar
            if (!out.includes('.')) out += '.0'
            break;
          case ArgType.OFFSET:
            out += `0x${padHex(arg.content, 8)}`; // Offset
            break;
          case ArgType.BOOL:
            out += `${arg.content ? 'true' : 'false'}`;
            break;
          case ArgType.FILE:
            out += `0x${padHex(arg.content, 8)}`;
            break;
          case ArgType.VARIABLE:
            const workVar = new WorkVariable(arg.content);
            variableTracker.push({
              sectionName: dataOffsets[offset] ?? ctx.name,
              command: cmdIdx,
              argument: idx,
              variable: workVar
            });
            out += workVar.toString();
            break;
          case ArgType.REQUIREMENT:
            const req = Requirement(arg);
            out += req.out + '('
            for (let i = 0; i < req.consumed; i++) {
              const arg = parseArg(idx + i + 1, false, req.knownArgs[i]);
              out += arg.out;
              consumed += arg.consumed;
              if (i < req.consumed - 1) out += " ";
            }
            out += ')';
            break;
        }
      }
    }
    if (initial) {
      if (!arg) out += ")";
      else {
        switch (arg.type) {
          // case ArgType.INT: out += "I("; break;
          // case ArgType.SCALAR: out += "S("; break;
          case ArgType.OFFSET:
          // case ArgType.BOOL: out += "B("; break;
          case ArgType.FILE:
          // case ArgType.VARIABLE: out += "V("; break;
          case ArgType.REQUIREMENT: 
            out += ")"; 
            break;
        }
      }
    }

    return {
      out, 
      consumed
    };
  }
  const parsed = parseArg(argIdx, true, baseTranslator);
  return {
    out: parsed.out,
    consumed: parsed.consumed
  }
}

const getCommandData = (cmd: AnimCmd.Command) => {
  let cmdMetadata = KnownCommands.commands[(cmd.namespace << 24) | (cmd.code << 16) | (cmd.numArguments << 8) | 0];
  let cmdName: string = undefined;
  let cmdArgs: ICommandFullMetadata["args"] = {};
  
  if (typeof cmdMetadata === "string") {
    cmdName = cmdMetadata;
  } else if (cmdMetadata !== undefined) {
    cmdArgs = cmdMetadata.args;
    cmdName = cmdMetadata.name;
  } else {
    let cmdMethod = KnownCommands.defaultNamesForUndocumented[(cmd.namespace << 24) | (cmd.code << 16) | 0 | 0];
    if (cmdMethod !== undefined) {
      cmdName = cmdMethod + "_UNDOC" + cmd.numArguments + "ARGS";
    }
  }
  return {
    cmdName,
    cmdArgs
  };
}

const getArgList = (cmd: AnimCmd.Command, cmdIdx: number, offset: number, ctx: CmdContext, cmdArgs: {[key: number]: (argument: AnimCmd.Argument) => string}) => {
  let out = "";
  const argEntries = Array.from(cmd.arguments.entries());
  for (let i = 0, argIdx = 0; i < argEntries.length && argIdx < argEntries.length; i++) {
    const createdArgument = makeArgument(cmd.arguments, argIdx, cmdIdx, offset, ctx, cmdArgs[argIdx]);
    out += createdArgument.out;
    argIdx += createdArgument.consumed;
    
    if (argIdx < cmd.arguments.length) {
      out += ", ";
    }
  }
  return out;
}

const parseAnimCmd = (data: AnimCmd, offset: number, ctx: CmdContext) => {
  let out = "";
  let conditionalBuilder = "";
  let indent = 0;
  let addingRequirements = false;
  const commands = [...data.command];
  // console.log(ctx);
  // console.log(data.command[0]);
  cmdLoop: for (const [cmdIdx, cmd] of commands.entries()) {
    if ((cmdIdx + 1) === data.command.length) {
      break;
    }
    let cmdString = "".padStart((indent * 2) + 2, " ");
    const { cmdName, cmdArgs } = getCommandData(cmd);
    const nextCmdName = (cmdIdx + 1 < commands.length) ? getCommandData(commands[cmdIdx + 1]).cmdName : '';
    if (cmdName) { 
      if (cmdName === "AdditionalRequirement") {
        addingRequirements = true;
      } else if (addingRequirements) {
        out += '\n';
        addingRequirements = false;
      } else if (nextCmdName === "AdditionalRequirement") {
        out += '\n';
      }
    
      switch (cmdName) {
        case "IF_REQ_UNKNOWN_3ARG":
        case "IF_UNKNOWN_7ARG": {
          if (conditionalBuilder.length) {
            out += cmdString.substring(2) + conditionalBuilder.substring(0, conditionalBuilder.length - 1) + ") {\n";
            conditionalBuilder = "";
          }
          
          indent++;
          const args = getArgList(cmd, cmdIdx, offset, ctx, cmdArgs);
          conditionalBuilder += `if [${cmdName}] (${args} `;
        } continue cmdLoop;
        case "ELSEIF_REQ_UNKNOWN_3ARG": {
          const args = getArgList(cmd, cmdIdx, offset, ctx, cmdArgs);
          conditionalBuilder += `} ${cmdName} (${args} `;
        } continue cmdLoop;
        case "AND_REQ_UNKNOWN_3ARG": {
          const args = getArgList(cmd, cmdIdx, offset, ctx, cmdArgs);
          conditionalBuilder += `&&[3A] ${args} `;
        } continue cmdLoop;
        case "OR_REQ_UNKNOWN_3ARG": {
          const args = getArgList(cmd, cmdIdx, offset, ctx, cmdArgs);
          conditionalBuilder += `||[3A] ${args} `;
        } continue cmdLoop;
      }

      switch (cmdName) {
        case "IfComparison":
        case "IfReqEquals":
        case "IfReq": {
          if (conditionalBuilder.length) {
            out += cmdString.substring(2) + conditionalBuilder.substring(0, conditionalBuilder.length - 1) + ") {\n";
            conditionalBuilder = "";
          }
          indent++;
          const req = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          conditionalBuilder += `if (${req} `
        } continue cmdLoop;

        case "ElseIfComparison":
        case "ElseIfReqEquals":
        case "ElseIfReq": {
          const req = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          conditionalBuilder += `} elif (${req} `
        } continue cmdLoop;

        case "AndComparison":
        case "AndReqEquals":
        case "AndReq": {
          const req = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          conditionalBuilder += `&& ${req} `
        } continue cmdLoop;

        case "OrComparison":
        case "OrReqEquals":
        case "OrReq": {
          const req = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          conditionalBuilder += `|| ${req} `
        } continue cmdLoop;

        case "WhileReqEquals":
        case "WhileComparison":
        case "WhileReq": {
          indent++;
          const req = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          conditionalBuilder += `while (${req} `
        } continue cmdLoop;

        case "WhileAndReqEquals":
        case "WhileAndComparison":  
        case "WhileAndReq": {
          const req = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          conditionalBuilder += `&& ${req} `
        } continue cmdLoop;

        case "WhileOrReqEquals":
        case "WhileOrComparison":  
        case "WhileOrReq": {
          const req = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          conditionalBuilder += `|| ${req} `
        } continue cmdLoop;

        case "Else": {
          cmdString = cmdString.substring(2);
          out += cmdString + "} else {\n";
        } continue cmdLoop;
        case "EndIf":
        case "ExecuteLoop": {
          cmdString = cmdString.substring(2); 
          out += cmdString + "}\n"
          indent --;
        } continue cmdLoop;
        case "SetLoop": {
          cmdString += cmdName;
          const iterations = makeArgument(cmd.arguments, 0, cmdIdx, offset, ctx).out;
          out += cmdString + `(${iterations}) {\n`;
          indent++;
        } continue cmdLoop;

        default: {
          if (conditionalBuilder.length) {
            out += cmdString.substring(2) + conditionalBuilder.substring(0, conditionalBuilder.length - 1) + ") {\n";
            conditionalBuilder = "";
          }
          cmdString += cmdName;
          if (cmd.modifier) cmdString += ":" + padHex(cmd.modifier, 2);
        }
      }

      switch (cmdName) {
        case "Switch": 
        case "SWITCH_3ARG":
        case "SWITCH_6ARG": {
          indent += 2;
        } break;
        case "EndSwitch": {
          cmdString = cmdString.substring(4); 
          indent -= 2;
        } break;
        case "Case":
        case "DefaultCase": {
          cmdString = cmdString.substring(2);
        } break;

        case "Goto":
        case "SubRoutine": {
          const isExternalSubroutine = !!externalSubroutines[cmd.argOffset + 0x4];
          const target = externalSubroutines[cmd.argOffset + 0x4] ?? dataOffsets[cmd.arguments[0].content] ?? unnamedOffsets[cmd.arguments[0].content];
          if (target) {
            cmdString += `(${target})\n`;
            if (isExternalSubroutine && cmd.arguments[0].content != 0xFFFFFFFF) {
              externalSubroutines[cmd.arguments[0].content] = target + ` [${ctx.name}]`;
            }
          } else {
            hiddenSubRoutines.push(cmd.arguments[0].content);
            cmdString += `(hidden_subroutine_0x${cmd.arguments[0].content.toString(16).toUpperCase()})\n`;
          }
          out += cmdString;
        } continue cmdLoop;
        case "ConcurrentInfiniteLoop": {
          const isExternalSubroutine = !!externalSubroutines[cmd.argOffset + 0x8];
          const target = externalSubroutines[cmd.argOffset + 0x8] ?? dataOffsets[cmd.arguments[1].content] ?? unnamedOffsets[cmd.arguments[1].content];
          if (target) {
            cmdString += `(I(${cmd.arguments[0].content}), ${target})\n`;
            if (isExternalSubroutine && cmd.arguments[0].content != 0xFFFFFFFF) {
              externalSubroutines[cmd.arguments[0].content] = target;
            }
          } else {
            hiddenSubRoutines.push(cmd.arguments[1].content);
            cmdString += `(I(${cmd.arguments[0].content}), hidden_subroutine_0x${cmd.arguments[1].content.toString(16).toUpperCase()})\n`;
          }
          out += cmdString;
        } continue cmdLoop;
      }
      
    }
    else {
      if (conditionalBuilder.length) {
        out += cmdString.substring(2) + conditionalBuilder.substring(0, conditionalBuilder.length - 1) + ") {\n";
        conditionalBuilder = "";
      }
      cmdString += `(undef: ${KnownCommands.module[cmd.namespace] || ""}) ${padHex(cmd.namespace, 2)}_`;
      cmdString += padHex(cmd.code, 2) + "_";
      cmdString += padHex(cmd.numArguments, 2) + "_";
      cmdString += padHex(cmd.modifier, 2);
    }
    cmdString += "(";
    // console.log(cmd.namespace, cmd.code, cmd.numArguments, cmd.modifier, cmd.argOffset);
    if (cmd.numArguments > 0) {
      // console.log(cmd.namespace, cmd.code, cmd.numArguments, cmd.modifier, cmd.argOffset);
      const argEntries = Array.from(cmd.arguments.entries());
      for (let i = 0, argIdx = 0; i < argEntries.length && argIdx < argEntries.length; i++) {
        const createdArgument = makeArgument(cmd.arguments, argIdx, cmdIdx, offset, ctx, cmdArgs[argIdx]);
        cmdString += createdArgument.out;
        argIdx += createdArgument.consumed;
        
        if (argIdx < cmd.arguments.length) {
          cmdString += ", ";
        }
      }
    }
    cmdString += ")";
    cmdString += "\n";
    out += cmdString;
  }
  return out;
};

const makeSubRoutine = (offset: number, data: ArrayBuffer, hidden: boolean, stream: Movedef) => {
  let out = "";
  let target = dataOffsets[offset] ?? unnamedOffsets[offset];
  if (target) { out += `[${target}]\n`; }
  let ctx = { name: `${hidden ? "hidden_" : ""}subroutine_0x${offset.toString(16).toUpperCase()}` };
  out += `${ctx.name} {\n`;
  // console.log(newStream.pos, newStream._byteOffset);
  // newStream._byteOffset = 0x20;
  // newStream._dataView.byteOffset = 0x20;
  stream.body._io.seek(offset);
  out += parseAnimCmd(new AnimCmd(stream.body._io, null, null), offset, ctx);
  out += "}";
  return out;
};

const makeAnimCmdFile = (section: Movedef.SakuraiBody.Section): string => { 
  const ctx = { name: section.name.substring(section.name.indexOf("_") + 1) };

  let out = `// @ 0x${section.dataPos.toString(16).toUpperCase()}\n`; 
  out += `${ctx.name} {\n`;
  out += parseAnimCmd(section.data as AnimCmd, section.dataPos, ctx);
  out += "}";
  return out;
};

const makeAnimCmdFileFromPtr = (name: string, acmd: Movedef.Ptr): string => { 
  const ctx = { name: name };

  let out = `// @ 0x${acmd.offset.toString(16).toUpperCase()}\n`; 
  out += `${ctx.name} {\n`;
  out += parseAnimCmd(acmd.data.data as AnimCmd, acmd.offset, ctx);
  out += "}";
  return out;
};

const makeActionACFile = (index: number, entry: Movedef.Ptr, exit?: Movedef.Ptr): string => { 
  let out = "";
  let statusName = statusNames[index];
  if (statusName) { out += `// ${statusName}\n`; }
  else statusName = '';
  
  let target = dataOffsets[entry.offset];
  if (target) { out += `[${target}]\n`; }
  let ActionID = `Action 0x${index.toString(16).toUpperCase()}`
  let ctx = { name: `${ActionID} (${statusName})${exit ? ": ENTRY" : "" }` };

  out += `${ActionID}${exit ? ": ENTRY" : "" } {\n`;
  out += (entry.offset !== 0) ? parseAnimCmd(entry.data.data as AnimCmd, entry.offset, ctx) : "";
  out += "}\n\n";

  if (exit) {
    target = dataOffsets[exit.offset];
    if (target) { out += `[${target}]\n`; }
    ctx.name = `${ActionID} (${statusName}) : EXIT`
    out += `${ActionID} : EXIT {\n`;
    out += (exit.offset !== 0) ? parseAnimCmd(exit.data.data as AnimCmd, exit.offset, ctx) : "";
    out += "}";
  }
  return out;
};

const makeACEntry = (title: string, ACMDPtr: PtrOffsetPair, ctx: CmdContext) => {
  let out = "";

  let target = dataOffsets[ACMDPtr.ptr.offset];
  if (target) out += `[${target}]\n`;
  

  out += title + " {\n";
  if (externalSubroutines[ACMDPtr.offset]) {
    out += "  " + externalSubroutines[ACMDPtr.offset] + '\n';
  } else if (ACMDPtr.ptr.offset !== 0) {
    // console.log(ACMDPtr.ptr.offset);
    // console.log("about to parse animcmd");
    out += parseAnimCmd(ACMDPtr.ptr.data.data as AnimCmd, ACMDPtr.ptr.offset, ctx);
  }
  out += "}\n\n";
  return out;
}

const makeEnemyActionACFile = (index: number, main: PtrOffsetPair, exit?: PtrOffsetPair, init?: PtrOffsetPair) => {
  let out = "";
  let ActionID = `Action 0x${index.toString(16).toUpperCase()}`
  
  let ctx = { name: `${ActionID}: MAIN` };
  out += makeACEntry(ctx.name, main, ctx);
  ctx.name = `${ActionID}: EXIT`;
  out += makeACEntry(ctx.name, exit, ctx);
  ctx.name = `${ActionID}: INIT`;
  out += makeACEntry(ctx.name, init, ctx);

  return out;
}

const makeEnemySubactionACFile = (index: number, motionData: MoveDef.SoMotionData, main: PtrOffsetPair, main_exit: PtrOffsetPair, main_init: PtrOffsetPair
  , gfx: PtrOffsetPair, gfx_exit: PtrOffsetPair, gfx_init: PtrOffsetPair
  , sfx: PtrOffsetPair, sfx_exit: PtrOffsetPair, sfx_init: PtrOffsetPair
) => {
  let out = "";
  
  if (motionData) {
    if (!(motionData.motionName.data.data as string).match(/^[a-zA-Z0-9_]+$/g)) {
      out += `[BAD NAME] `;
    }
    else {
      out += `[${motionData.motionName.data.data}] `;
    }
    out += "(flags) {\n  " + AnimationFlags(motionData.flags).join(',\n  ') + "\n}\n\n";
  }

  let subactionPrefix = `Subaction 0x${index.toString(16).toUpperCase()}`;

  let ctx = { name: `${subactionPrefix}: MAIN` };
  out += makeACEntry(ctx.name, main, ctx);
  ctx.name = `${subactionPrefix}: MAIN EXIT`;
  out += makeACEntry(ctx.name, main_exit, ctx);
  ctx.name = `${subactionPrefix}: MAIN INIT`;
  out += makeACEntry(ctx.name, main_init, ctx);
  
  ctx.name = `${subactionPrefix}: GFX`;
  out += makeACEntry(ctx.name, gfx, ctx);
  ctx.name = `${subactionPrefix}: GFX EXIT`;
  out += makeACEntry(ctx.name, gfx_exit, ctx);
  ctx.name = `${subactionPrefix}: GFX INIT`;
  out += makeACEntry(ctx.name, gfx_init, ctx);
  
  ctx.name = `${subactionPrefix}: SFX`;
  out += makeACEntry(ctx.name, sfx, ctx);
  ctx.name = `${subactionPrefix}: SFX EXIT`;
  out += makeACEntry(ctx.name, sfx_exit, ctx);
  ctx.name = `${subactionPrefix}: SFX INIT`;
  out += makeACEntry(ctx.name, sfx_init, ctx);

  return out;
}

const makeFighterSubactionACFile = (index: number, motionData?: MoveDef.SoMotionData, main?: PtrOffsetPair, gfx?: PtrOffsetPair, sound?: PtrOffsetPair, other?: PtrOffsetPair): string => { 
  let out = "";
  let target;
  
  if (motionData) {
    if (!(motionData.motionName.data.data as string).match(/^[a-zA-Z0-9_]+$/g)) {
      out += `[BAD NAME] `;
    }
    else {
      out += `[${motionData.motionName.data.data}] `;
    }
    out += "(flags) {\n  " + AnimationFlags(motionData.flags).join(',\n  ') + "\n}\n\n";
  }

  let subactionPrefix = `Subaction 0x${index.toString(16).toUpperCase()}`;

  let ctx = { name: `${subactionPrefix}: MAIN` };
  out += makeACEntry(ctx.name, main, ctx);
  ctx.name = `${subactionPrefix}: GFX`;
  out += makeACEntry(ctx.name, gfx, ctx);
  ctx.name = `${subactionPrefix}: SOUND`;
  out += makeACEntry(ctx.name, sound, ctx);
  // console.log("made sound");
  ctx.name = `${subactionPrefix}: OTHER`;
  out += makeACEntry(ctx.name, other, ctx);

  return out;
};

const makeItemSubactionACFile = (index: number, motionData?: MoveDef.SoMotionData, game?: Movedef.Ptr, gfx?: Movedef.Ptr, sound?: Movedef.Ptr): string => { 
  let out = "";
  let target;
  
  if (motionData) {
    out += `[${motionData.motionName.data.data}] `;
    out += "(flags) {\n  " + AnimationFlags(motionData.flags).join(',\n  ') + "\n}\n\n";
  }

  if (game) {
    let ctx = { name: `Subaction 0x${index.toString(16).toUpperCase()} : GAME` };
    out += `${ctx.name} {\n`;
    out += (game.offset !== 0) ? parseAnimCmd(game.data.data as AnimCmd, game.offset, ctx) : "";
    out += "}\n\n";
  }

  if (gfx) {
    let ctx = { name: `Subaction 0x${index.toString(16).toUpperCase()} : GFX` };    
    out += `${ctx.name} {\n`;
    out += (gfx.offset !== 0) ? parseAnimCmd(gfx.data.data as AnimCmd, gfx.offset, ctx) : "";
    out += "}\n\n";
  }

  if (sound) {
    let ctx = { name: `Subaction 0x${index.toString(16).toUpperCase()} : SOUND` };    
    out += `${ctx.name} {\n`;
    out += (sound.offset !== 0) ? parseAnimCmd(sound.data.data as AnimCmd, sound.offset, ctx) : "";
    out += "}\n\n";
  }

  return out;
};

const makeDataFile = (section: Movedef.SakuraiBody.Section): string => {
  const data = (section.data as Movedef.SakuraiBody.ArcFighterDataCommon);
  let out = `${section.name} {\n`;
  for (const [k, v] of Object.entries(data)) {
    if (!k.startsWith("_")) {
      // out += `  ${k}: ${k.startsWith("unk") ? '0x' + padHex(v, 8) : v}\n`;
      if (v instanceof Movedef.PtrPtrTable
        || v instanceof Movedef.PtrPtr
        || v instanceof Movedef.Ptr
      ) {
        out += `  ${k}: ${'0x' + padHex(v.offset, 8)}\n`;
      } else if (v instanceof Movedef.PtrTable) {
        out += `  ${k}: ${'0x' + padHex(v.entries[0].offset, 8)}\n`;
      } else {
        out += `  ${k}: ${'0x' + padHex(v, 8)}\n`;

      }
    }
  }
  out += "}";
  return out;
};

const mkdirIfNotExist = async (...path) => {
  const target = join(...path);
  try { await access(target); }
  catch { await mkdir(target, { recursive: true }); }
}

const targetFileName = (process.argv[2].endsWith(".moveset") ? process.argv[2].substring(0, process.argv[2].length - 8) : process.argv[2]);
if (targetFileName == undefined) {
  console.error("must specify moveset name!");
  process.exit(1);
}
let moveDefType: string = "";
const dest = (() => {
  let slice: string;
  if (targetFileName.includes("MoveDef_")) slice = targetFileName.substring(targetFileName.lastIndexOf("MoveDef_") + 8);
  else if (targetFileName.includes("/")) slice = targetFileName.substring(targetFileName.lastIndexOf("/") + 1);
  else slice = targetFileName;
  
  if (slice.startsWith("Fit")) {
    moveDefType = "fighter";
  } else if (slice.startsWith("Enm")) {
    moveDefType = "enemy";
  }
  
  if (slice.startsWith("Fit") || slice.startsWith("Itm") || slice.startsWith("Enm")) return "out_" + slice;
  else if (slice.startsWith("Fighter")) return "_out_Fighter";

  console.error("must be FitXXX, ItmXXX, or Fighter");
  process.exit(1);
})();

const main = async () => {
  console.log(`Processing ${targetFileName}...`);
  try { 
    await access(join(__dirname, `${targetFileName}.moveset`)); 
  }
  catch { 
    console.error(`moveset file does not exist for ${targetFileName}`);
    process.exit(1);
  }

  
  await mkdirIfNotExist(__dirname, dest, "Actions");
  await mkdirIfNotExist(__dirname, dest, "AnimCmdEntries");
  await mkdirIfNotExist(__dirname, dest, "HiddenSubRoutines");
  await mkdirIfNotExist(__dirname, dest, "RawData");
  await mkdirIfNotExist(__dirname, dest, "SubActions");
  await mkdirIfNotExist(__dirname, dest, "SubRoutines");
  
  const file = (await readFile(join(__dirname, `${targetFileName}.moveset`)));
  const content = file.buffer;
  const parsed = new Movedef(new KaitaiStream(content), undefined, undefined, moveDefType);
  console.log(moveDefType);

  for (const [idx, externalReference] of parsed.body.lookupEntries.externalSubroutines.entries()) {
    // console.log("ext:", externalReference.offset, externalReference.string);
    externalSubroutines[externalReference.offset] = "EXTERNAL: " + externalReference.string;
  }

  for (const [idx, section] of parsed.body.sections.entries()) {
    dataOffsets[section.dataPos] = section.name;
  }
  console.log(dataOffsets);

  for (const [idx, section] of parsed.body.sections.entries()) {
    if (section.name === "dataCommon") {
      const dataCommon = section.data as Movedef.SakuraiBody.ArcFighterDataCommon;
      for (let i = 0; i <= 0x111; i++) {
        if (!dataOffsets[dataCommon.entryActionsStart.ptrTable.entries[i].offset]) {
          unnamedOffsets[dataCommon.entryActionsStart.ptrTable.entries[i].offset] = `Action_0x${i.toString(16).toUpperCase()} : ENTRY`;
        }
        if (!dataOffsets[dataCommon.exitActionsStart.ptrTable.entries[i].offset]) {
          unnamedOffsets[dataCommon.exitActionsStart.ptrTable.entries[i].offset] = `Action_0x${i.toString(16).toUpperCase()} : EXIT`;
        }
      }
    } else if (section.name === "animParam") {
      const animParam = section.data as Movedef.SakuraiBody.ItAnimParam;
      for (let i = 0; i <= animParam.motionNum; i++) {
        if (!dataOffsets[animParam.motionAnimCmdGame.ptrTable.entries[i]?.offset]) {
          unnamedOffsets[animParam.motionAnimCmdGame.ptrTable.entries[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : GAME`;
        }
        if (!dataOffsets[animParam.motionAnimCmdSound.ptrTable.entries[i]?.offset]) {
          unnamedOffsets[animParam.motionAnimCmdSound.ptrTable.entries[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : SOUND`;
        }
        if (!dataOffsets[animParam.motionAnimCmdEffect.ptrTable.entries[i]?.offset]) {
          unnamedOffsets[animParam.motionAnimCmdEffect.ptrTable.entries[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : EFFECT`;
        }
      }
      for (let i = 0; i < animParam.statusNum; i++) {
        if (!dataOffsets[animParam.statusAnimCmd.ptrTable.entries[i]?.offset]) {
          unnamedOffsets[animParam.motionAnimCmdEffect.ptrTable.entries[i]?.offset] = `Action_0x${i.toString(16).toUpperCase()}`;
        }
      }
    } else if (section.name === "data" && moveDefType == "fighter") {
      const ftData = section.data as Movedef.SakuraiBody.ArcFighterData;
      for (let i = 0; i < ftData.actionCount; i++) {
        // console.log(ftData.entryActions.entries());
        if (!dataOffsets[ftData.entryActions[i].offset]) {
          unnamedOffsets[ftData.entryActions[i].offset] = `Action_0x${i.toString(16).toUpperCase()} : ENTRY`;
        }
        if (!dataOffsets[ftData.exitActions[i].offset]) {
          unnamedOffsets[ftData.exitActions[i].offset] = `Action_0x${i.toString(16).toUpperCase()} : EXIT`;
        }
      }
      for (let i = 0; i < ftData.subactionCount; i++) {
        if (!dataOffsets[ftData.subactionMain[i]?.offset]) {
          unnamedOffsets[ftData.subactionMain[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : MAIN`;
        }
        if (!dataOffsets[ftData.subactionGfx[i]?.offset]) {
          unnamedOffsets[ftData.subactionGfx[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : GFX`;
        }
        if (!dataOffsets[ftData.subactionSfx[i]?.offset]) {
          unnamedOffsets[ftData.subactionSfx[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : SFX`;
        }
        if (!dataOffsets[ftData.subactionOther[i]?.offset]) {
          unnamedOffsets[ftData.subactionOther[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : OTHER`;
        }
      }      
    } else if (section.name === "commonData") {
      const emDataCommon = section.data as Movedef.SakuraiBody.ArcEnemyDataCommon;
      for (let i = 0; i < emDataCommon.gfxEvents.length; i++) {
        unnamedOffsets[emDataCommon.gfxEvents[i].offset] = `GfxEvent_0x${i.toString(16).toUpperCase()}`
      }
    } else if (section.name === "data" && moveDefType == "enemy") {
      const emData = section.data as Movedef.SakuraiBody.ArcEnemyData;
      for (let i = 0; i < emData.actionCount; i++) {
        if (!dataOffsets[emData.action[i].offset]) {
          unnamedOffsets[emData.action[i].offset] = `Action_0x${i.toString(16).toUpperCase()} : MAIN`
        }
        if (!dataOffsets[emData.actionInit[i].offset]) {
          unnamedOffsets[emData.actionInit[i].offset] = `Action_0x${i.toString(16).toUpperCase()} : INIT`
        }
        if (!dataOffsets[emData.actionExit[i].offset]) {
          unnamedOffsets[emData.actionExit[i].offset] = `Action_0x${i.toString(16).toUpperCase()} : EXIT`
        }
      }
      for (let i = 0; i < emData.subactionCount; i++) {
        if (!dataOffsets[emData.subactionMain[i]?.offset]) {
          unnamedOffsets[emData.subactionMain[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : MAIN`;
        }
        if (!dataOffsets[emData.subactionMainInit[i]?.offset]) {
          unnamedOffsets[emData.subactionMainInit[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : MAIN INIT`;
        }
        if (!dataOffsets[emData.subactionMainExit[i]?.offset]) {
          unnamedOffsets[emData.subactionMainExit[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : MAIN EXIT`;
        }

        if (!dataOffsets[emData.subactionGfx[i]?.offset]) {
          unnamedOffsets[emData.subactionGfx[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : GFX`;
        }
        if (!dataOffsets[emData.subactionGfxInit[i]?.offset]) {
          unnamedOffsets[emData.subactionGfxInit[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : GFX INIT`;
        }
        if (!dataOffsets[emData.subactionGfxExit[i]?.offset]) {
          unnamedOffsets[emData.subactionGfxExit[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : GFX EXIT`;
        }

        if (!dataOffsets[emData.subactionSfx[i]?.offset]) {
          unnamedOffsets[emData.subactionSfx[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : SFX`;
        }
        if (!dataOffsets[emData.subactionSfxInit[i]?.offset]) {
          unnamedOffsets[emData.subactionSfxInit[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : SFX INIT`;
        }
        if (!dataOffsets[emData.subactionSfxExit[i]?.offset]) {
          unnamedOffsets[emData.subactionSfxExit[i]?.offset] = `Subaction_0x${i.toString(16).toUpperCase()} : SFX EXIT`;
        }
      }
    }
  }

  for (const [idx, section] of parsed.body.sections.entries()) {
    if (section.name === "dataCommon") {
      const dataCommon = section.data as Movedef.SakuraiBody.ArcFighterDataCommon;
      for (let i = 0; i <= 0x111; i++) {
        let statusName = statusNames[i];
        writeFile(join(__dirname, dest, "Actions", `${i}_${statusName ? `0x${i.toString(16).toUpperCase()}_${statusName}` : `Action_0x${i.toString(16).toUpperCase()}`}`), makeActionACFile(i, dataCommon.entryActionsStart.ptrTable.entries[i], dataCommon.exitActionsStart.ptrTable.entries[i]), "utf-8");
      }
    } else if (section.name === "animParam" ) {
      const animParam = section.data as Movedef.SakuraiBody.ItAnimParam;
      for (let i = 0; i < animParam.statusNum; i++) {
        writeFile(join(__dirname, dest, "Actions", `${i}_Action_0x${i.toString(16).toUpperCase()}`), makeActionACFile(i, animParam.statusAnimCmd.ptrTable.entries[i], undefined));
      }
      for (let i = 0; i < animParam.motionNum; i++) {
        let name = animParam.motionData[i].motionName.data.data as string;
        if (!name || name.length === 0 || !name.match(/^[a-zA-Z0-9_]+$/g)) {
          console.log("bad name: ", i, name);
          name = "Subaction"
        }
        writeFile(join(__dirname, dest, "SubActions", `${i}_${name}_0x${i.toString(16).toUpperCase()}`), makeItemSubactionACFile(i, animParam.motionData[i], animParam.motionAnimCmdGame.ptrTable.entries[i], animParam.motionAnimCmdEffect.ptrTable.entries[i], animParam.motionAnimCmdSound.ptrTable.entries[i]));
      }
    } else if (section.name === "data" && moveDefType == "fighter") {
      const ftData = section.data as Movedef.SakuraiBody.ArcFighterData;
      for (let i = 0; i < ftData.actionCount; i++) {
        let acID = i + 0x112;
        writeFile(join(__dirname, dest, "Actions", `${acID}_Action_0x${acID.toString(16).toUpperCase()}`), makeActionACFile(acID, ftData.entryActions[i], ftData.exitActions[i]), 'utf-8');
      }
      for (let i = 0; i < ftData.subactionCount; i++) {
        let name = ftData.subactionFlags[i].motionName.data.data as string;
        if (!name || name.length === 0 || !name.match(/^[a-zA-Z0-9_]+$/g)) {
          console.log("bad name: ", i, name);
          name = "Subaction";
        }
        if (ftData.subactionMain[i].offset === 0) {
          console.log(`subaction ${i} does not exist`)
          continue;
        }

        let subactionMain: PtrOffsetPair = { ptr: ftData.subactionMain[i], offset: ftData.subactionMainStart.offset + 4 * i };
        let subactionGfx: PtrOffsetPair = { ptr: ftData.subactionGfx[i], offset: ftData.subactionGfxStart.offset + 4 * i };
        let subactionSfx: PtrOffsetPair = { ptr: ftData.subactionSfx[i], offset: ftData.subactionSfxStart.offset + 4 * i };
        let subactionOther: PtrOffsetPair = { ptr: ftData.subactionOther[i], offset: ftData.subactionOtherStart.offset + 4 * i };

        // console.log("subaction", i);
        writeFile(join(__dirname, dest, "SubActions", `${i}_${name}_0x${i.toString(16).toUpperCase()}`), makeFighterSubactionACFile(i, ftData.subactionFlags[i], subactionMain, subactionGfx, subactionSfx, subactionOther), 'utf-8');
      }
    } else if (section.name === "commonData") {
      const emDataCommon = section.data as Movedef.SakuraiBody.ArcEnemyDataCommon;
      await mkdirIfNotExist(__dirname, dest, "GFXEvents");
      for (let i = 0; i < emDataCommon.gfxEvents.length; i++) {
        writeFile(join(__dirname, dest, "GFXEvents", `${i}_GFXEvent_0x${i.toString(16).toUpperCase()}`), makeAnimCmdFileFromPtr(`GFXEvent_0x${i.toString(16).toUpperCase()}`, emDataCommon.gfxEvents[i]), 'utf-8');
      }
    } else if (section.name === "data" && moveDefType == "enemy") {
      const emData = section.data as Movedef.SakuraiBody.ArcEnemyData;
      for (let i = 0; i < emData.actionCount; i++) {
        let action = { ptr: emData.action[i], offset: emData.actionStart.offset + 4 * i };
        let actionExit = { ptr: emData.actionExit[i], offset: emData.actionExitStart.offset + 4 * i };
        let actionInit = { ptr: emData.actionInit[i], offset: emData.actionInitStart.offset + 4 * i };

        writeFile(join(__dirname, dest, "Actions", `${i}_Action_0x${i.toString(16).toUpperCase()}`), makeEnemyActionACFile(i, action, actionExit, actionInit));
      }

      for (let i = 0; i < emData.subactionCount; i++) {
        let name = emData.subactionFlags[i].motionName.data.data as string;
        if (!name || name.length === 0 || !name.match(/^[a-zA-Z0-9_]+$/g)) {
          console.log("bad name: ", i, name);
          name = "Subaction";
        }

        let subactionMain: PtrOffsetPair = { ptr: emData.subactionMain[i], offset: emData.subactionMainStart.offset + 4 * i }
        let subactionMainExit: PtrOffsetPair = { ptr: emData.subactionMainExit[i], offset: emData.subactionMainExitStart.offset + 4 * i }
        let subactionMainInit: PtrOffsetPair = { ptr: emData.subactionMainInit[i], offset: emData.subactionMainInitStart.offset + 4 * i }
        let subactionGfx: PtrOffsetPair = { ptr: emData.subactionGfx[i], offset: emData.subactionGfxStart.offset + 4 * i }
        let subactionGfxExit: PtrOffsetPair = { ptr: emData.subactionGfxExit[i], offset: emData.subactionGfxExitStart.offset + 4 * i }
        let subactionGfxInit: PtrOffsetPair = { ptr: emData.subactionGfxInit[i], offset: emData.subactionGfxInitStart.offset + 4 * i }
        let subactionSfx: PtrOffsetPair = { ptr: emData.subactionSfx[i], offset: emData.subactionSfxStart.offset + 4 * i }
        let subactionSfxExit: PtrOffsetPair = { ptr: emData.subactionSfxExit[i], offset: emData.subactionSfxExitStart.offset + 4 * i }
        let subactionSfxInit: PtrOffsetPair = { ptr: emData.subactionSfxInit[i], offset: emData.subactionSfxInitStart.offset + 4 * i }

        writeFile(join(__dirname, dest, "SubActions", `${i}_${name}_0x${i.toString(16).toUpperCase()}`), makeEnemySubactionACFile(i, emData.subactionFlags[i], subactionMain, subactionMainExit, subactionMainInit, subactionGfx, subactionGfxExit, subactionGfxInit, subactionSfx, subactionSfxExit, subactionSfxInit));
      }
    }

    if (section.name.startsWith("effectAnimCmd_")) {
      writeFile(join(__dirname, dest, "AnimCmdEntries", `${idx}_${section.name}`), makeAnimCmdFile(section), "utf-8");
    } else if (section.name.startsWith("statusAnimCmdGroup_")) {
      writeFile(join(__dirname, dest, "AnimCmdEntries", `${idx}_${section.name}`), makeAnimCmdFile(section), "utf-8");
    } else if (section.name.startsWith("statusAnimCmdPre_")) {
      writeFile(join(__dirname, dest, "AnimCmdEntries", `${idx}_${section.name}`), makeAnimCmdFile(section), "utf-8");
    } else if (section.name.startsWith("statusAnimCmd_")) {
      writeFile(join(__dirname, dest, "AnimCmdEntries", `${idx}_${section.name}`), makeAnimCmdFile(section), "utf-8");
    } else if (section.name.startsWith("statusAnimCmdExit_")) {
      writeFile(join(__dirname, dest, "AnimCmdEntries", `${idx}_${section.name}`), makeAnimCmdFile(section), "utf-8");
    } else if (section.name.startsWith("gameAnimCmd_")) {
      writeFile(join(__dirname, dest, "AnimCmdEntries", `${idx}_${section.name}`), makeAnimCmdFile(section), "utf-8");
    } else {
      writeFile(join(__dirname, dest, "RawData", `${idx}_${section.name}`), makeDataFile(section), "utf-8");
    }
  }

  for (const [idx, section] of parsed.body.sections.entries()) {
    dataOffsets[section.dataPos] = section.name;
  }

  // const innerContent = file.slice(0x20);
  // console.log(parsed._io);

  // console.log(dataOffsets);
  // console.log(unnamedOffsets);

  while (hiddenSubRoutines.length > 0) {
    const toProcess = [];
    while (hiddenSubRoutines.length > 0) {
      const offs = hiddenSubRoutines.pop(); 
      toProcess.push(offs);
      dataOffsets[offs] = `hsr_${offs.toString(16).toUpperCase()}`;
    }

    for (const offs of toProcess) {
      // console.log(offs);
      // console.log(content.slice(offs));
      try { 
        writeFile(join(__dirname, dest, "HiddenSubRoutines", `hsr_${offs}_0x${offs.toString(16).toUpperCase()}`), makeSubRoutine(offs, content, true, parsed), "utf-8");
      } catch {
        console.error("bad offset", offs);
      }
      // break;
    }
  }

  variableTracker.sort((wvA, wvB) => {
    return (wvA.variable.type - wvB.variable.type) 
    || (wvA.variable.dataType - wvB.variable.dataType)
    || (wvA.variable.index - wvB.variable.index)
    || ((wvA.sectionName && wvB.sectionName) ? wvA.sectionName.localeCompare(wvB.sectionName) : false)
    || (wvA.command - wvB.command)
    || (wvA.argument - wvB.argument)
  });
  const uniqVarArray = Array.from(new Set(variableTracker.map((workVariable, idx) => {
    return `${workVariable.variable.varName()} ${workVariable.variable.name ? '("' + workVariable.variable.name + '") ' : ""}in ${workVariable.sectionName} @ ${workVariable.command} : ${workVariable.argument}`
  })));

  let varFileOut = '';
  let prevStart = '_';
  for (const str of uniqVarArray) {
    // if (!str.startsWith(prevStart)) {
    //   if (prevStart.length != 1) varFileOut += '\n\n';
    //   prevStart = str.substring(0, str.indexOf(' in ') + 3);
    //   varFileOut += prevStart + '\n';
    // }
    // varFileOut += '|- ' + str.substring(prevStart.length + 1) + '\n';

    if (!str.startsWith(prevStart)) {
      if (prevStart.length != 1) varFileOut += '\n';
      prevStart = str.substring(0, str.indexOf('in'))
    }
    varFileOut += str + '\n';
  }

  await writeFile(join(__dirname, dest, `variables.log`), varFileOut, "utf-8");
  // console.log(parsed.body._io);
};

main();

// items
// ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmAssistParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBadgeParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBananaParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBarrelParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBeamSwordParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBillParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBombheiParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBoxParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmBumperParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmCapsuleParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmCarrierBoxParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmCBoxParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmCdParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmChewingParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmClackerParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmClackerShotParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmCoinParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmCurryParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmCurryShotParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmDekuParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmDiddyPeanutsParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmDoseisanParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmDragoonParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmDragoonSetParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmDragoonSightParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmFigureParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmFireFlowerParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmFireFlowerShotParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmFreezerParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmGoldenHammerParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmGreenShellParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmHammerHeadParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmHammerParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmHarisenParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmHeartParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmHomeRunBatParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmKusudamaParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmLinkBombParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmManaphyHeartParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmMaximTomatoParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmMetalBlockParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmMushDParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmMushroomParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmPasaranParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmPeachDaikonParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmPitfallParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmPokeBallParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmPowderBoxParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmRayGunParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmRayGunShotParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmRipStickFlowerParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmRipStickParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmRipStickShotParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmRobotGyroParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSandbagHrParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSandbagParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmScrewParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSealParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSeedParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSensorBombParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSlowParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSmartBombParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSmashBallParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSmokeScreenParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSnakeGrenadeParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSoccerBallParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSpringParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmStarRodParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmStarRodShotParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSuperScopeParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSuperScopeShotParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSuperStarParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmSZeroSuitArmorParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmTabemonoParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmTeamHealingParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmThunderParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmToonLinkBombParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmUniraParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmUsagiHatParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmWarioBikeAParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmWarioBikeBParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmWarioBikeCParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmWarioBikeDParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmWarioBikeEParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmWarioBikeParam.moveset 
// && ts-node generateFiles.ts ./_item_movesets/MoveDef_ItmWarpstarParam.moveset

// spawned items
// ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmAchamoParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmAndrossParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmAndrossShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmAroarosParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmBarbaraParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmCerebiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmChicoritaParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmChicoritashotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmCustomroboBombParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmCustomroboGunParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmCustomroboParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmCyborgParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmDeoxysParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmDevilParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmEnteiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmExcitebikeParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmFigureParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmFireParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmGokulinParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmGonbeParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmGorohParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmGroudonParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmHammerbrosHammerParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmHammerbrosParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmHeririnParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmHitodemanParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmHitodemanShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmHououParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmHououShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmJeffParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmJeffPencilBulletParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmJeffPencilRocketParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmJirachiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmJoeParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmJoeShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmJugemParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmKabigonParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmKatanaAnaParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmKatanaParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmKireihanaParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmKururiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmKyogreParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmKyogreshotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmLatiasLatiosParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmLinkBombParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmLinParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmLittlemacParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmLugiaParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmLugiaShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmManaphyHeartParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmManaphyParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmManyulaParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmMarumineParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmMetagrossParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmMetroidParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmMewParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmNintendogsHiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmNintendogsParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmNyarthParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmNyarthShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmPochamaParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmResetsanParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmRobinParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmRobinShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSakiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSakiShot2Param.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSakiShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmShadowParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSirnightParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSoldierParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSoldierShotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSonansParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmStafyParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmSuicuneParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmTankParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmTankshotParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmTeamHealingParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmThunderParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmTingleParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmTogepyParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmTogezoParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmTosakintoParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmUsohachiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmWaluigiParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmWrightBuilParam.moveset
// && ts-node generateFiles.ts ./_spawned_item_movesets/MoveDef_ItmWrightParam.moveset

// SSE Enemies
// generateFiles.ts ./_enemy_movesets/MoveDef_EnmArman.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmAroaros.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmBitan.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmBombhead.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmBoobas.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmBotron.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmBucyulus.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmCataguard.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmCommon.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmCymal.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmDeathpod.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmDekakuribo.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmFaulong.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmFlows.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmGalice.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmGalthunder.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmGhamgha.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmGhamghabase.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmGyraan.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmHammerbros.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmJdus.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmJyakeel.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmKiller.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmKokkon.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmKuribo.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmMite.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmNgagog.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPacci.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPatapata.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPopperam.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPrim.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPrimBig.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPrimBoomerang.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPrimFire.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPrimMetal.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPrimSuperscope.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmPrimSword.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmRoada.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmRobobeam.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmRobodistance.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmRobohoming.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmRobopunch.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmShelly.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmSiralamos.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmSpar.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmTautau.moveset
// && ts-node generateFiles.ts ./_enemy_movesets/MoveDef_EnmTeckin.moveset

// fighters (VANILLA)
// ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitCaptain.moveset 
// >>>>> NEEDS MORE RESEARCH && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitDedede.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitDiddy.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitDonkey.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitFalco.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitFox.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitGameWatch.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitGanon.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitGKoopa.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitIke.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitLucario.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitLucas.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitLuigi.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitMario.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitMarth.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitMetaknight.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitNess.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPeach.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPikachu.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPikmin.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPit.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPokeFushigisou.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPokeLizardon.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPokeTrainer.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPokeZenigame.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPopo.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitPurin.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitRobot.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitSamus.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitSheik.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitSnake.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitSonic.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitSZerosuit.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitToonLink.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitWario.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitWarioMan.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitWolf.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitYoshi.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitZakoBall.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitZakoBoy.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitZakoChild.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitZakoGirl.moveset 
// && ts-node generateFiles.ts ./_fighter_movesets/vanilla/MoveDef_FitZelda.moveset

// BOSSES
// ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmBosspackun.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmCrazyhand.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmDuon.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmFalconflyer.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmGalleom.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmMasterhand.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmMetaridley.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmPorky.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmRayquaza.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmRidley.moveset 
// && ts-node generateFiles.ts ./_boss_movesets/MoveDef_EnmTaboo.moveset