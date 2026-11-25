import { AnimCmd } from "./animCmd"
import ftValueEnum from "./ftValueEnum";
import { VarType, WorkVariable, padHex } from "./util"; 

export const AnimationFlag = (flag: number) => {
  let values = ((flag & 0x000F0000) >> (4 * 4)).toString(2).padStart(8, '0').split('').reverse(); 
  let names = ['No Out Transition', 'Loop', 'Moves Character', 'Ignore Transition', 'Ignore Rotation', 'Ignore Scale', 'Transition Out From Start', 'Unknown 7'];
  let out = [];
  for (const [i, name] of names.entries()) {
    out.push(`${name}: ${values[i]}`);
  }
  return out;
}

export const InterruptGroup = (argument: AnimCmd.Argument) => {
  return (({
    0: "ALL?",
    1:  "GROUND_SPECIAL",
    2:  "GROUND_ITEM",
    3:  "GROUND_CATCH",
    4:  "GROUND_ATTACK",
    5:  "GROUND_ESCAPE",
    6:  "GROUND_GUARD",
    7:  "GROUND_JUMP",
    8:  "GROUND",
    9:  "AIR_LANDING",
    10: "AIR_CLIFF",
    11: "AIR_SPECIAL",
    12: "AIR_ITEM_THROW",
    13: "AIR_LASSO",
    14: "AIR_ESCAPE",
    15: "AIR_ATTACK",
    16: "AIR_TREAD_JUMP",
    17: "AIR_WALL_JUMP",
    18: "AIR_JUMP_AERIAL",
    19: "UNK_JUMP_TRANSITION",
  })[argument.content] ?? `${argument.content}`);
}

export const HitboxGroup = (argument: AnimCmd.Argument) => {
  return (({
    0: "Attack",
    1: "Hurtbox",
    2: "Shield",
    3: "Catch",
    5: "Search",
  })[argument.content] ?? `${argument.content}`);
}

export const ICVariable = (v: WorkVariable) => {
  if (v.type !== VarType.IC) return;
  let out = (ftValueEnum[v.index] ?? undefined)
  if (out) return out;
  
  return (({
    0x5A8C: "JabType",
    0x5A8D: "Jab",
    0x5A8E: "RapidJab",
    0x5A8F: "Ftilt",
    0x5A90: "FSmash",
    0x5A91: "Multijump",
    0x5A92: "Glide",
    0x5A93: "Crawl",
    0x5A94: "DA_into_Crouch",
    0x5A95: "WallJump",
    0x5A96: "WallCling",
    0x5A97: "ZAir",
    0x5A98: "ThrownType",
    0x5A99: "CaptureSize",
  })[v.index] ?? undefined);
}

export const Split = (argument: AnimCmd.Argument) => {
  return `Sp(${(argument.content & 0xFFFF0000) >> 16}, ${argument.content & 0x0000FFFF})`;
}

export interface IRequirementFullMetadata {
  name: string;
  consumed: number;
  args: {
    [key: number]: (argument: AnimCmd.Argument) => string;
  }
}
export interface IRequirementMetadata {
  [key: number]: string | IRequirementFullMetadata
}
export interface IRequirementOut {
  out: string;
  consumed: number;
  knownArgs: { 
    [key: number]: (argument: AnimCmd.Argument) => string; 
  }
}

export const Comparison = (argument: AnimCmd.Argument) => {
  return ({
    0: "<",
    1: "<=",
    2: "==",
    3: "!=",
    4: ">=",
    5: ">",
  })[argument.content] ?? `${argument.content}`;
}

export const TrueFalse = (argument: AnimCmd.Argument) => {
  return ({
    0: "False",
    1: "True"
  })[argument.content] ?? `${argument.content}`;
}

export const ButtonInput = (argument: AnimCmd.Argument) => {
  return ({
    0: "Attack",
    1: "Special",
    2: "Jump",
    3: "Shield",
    4: "Shield",
    5: "NONE",
    6: "UTaunt",
    7: "DTaunt",
    8: "STaunt",
    9: "DLeft",
    0xA: "DRight",
    0xB: "Attack|Jump|STaunt",
    0xC: "Attack|Jump|DUp|DRight",
    0xD: "Attack|Jump|DUp|DRight|DLeft",
    0xE: "Attack+Special",
    0xF: "CStick",
    0x10: "RETURN TRUE"
    // 0x11:
    // 0x12:
  })[argument.content] ?? `${argument.content}`;
}

export const Requirement = (argument: AnimCmd.Argument): IRequirementOut => {
  const isNot = argument.content & 0x80000000;
  const value = isNot ? (argument.content - 0x80000000) : argument.content; 
  let consumed = 0;

  let out = "";
  if (isNot) out += "NOT ";
  const data = (({
    0x0: {
      name: "Character Exists",
      consumed: 1,
      knownArgs: {

      }
    },
    0x1: "Animation End",
    0x2: "Animation has looped?",
    0x3: "On Ground",
    0x4: "In Air",
    0x5: "Holding a Ledge",
    0x6: "On a Passable Floor",
    0x7: {
      name: "Compare",
      consumed: 3,
      knownArgs: {
        1: Comparison
      }
    },
    0x8: {
      name: "Bit is Set",
      consumed: 1
    },
    0x9: "Facing Right",
    0xA: "Facing Left",
    0xB: "Hitbox Connects", // soCollisionAttackModuleImpl::isInflict
    0xC: {
      name: "Touching a Floor, Wall, or Ceiling",
      consumed: 1,
      knownArgs: {
        // 0: CollisionKind
      }
    },
    0xD: {
      name: "Is Throwing Someone",
      consumed: 1,
      knownArgs: {
        // 0: ThrowingTargetType
      }
    },
    0xE: {
      name: "0xE",
      consumed: 3,
      knownArgs: {}
    },
    0xF: "Button Tap?",
    // 0x10: "10",
    // 0x11: "11",
    // 0x12: "12",
    // 0x13: "13",
    0x14: "Is in Hitlag",
    0x15: "Article Exists",
    0x16: "Is Overstepping an Edge",
    0x17: "Distance from Floor",
    // 0x18: "18",
    // 0x19: "19",
    // 0x1A: "1A",
    0x1B: "Change in Air/Ground State",
    0x1C: "Article Available",
    0x1D: "Current Triggered Status ID",
    // 0x1E: "1E",
    0x1F: "Holding Item",
    0x20: {
      name: "Holding Item of Type",
      consumed: 1,
      knownArgs: {
        // 0: ItemType
      }
    },
    0x21: "Light Item is in Grabbing Range",
    0x22: "Heavy Item is in Grabbing Range",
    0x23: {
      name: "Item of Type is in Grabbing Range",
      consumed: 1,
      knownArgs: {
        // 0: ItemType
      }
    },
    0x24: "Turning with Item",
    // 0x25: "25",
    // 0x26: "26",
    // 0x27: "27",
    // 0x28: "28",
    // 0x29: "29",
    0x2A: "Is in Water",
    0x2B: "Roll A Die",
    0x2C: "Subaction Exists",
    // 0x2D: "2D",
    0x2E: "Button Mashable Status Expired",
    0x2F: "Is Not in Damaging Magnifier",
    0x30: {
      name: "Button Press",
      consumed: 1,
      knownArgs: {
        0: ButtonInput
      }
    },
    0x31: {
      name: "Button Release",
      consumed: 1,
      knownArgs: {
        0: ButtonInput
      }
    },
    0x32: {
      name: "Button Pressed",
      consumed: 1,
      knownArgs: {
        0: ButtonInput
      }
    },
    0x33: {
      name: "Button Not Pressed",
      consumed: 1,
      knownArgs: {
        0: ButtonInput
      }
    },
    0x34: "Stick Direction Pressed",
    0x35: "Stick Direction Not Pressed",
    // 0x36: "36",
    0x37: "Is Being Thrown by Someone 1",
    0x38: "Is Being Thrown by Someone 2",
    0x39: "Hasn't Tethered 3 Times",
    0x3A: "Has Passed Over an Edge Forward",
    0x3B: "Has Passed Over an Edge Backward",
    0x3C: "Is Holding Someone in a Grab",
    0x3D: "Hitbox has Connected", // soCollisionAttackModuleImpl::isInflictStatus
    // 0x3E: "3E",
    // 0x3F: "3F",
    // 0x40: "40",
    // 0x41: "41",
    // 0x42: "42",
    // 0x43: "43",
    // 0x44: "44",
    // 0x45: "45",
    // 0x46: "46",
    0x47: "Pick up an Item",
    // 0x48: "48",
    // 0x49: "49",
    // 0x4A: "4A",
    // 0x4B: "4B",
    0x4C: "Has Been Hit by Cape Effect",
    // 0x4D: "4D",
    // 0x4E: "4E",
    // 0x4F: "4F",
    // 0x50: "50",
    // 0x51: "51",
    // 0x52: "52",
    // 0x53: "53",
    // 0x54: "54",
    // 0x55: "55",
    // 0x56: "56",
    // 0x57: "57",
    // 0x58: "58",
    // 0x59: "59",
    // 0x5A: "5A",
    // 0x5B: "5B",
    // 0x5C: "5C",
    // 0x5D: "5D",
    // 0x5E: "5E",
    // 0x5F: "5F",
    // 0x60: "60",
    // 0x61: "61",
    // 0x62: "62",
    // 0x63: "63",
    // 0x64: "64",
    // 0x65: "65",
    // 0x66: "66",
    // 0x67: "67",
    // 0x68: "68",
    // 0x69: "69",
    // 0x6A: "6A",
    // 0x6B: "6B",
    // 0x6C: "6C",
    // 0x6D: "6D",
    // 0x6E: "6E",
    // 0x6F: "6F",
    // 0x70: "70",
    // 0x71: "71",
    // 0x72: "72",
    // 0x73: "73",
    // 0x74: "74",
    // 0x75: "75",
    // 0x76: "76",
    // 0x77: "77",
    // 0x78: "78",
    // 0x79: "79",
    // 0x7A: "7A",
    // 0x7B: "7B",
    // 0x7C: "7C",
    // 0x7D: "7D",
    // 0x7E: "7E",
    // 0x7F: "7F",
    // 0x270F: "270F",
    // 0x2710: "2710",
    0x2711: "In walljump situation",
    0x2712: "In wallcling situation",
    0x2713: "Is within footstool range",
    0x2714: {
      name: "2714",
      consumed: 1
    },
    // 0x2715: "2715",
    0x2716: "Is falling+hit down",
    0x2717: "Has Smash Ball",
    // 0x2718: "2718",
    0x2719: "Can Pick Up Another Item",
    0x271A: "Successfully tethered ledge",
    // 0x271B: "271B",
    // 0x271C: "271C",
    0x271D: {
      name: "F-Smash Shortcut",
      consumed: 1,
      knownArgs: {
        // 0: No clue
      }
    },
    // 0x271E: "271E",
    // 0x271F: "271F",
    // 0x2720: "2720",
    // 0x2721: "2721",
    // 0x2722: "2722",
    // 0x2723: "2723",
    0x2724: "Fighter Loaded",
    0x2725: "Tap Jump On & C-Stick not Held",
  })[value] ?? `0x${padHex(value, 2)}`);

  let knownArgs = {};
  if (typeof data === "string") {
    out += data
  } else {
    consumed += data.consumed;
    out += data.name;
    Object.assign(knownArgs, data.knownArgs);
  }

  return {
    out,
    consumed,
    knownArgs
  };
}