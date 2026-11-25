#pragma once

#include "CircularBuffer.h"

// things needed for this file:
// the Absolute value function ("FAbs")
// the fighter "Status" (actions) enum

namespace CPUMarkov {
    // number of actions to be tracked
    #define MARKOV_TRACK_COUNT 100

    // the name for each value
    enum class ActionCategory : int {
        NONE = 0,
        ATTACK,
        GRAB,
        SHIELD,
        HITSTUN,
        AIR,
        GROUND,
        SWIM,
        DASH,
        INACTIONABLE,
        LENGTH
    };
    
    class MarkovInput {
    public: // MarkovInput
        float tolerance;
        float weight;

        MarkovInput(float tol, float wt): tolerance(tol), weight(wt) {} 
    };
    
    class MarkovEntry {
    public: // MarkovEntry
        int timeDiff = -1;
        float xDist = -1;
        float yDistFromFloor = -1;
        float xPos = -1;
        float xDistFromLedge = -1;
        ActionCategory category = ActionCategory::NONE;

        MarkovEntry(int timeDiff, float xDist, float yDistFromFloor, float xPos, float xDistFromLedge, ActionCategory cat)
            :  timeDiff(timeDiff) xDist(xDist) yDistFromFloor(yDistFromFloor) xPos(xPos) xDistFromLedge(xDistFromLedge) category(category);
    
        static const MarkovInput MInputTime = MarkovInput(60, 4);
        static const MarkovInput MInputXDist = MarkovInput(3, 7);
        static const MarkovInput MInputYDistFloor = MarkovInput(2, 2);
        static const MarkovInput MInputXPos = MarkovInput(5, 1);
        static const MarkovInput MInputXDistFromLedge = MarkovInput(2, 2);
        static const MarkovInput MInputCategory = MarkovInput(1, 5);

        static const float MTotalWeight = 
            MInputTime.weight
            + MInputXDist.weight
            + MInputYDistFloor.weight
            + MInputXPos.weight
            + MInputXDistFromLedge.weight
            + MInputCategory.weight;

        static float calcScore(MarkovInput m, float val1, float val2) {
            float diff = FAbs(val1 - val2);
            if (diff > m.tolerance) return 0;
            return m.weight * ((m.tolerance - diff) / m.tolerance);
        }

        static ActionCategory getActionCategory(int statusKind) {
            switch (statusKind) {
                case 0x0: /* Wait */
                case 0x1: /* Walk */
                case 0x2: /* Walk_Brake */
                    return ActionCategory::GROUND;
                case 0x3: /* Dash */
                    return ActionCategory::DASH;
                case 0x4: /* Run */
                case 0x5: /* Run_Brake */
                case 0x6: /* Turn */
                    return ActionCategory::GROUND;
                case 0x7: /* Turn_Dash */
                    return ActionCategory::DASH;
                case 0x8: /* Turn_Run */
                case 0x9: /* Turn_Run_Brake */
                case 0xA: /* Jump_Squat */
                    return ActionCategory::GROUND;
                case 0xB: /* Jump */
                case 0xC: /* Jump_Aerial */
                case 0xD: /* Fly */
                case 0xE: /* Fall */
                    return ActionCategory::AIR;
                case 0xF: /* Fall_Aerial */
                case 0x10: /* Fall_Special */
                    return ActionCategory::INACTIONABLE;
                case 0x11: /* Squat */
                case 0x12: /* Squat_Wait */
                case 0x13: /* Squat_F */
                case 0x14: /* Squat_B */
                case 0x15: /* Squat_Rv */
                case 0x16: /* Landing */
                case 0x17: /* Landing_Light */
                    return ActionCategory::GROUND;
                case 0x18: /* Landing_Attack_Air */
                case 0x19: /* Landing_Fall_Special */
                    return ActionCategory::INACTIONABLE;
                case 0x1A: /* Guard_On */
                case 0x1B: /* Guard */
                case 0x1C: /* Guard_Off */
                case 0x1D: /* Guard_Damage */
                case 0x1E: /* Escape */
                case 0x1F: /* Escape_F */
                case 0x20: /* Escape_B */
                case 0x21: /* Escape_Air */
                    return ActionCategory::SHIELD;
                case 0x22: /* Rebound_Stop */
                case 0x23: /* Rebound */
                    return ActionCategory::GROUND;
                case 0x24: /* Attack */
                case 0x25: /* Attack_100 */
                case 0x26: /* Attack_Dash */
                case 0x27: /* Attack_S3 */
                case 0x28: /* Attack_Hi3 */
                case 0x29: /* Attack_Lw3 */
                case 0x2A: /* Attack_S4_Start */
                case 0x2B: /* Attack_S4_Hold */
                case 0x2C: /* Attack_S4 */
                case 0x2D: /* Attack_Lw4_Start */
                case 0x2E: /* Attack_Lw4_Hold */
                case 0x2F: /* Attack_Lw4 */
                case 0x30: /* Attack_Hi4_Start */
                case 0x31: /* Attack_Hi4_Hold */
                case 0x32: /* Attack_Hi4 */
                case 0x33: /* Attack_Air */
                case 0x34: /* Catch */
                case 0x35: /* Catch_Pull */
                case 0x36: /* Catch_Dash */
                case 0x37: /* Catch_Dash_Pull */
                case 0x38: /* Catch_Turn */
                case 0x39: /* Catch_Wait */
                case 0x3A: /* Catch_Attack */
                case 0x3B: /* Catch_Cut */
                case 0x3C: /* Throw */
                    return ActionCategory::ATTACK;
                case 0x3D: /* Capture_Pulled */
                case 0x3E: /* Capture_Wait */
                case 0x3F: /* Capture_Damage */
                case 0x40: /* Capture_Cut */
                case 0x41: /* Capture_Jump */
                case 0x42: /* Capture_Thrown */
                case 0x43: /* Damage */
                case 0x44: /* Damage_Air */
                case 0x45: /* Damage_Fly */
                case 0x46: /* Damage_Fly_Roll */
                case 0x47: /* Damage_Fly_Reflect_Lr */
                case 0x48: /* Damage_Fly_Reflect_U */
                    return ActionCategory::HITSTUN;
                case 0x49: /* Damage_Fall */
                    return ActionCategory::AIR;
                case 0x4A: /* Down */
                case 0x4B: /* Down_Spot */
                case 0x4C: /* Down_Continue */
                case 0x4D: /* Down_Wait */
                case 0x4E: /* Down_Wait_Continue */
                case 0x4F: /* Down_Eat */
                case 0x50: /* Lay_Down */
                case 0x51: /* Down_Stand */
                case 0x52: /* Down_Stand_Fb */
                    return ActionCategory::INACTIONABLE;
                case 0x53: /* Down_Stand_Attack */
                    return ActionCategory::SHIELD;
                case 0x54: /* Down_Damage */
                case 0x55: /* Down_Reflect_Lr */
                case 0x56: /* Shield_Break_Fly */
                case 0x57: /* Shield_Break_Fall */
                case 0x58: /* Shield_Break_Down */
                case 0x59: /* FuraFura_Stand */
                case 0x5A: /* FuraFura */
                case 0x5B: /* FuraFura_End */
                case 0x5C: /* Damage_Song_Start */
                case 0x5D: /* Damage_Song */
                case 0x5E: /* Damage_Song_End */
                case 0x5F: /* Bind */
                    return ActionCategory::INACTIONABLE;
                case 0x60: /* Passive */
                case 0x61: /* Passive_Fb */
                case 0x62: /* Passive_Wall */
                case 0x63: /* Passive_Wall_Jump */
                case 0x64: /* Passive_Ceil */
                    return ActionCategory::INACTIONABLE;
                case 0x65: /* Stop_Wall */
                    return ActionCategory::GROUND;
                case 0x66: /* Stop_Ceil */
                case 0x67: /* Wall_Jump */
                case 0x68: /* Attach_Wall */
                case 0x69: /* Attach_Wall_Wait */
                case 0x6A: /* Detach_Wall */
                case 0x6B: /* Detach_Wall_Fall */
                case 0x6C: /* Detach_Wall_Jump */
                    return ActionCategory::AIR;
                case 0x6D: /* Tread_Jump */
                    return ActionCategory::ATTACK;
                case 0x6E: /* Tread_Damage */
                case 0x6F: /* Tread_Damage_Rv */
                case 0x70: /* Tread_Damage_Air */
                case 0x71: /* Tread_Fall */
                    return ActionCategory::INACTIONABLE;
                case 0x72: /* Pass */
                    return ActionCategory::AIR;
                case 0x73: /* Cliff_Catch_Move */
                    return ActionCategory::INACTIONABLE;
                case 0x74: /* Cliff_Catch */
                case 0x75: /* Cliff_Wait */
                    return ActionCategory::AIR;
                case 0x76: /* Cliff_Attack */
                    return ActionCategory::ATTACK;
                case 0x77: /* Cliff_Climb */
                case 0x78: /* Cliff_Escape */
                    return ActionCategory::INACTIONABLE;
                case 0x79: /* Cliff_Jump1 */
                case 0x7A: /* Cliff_Jump2 */
                case 0x7B: /* Cliff_Jump3 */
                    return ActionCategory::AIR;
                case 0x7C: /* Ottoto */
                case 0x7D: /* Ottoto_Wait */
                    return ActionCategory::GROUND;
                case 0x7E: /* Miss_Foot */
                    return ActionCategory::AIR;
                case 0x7F: /* Air_Lasso */
                    return ActionCategory::ATTACK;
                case 0x80: /* Air_Lasso_Reach */
                case 0x81: /* Air_Lasso_Hang */
                case 0x82: /* Air_Lasso_Rewind */
                case 0x83: /* Air_Lasso_Failure */
                case 0x84: /* Glide_Start */
                case 0x85: /* Glide */
                    return ActionCategory::AIR;
                case 0x86: /* Glide_Landing */
                    return ActionCategory::GROUND;
                case 0x87: /* Glide_Attack */
                    return ActionCategory::ATTACK;
                case 0x88: /* Glide_End */
                    return ActionCategory::AIR;
                case 0x89: /* Slip */
                case 0x8A: /* Slip_Down */
                case 0x8B: /* Slip_Turn */
                case 0x8C: /* Slip_Dash */
                case 0x8D: /* Slip_Wait */
                case 0x8E: /* Slip_Stand */
                    return ActionCategory::INACTIONABLE;
                case 0x8F: /* Slip_Stand_Attack */
                    return ActionCategory::ATTACK;
                case 0x90: /* Slip_Stand_F */
                case 0x91: /* Slip_Stand_B */
                    return ActionCategory::INACTIONABLE;
                case 0x92: /* Ladder_Catch */
                case 0x93: /* Ladder_Catch_End */
                case 0x94: /* Ladder_Wait */
                case 0x95: /* Ladder_End */
                    return ActionCategory::AIR;
                case 0x96: /* Item_Pickup_Light */
                case 0x97: /* Item_Pickup_Heavy */
                    return ActionCategory::INACTIONABLE;
                case 0x98: /* Item_Lift_Wait */
                case 0x99: /* Item_Lift_Turn */
                case 0x9A: /* Item_Lift_Walk */
                    return ActionCategory::GROUND;
                case 0x9B: /* Item_Throw */
                case 0x9C: /* Item_Throw_Dash */
                case 0x9D: /* Item_Throw_Heavy */
                case 0x9E: /* Item_Swing */
                case 0x9F: /* Item_Swing_S3 */
                case 0xA0: /* Item_Swing_S4_Start */
                case 0xA1: /* Item_Swing_S4 */
                case 0xA2: /* Item_Swing_S4_Hold */
                case 0xA3: /* Item_Swing_Dash */
                    return ActionCategory::ATTACK;
                case 0xA4: /* Item_Shoot_Wait */
                case 0xA5: /* Item_Shoot_Walk_F */
                case 0xA6: /* Item_Shoot_Walk_Brake_F */
                case 0xA7: /* Item_Shoot_Walk_B */
                case 0xA8: /* Item_Shoot_Walk_Brake_B */
                case 0xA9: /* Item_Shoot_Dash_F */
                case 0xAA: /* Item_Shoot_Dash_B */
                case 0xAB: /* Item_Shoot_Jump_Squat */
                    return ActionCategory::GROUND;
                case 0xAC: /* Item_Shoot_Jump */
                case 0xAD: /* Item_Shoot_Air */
                    return ActionCategory::AIR;
                case 0xAE: /* Item_Shoot_Landing */
                    return ActionCategory::GROUND;
                case 0xAF: /* Item_Screw_Jump */
                case 0xB0: /* Item_Screw_Jump_Aerial */
                case 0xB1: /* Item_Screw_Fall */
                    return ActionCategory::AIR;
                case 0xB2: /* Item_Assist_Hoist */
                    return ActionCategory::INACTIONABLE;
                case 0xB3: /* Swim_Dive */
                case 0xB4: /* Swim_Rise */
                case 0xB5: /* Swim_Up */
                case 0xB6: /* Swim_Wait */
                case 0xB7: /* Swim */
                case 0xB8: /* Swim_End */
                case 0xB9: /* Swim_Turn */
                    return ActionCategory::SWIM;
                case 0xBA: /* Swim_Jump */
                    return ActionCategory::AIR;
                case 0xBB: /* Swim_Drown */
                case 0xBC: /* Swim_Drown_Out */
                case 0xBD: /* Dead */
                    return ActionCategory::INACTIONABLE;
                case 0xBE: /* Rebirth */
                    return ActionCategory::AIR;
                case 0xBF: /* Gimmick_Door */
                case 0xC0: /* Gimmick_Barrel */
                case 0xC1: /* Gimmick_Catapult */
                case 0xC2: /* Gimmick_Truck */
                case 0xC3: /* Gimmick_Spring */
                case 0xC4: /* Gimmick_Spring_Jump */
                case 0xC5: /* Gimmick_Spring_Back */
                    return ActionCategory::AIR;
                case 0xC6: /* Gimmick_Eaten */
                case 0xC7: /* Bury */
                case 0xC8: /* Bury_Wait */
                    return ActionCategory::HITSTUN;
                case 0xC9: /* Bury_Jump */
                    return ActionCategory::AIR;
                case 0xCA: /* Ice */
                    return ActionCategory::HITSTUN;
                case 0xCB: /* Ice_Jump */
                    return ActionCategory::AIR;
                case 0xCC: /* Bitten_Wario_Start */
                case 0xCD: /* Bitten_Wario */
                    return ActionCategory::HITSTUN;
                case 0xCE: /* Bitten_Wario_End */
                    return ActionCategory::AIR;
                case 0xCF: /* Clung_Captain */
                case 0xD0: /* Swallowed */
                case 0xD1: /* Swallowed_Drink */
                case 0xD2: /* Swallowed_Capture */
                case 0xD3: /* Swallowed_Thrown_Star */
                case 0xD4: /* Swallowed_Thrown */
                case 0xD5: /* Swallowed_Canceled */
                case 0xD6: /* Clung_Diddy */
                case 0xD7: /* Clung_Damage_Diddy */
                case 0xD8: /* Clung_Thrown_Diddy */
                case 0xD9: /* Shouldered_Donkey_Start */
                case 0xDA: /* Shouldered_Donkey */
                case 0xDB: /* Shouldered_Donkey_Thrown */
                    return ActionCategory::HITSTUN;
                case 0xDC: /* Warpstar */
                    return ActionCategory::INACTIONABLE;
                case 0xDD: /* Warpstar_Jump */
                case 0xDE: /* Dragoon_Ride */
                case 0xDF: /* Hammer_Wait */
                case 0xE0: /* Hammer_Walk */
                case 0xE1: /* Hammer_Turn */
                case 0xE2: /* Hammer_Jump_Squat */
                case 0xE3: /* Hammer_Jump */
                case 0xE4: /* Hammer_Fall */
                case 0xE5: /* Hammer_Landing */
                    return ActionCategory::ATTACK;
                case 0xE6: /* Clung_Ganon */
                case 0xE7: /* Catched_Ganon */
                case 0xE8: /* Catched_Air_Ganon */
                case 0xE9: /* Catched_Air_Fall_Ganon */
                case 0xEA: /* Catched_Air_End_Ganon */
                case 0xEB: /* Capture_Yoshi */
                case 0xEC: /* Yoshi_Egg */
                case 0xED: /* Link_Final */
                case 0xEE: /* Koopa_Dived */
                case 0xEF: /* Metaknight_Final */
                case 0xF0: /* Pit_Fall */
                case 0xF1: /* Throw_Kirby */
                    return ActionCategory::HITSTUN;
                case 0xF2: /* Big */
                case 0xF3: /* Small */
                case 0xF4: /* Heart_Swap */
                case 0xF5: /* Heart_Swap_End */
                    return ActionCategory::INACTIONABLE;
                case 0xF6: /* Adv_Follow */
                    return ActionCategory::INACTIONABLE;
                case 0xF7: /* Ike_Final_Damage_Fly */
                case 0xF8: /* Ike_Final_Damage */
                case 0xF9: /* Ike_Final_Damage_Fall */
                case 0xFA: /* Capture_Masterhand */
                case 0xFB: /* Final_Visual_Attack_Other */
                case 0xFC: /* Captain_Final_Start */
                case 0xFD: /* Captain_Final_FuraFura */
                case 0xFE: /* Captain_Final_Clash */
                case 0xFF: /* Captain_Final_End */
                case 0x100: /* Kirby_Final_Damage_Fly */
                case 0x101: /* Kirby_Final_Damage_Wait */
                    return ActionCategory::HITSTUN;
                case 0x102: /* Capture_Gokulin */
                case 0x103: /* Capture_Cut_Gokulin */
                    return ActionCategory::AIR;
                case 0x104: /* Capture_Taboo */
                case 0x105: /* Capture_Bucyulus */
                    return ActionCategory::HITSTUN;
                case 0x106: /* Capture_Cut_Bucyulus */
                    return ActionCategory::AIR;
                case 0x107: /* Capture_Pulled_Yoshi */
                case 0x108: /* Capture_Wait_Yoshi */
                case 0x109: /* Capture_Damage_Yoshi */
                    return ActionCategory::HITSTUN;
                case 0x10A: /* Capture_Cut_Yoshi */
                    return ActionCategory::AIR;
                case 0x10B: /* Standby */
                case 0x10C: /* Appeal  */
                case 0x10D: /* Smash_Appeal */
                case 0x10E: /* Entry */
                case 0x10F: /* Win */
                case 0x110: /* Lose */
                case 0x111: /* Test_Motion */
                    return ActionCategory::INACTIONABLE;
            }

            return ActionCategory::ATTACK;
        }
    };

    // terrible very bad no-good lazy thing that should absolutely be replaced by a map
    struct CachedPrediction {
        float ATTACK = -1;
        float GRAB = -1;
        float SHIELD = -1;
        float HITSTUN = -1;
        float AIR = -1;
        float GROUND = -1;
        float SWIM = -1;
        float DASH = -1;
        float INACTIONABLE = -1;
    }

    class MarkovSystem {
    private: // MarkovSystem
        CircularBuffer<MarkovEntry*, MARKOV_TRACK_COUNT> elements;
        CachedPrediction predictionCache;

    public:
        void iterate(Fighter* self);
        void snapshot(Fighter* self, ActionCategory newCategory);
        float predict(ActionCategory category);
    };
};