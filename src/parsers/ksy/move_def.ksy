meta:
  id: move_def
  ks-debug: false
  ks-opaque-types: false
  endian: be
  encoding: ascii
  imports:
    - anim_cmd
params:
  - id: mdef_kind
    type: str
seq:
  - id: header
    type: sakurai_header
    size: 0x20
    doc: |
      i'm a header, WEEEEEEE
  - id: body
    type: sakurai_body
    size: header.size - 0x20
types: 
  sakurai_header:
    seq:
    - id: size
      type: s4
    - id: lookup_entry_offset
      type: s4
    - id: lookup_entry_count
      type: s4
    - id: section_count
      type: s4
    - id: external_subroutine_count
      type: s4
    - id: padding
      size-eos: true
  sakurai_body:
    instances:
      lookup_entries:
        pos: _parent.header.lookup_entry_offset
        type: lookup_table(
          _parent.header.lookup_entry_count,
          _parent.header.section_count,
          _parent.header.external_subroutine_count)
      sections:
        pos: 0
        type: section(lookup_entries.sections[_index], lookup_entries.string_table_pos, _index)
        repeat: expr
        repeat-expr: _parent.header.section_count
    types:
      lookup_table:
        params:
          - id: lookup_count
            type: u4
          - id: section_count
            type: u4
          - id: external_subroutine_count
            type: u4
        seq:
          - id: entries
            type: lookup_entry
            repeat: expr
            repeat-expr: lookup_count
          - id: sections
            type: section_entry
            repeat: expr
            repeat-expr: section_count
          - id: external_subroutines
            type: external_subroutine_entry
            repeat: expr
            repeat-expr: external_subroutine_count
          - size: 0
            if: string_table_pos < 0
        instances:
          string_table_pos:
            value: _io.pos
      lookup_entry:
        seq:
          - id: entry_offset
            type: s4
        instances:
          content:
            pos: entry_offset
            type: u1
      section_entry:
        seq:
          - id: content_offset
            type: s4
          - id: string_offset
            type: s4
      external_subroutine_entry:
        seq:
          - id: offset
            type: s4
          - id: string_offset 
            type: s4
        instances:
          string:
            pos: _parent.string_table_pos + string_offset
            type: strz
      section:
        params:
          - id: entry
            type: section_entry
          - id: string_table_pos
            type: u4
          - id: section_idx
            type: u4
        enums:
          section_type:
            -1: unk
            1: anim_cmd
            2: data_common
            3: data_fighter
            4: data_enemy_common
            5: data_enemy
            6: it_anim_param
            7: sub_param
        instances:
          name:
            pos: string_table_pos + entry.string_offset
            type: strz
          data_pos:
            value: entry.content_offset
          data:
            pos: entry.content_offset
            type:
              switch-on: |
                name.substring(0, 12) == 'gameAnimCmd_'
                or name.substring(0, 14) == 'effectAnimCmd_'
                or name.substring(0, 19) == 'statusAnimCmdGroup_'
                or name.substring(0, 17) == 'statusAnimCmdPre_'
                or name.substring(0, 18) == 'statusAnimCmdExit_'
                or name.substring(0, 14) == 'statusAnimCmd_'
                ? section_type::anim_cmd
                  : name == 'dataCommon'
                  ? section_type::data_common
                  : name == 'commonData'
                  ? section_type::data_enemy_common
                  : name == 'data'
                  ? section_type::data_fighter
                  : name == 'data' and _root.mdef_kind == 'enemy'
                  ? section_type::data_enemy
                  : name.substring(0, 9) == 'animParam'
                  ? section_type::it_anim_param
                    : section_type::unk
              # section_type::data
              # and _root.mdef_kind == 'fighter'
              cases:
                'section_type::anim_cmd': anim_cmd # anim_cmd_stuff
                'section_type::data_fighter': arc_fighter_data
                'section_type::data_common': arc_fighter_data_common
                'section_type::data_enemy': arc_enemy_data
                'section_type::data_enemy_common': arc_enemy_data_common
                'section_type::it_anim_param': it_anim_param
                _: u4
      # external_subroutine:
      #   params:
      #     - id: string_offset
      #       type: s4
      #     - id: string_table_pos
      #       type: u4
      #   instances:
      #     name:
      #       pos: string_table_pos + entry.string_offset
      #       type: strz
      #     offsets: 
      #       pos: entry.offset_linked_list
      #       type: s4
      #       repeat: until
      #       repeat-until: _ == 0
      arc_enemy_data:
        seq:
          - {id: subaction_flags_start, type: ptr('s4')}
          - {id: hit_data_set, type: ptr('s4')}
          - {id: hit_weakness_data_set, type: ptr('s4')}
          - {id: params3, type: ptr('s4')}
          - {id: unknown_count, type: s4}
          - {id: setable_node_data, type: ptr('s4')}
          - {id: attributes1, type: ptr('s4')}
          - {id: attributes2, type: ptr('s4')}
          - {id: unknown_datas8, type: ptr('s4')}
          - {id: action_flags, type: ptr('s4')}
          - {id: subaction_main_start, type: ptr('s4')}
          - {id: subaction_main_exit_start, type: ptr('s4')}
          - {id: subaction_main_init_start, type: ptr('s4')}
          - {id: subaction_gfx_start, type: ptr('s4')}
          - {id: subaction_gfx_exit_start, type: ptr('s4')}
          - {id: subaction_gfx_init_start, type: ptr('s4')}
          - {id: subaction_sfx_start, type: ptr('s4')}
          - {id: subaction_sfx_exit_start, type: ptr('s4')}
          - {id: subaction_sfx_init_start, type: ptr('s4')}
          - {id: action_start, type: ptr('s4')}
          - {id: action_exit_start, type: ptr('s4')}
          - {id: action_init_start, type: ptr('s4')}
          - {id: unknown_datas22, type: ptr('s4')}
          - {id: collision_data, type: ptr('s4')}
          - {id: unk_event_offset, type: ptr('s4')}
          - {id: camera_range_set, type: ptr('s4')}
          - {id: camera_clip_sphere_data, type: ptr('s4')}
          - {id: gr_col_data_set, type: ptr('s4')}
        instances:
          action_count:
            value: (action_exit_start.offset - action_start.offset) / 4
          action:
            pos: action_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: action_count
          action_exit:
            pos: action_exit_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: action_count
          action_init:
            pos: action_init_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: action_count
          subaction_count:
            value: (subaction_main_exit_start.offset - subaction_main_start.offset) / 4
          subaction_flags:
            pos: subaction_flags_start.offset
            type: so_motion_data
            repeat: expr
            repeat-expr: subaction_count
          subaction_main:
            pos: subaction_main_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_main_exit:
            pos: subaction_main_exit_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_main_init:
            pos: subaction_main_init_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_gfx:
            pos: subaction_gfx_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_gfx_exit:
            pos: subaction_gfx_exit_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_gfx_init:
            pos: subaction_gfx_init_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_sfx:
            pos: subaction_sfx_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_sfx_exit:
            pos: subaction_sfx_exit_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_sfx_init:
            pos: subaction_sfx_init_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count



      arc_enemy_data_common:
        seq:
          - {id: params0, type: ptr('s4')}
          - {id: data1, type: ptr('s4')}
          - {id: data2, type: ptr('s4')}
          - {id: params3, type: ptr('s4')}
          - {id: gfx_events_start, type: ptr('s4')}
          - {id: params5, type: ptr('s4')}
          - {id: params6, type: ptr('s4')}
        instances:
          gfx_events:
            pos: gfx_events_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: 26

      arc_fighter_data:
        seq:
          - {id: subaction_flags_start, type: ptr('u4')}
          - {id: model_visibility_start, type: ptr('u4')}
          - {id: attribute_start, type: ptr('u4')}
          - {id: sse_attribute_start, type: ptr('u4')}
          - {id: misc_section_offset, type: ptr('u4')}
          - {id: common_action_flags_start, type: ptr('u4')}
          - {id: action_flags_start, type: ptr('u4')}
          - {id: extra_action_flags, type: ptr('u4')}
          - {id: action_interrupts, type: ptr('u4')}
          # Luc = 0x13
          - {id: entry_actions_start, type: ptr('u4')}
          - {id: exit_actions_start, type: ptr('u4')}
          - {id: action_pre_start, type: ptr('u4')}
          # Luc = 0x1eb
          - {id: subaction_main_start, type: ptr('u4')}
          - {id: subaction_gfx_start, type: ptr('u4')}
          - {id: subaction_sfx_start, type: ptr('u4')}
          - {id: subaction_other_start, type: ptr('u4')}
          - {id: anchored_item_positions, type: ptr('u4')}
          - {id: gooey_bomb_positions, type: ptr('u4')}
          - {id: bone_ref1, type: ptr('u4')}
          - {id: bone_ref2_hand_bones, type: ptr('u4')}
          - {id: entry_action_overrides_start, type: ptr('u4')}
          - {id: exit_action_overrides_start, type: ptr('u4')}
          - {id: extra_action_interrupts, type: ptr('u4')}
          - {id: samus_arm_cannon_positions, type: ptr('u4')}
          - {id: unknown24, type: ptr('u4')}
          - {id: static_articles_start, type: ptr('u4')}
          - {id: entry_articles_start, type: ptr('u4')}
          - {id: flags1, type: u4}
          - {id: flags2, type: u4}
          - {id: flags3, type: u4}
          - {id: flags4, type: u4}
        types:
          action_override:
            seq:
              - {id: action_id, type: s4}
              - {id: acmd, type: ptr('anim_cmd')}
          action_flag:
            seq:
              - {id: flag0, type: u4}
              - {id: flag1, type: u4}
              - {id: flag2, type: u4}
              - {id: flag3, type: u4}
        instances:
          common_action_flags:
            pos: common_action_flags_start.offset
            type: action_flag
            repeat: expr
            repeat-expr: 0x112
          entry_action_overrides:
            pos: entry_action_overrides_start.offset
            type: action_override
            repeat: until
            repeat-until: _.action_id == -1
          exit_action_overrides:
            pos: exit_action_overrides_start.offset
            type: action_override
            repeat: until
            repeat-until: _.action_id == -1
          action_count:
            value: (exit_actions_start.offset - entry_actions_start.offset) / 4
          entry_actions:
            pos: entry_actions_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: action_count
          exit_actions:
            pos: exit_actions_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: action_count
          subaction_count:
            value: (subaction_gfx_start.offset - subaction_main_start.offset) / 4
          subaction_flags:
            pos: subaction_flags_start.offset
            type: so_motion_data
            repeat: expr
            repeat-expr: subaction_count
          subaction_main:
            pos: subaction_main_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_gfx:
            pos: subaction_gfx_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_sfx:
            pos: subaction_sfx_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
          subaction_other:
            pos: subaction_other_start.offset
            type: ptr('anim_cmd')
            repeat: expr
            repeat-expr: subaction_count
      arc_fighter_data_common:
        seq:
          - {id: global_ics, type: ptr('s4')}
          - {id: global_ics_sse, type: ptr('s4')}
          - {id: ics, type: ptr('s4')}
          - {id: ics_sse, type: ptr('s4')}
          - {id: entry_actions_start, type: "ptr_ptr_table('anim_cmd', 0x112)"}
          - {id: exit_actions_start, type: "ptr_ptr_table('anim_cmd', 0x112)"}
          - {id: flash_overlay_array, type: ptr('s4')}
          - {id: unk7, type: ptr('s4')}
          - {id: unk8, type: ptr('s4')}
          - {id: item_swing_data, type: ptr('s4')}
          - {id: unk10, type: ptr('s4')}
          - {id: unk11_offset_table, type: ptr('s4')}
          - {id: unk12, type: ptr('s4')}
          - {id: unk13, type: ptr('s4')}
          - {id: unk14, type: ptr('s4')}
          - {id: unk15, type: ptr('s4')}
          - {id: unk16, type: ptr('s4')}
          - {id: patter_power_mul, type: ptr('s4')}
          - {id: rgba_color, type: ptr('s4')}
          - {id: flash_overlay_offset, type: ptr('s4')}
          - {id: screen_tints, type: ptr('s4')}
          - {id: leg_bones, type: ptr('s4')}
          - {id: unk22_table_reference, type: "ptr('unk22_table')"}
      it_anim_param:
        seq:
          # flags
          - {id: motion_data_ptr, type: u4}
          # - {id: motion_data, type: ptr('u1')}
          - {id: motion_num, type: u4}
          # flags
          - {id: status_data, type: ptr('s4')}
          - {id: status_num, type: u4}
          - {id: visibility_data, type: ptr('s4')}
          - {id: physics_ik_data, type: ptr('s4')}
          - {id: effect_node_data, type: ptr('s4')}
          - {id: motion_anim_cmd_game, type: "ptr_ptr_table('anim_cmd', motion_num)"}
          # - {id: motion_anim_cmd_game, type: ptr('s4')}
          - {id: motion_anim_cmd_effect, type: "ptr_ptr_table('anim_cmd', motion_num)"}
          # - {id: motion_anim_cmd_effect, type: ptr('s4')}
          - {id: motion_anim_cmd_sound, type: "ptr_ptr_table('anim_cmd', motion_num)"}
          # - {id: motion_anim_cmd_sound, type: ptr('s4')}
          - {id: status_anim_cmd, type: "ptr_ptr_table('anim_cmd', status_num)"}
          # - {id: status_anim_cmd, type: ptr('s4')}
          # needs more data
          - {id: event_anim_cmd, type: "ptr_ptr_table('anim_cmd', 0x5)"}
          - {id: collision_hit_data_set, type: ptr('s4')}
          - {id: collision_reflector_data_set, type: ptr('s4')}
          - {id: ground_shape_data_set, type: ptr('s4')}
          - {id: model_flags, type: s4}
        instances:
          motion_data:
            pos: motion_data_ptr
            type: so_motion_data
            repeat: expr
            repeat-expr: motion_num
  so_motion_data:
    seq:
      - id: flags
        type: u4
      - id: motion_name
        type: ptr('strz')
  unk22_table:
    seq:
    - id: offset
      type: s4
    - id: length
      type: u4
    instances:
      objects:
        pos: offset
        type: s4
        repeat: expr
        repeat-expr: length
  dummy:
    instances:
      d:
        value: '"dummy"'
  atype:
    params:
      - id: dtype
        type: str
    seq:
      - id: data
        type: 
          switch-on: dtype
          cases:
            '"anim_cmd"': anim_cmd
            '"so_motion_data"': so_motion_data
            '"f4"': f4
            '"u1"': u1
            '"u2"': u2
            '"u4"': u4
            '"s1"': s1 
            '"s2"': s2 
            '"s4"': s4
            '"strz"': strz
            '"unk22_table"': unk22_table
            _: dummy
  ptr:
    params:
      - id: dtype
        type: str
    seq:
      - id: offset
        type: s4
    instances:
      data:
        if: offset != 0 or dtype == 'strz'
        pos: offset
        type: atype(dtype)
          
  ptr_table:
    params:
      - id: dtype
        type: str
      - id: amt
        type: s4
    seq:
      - id: entries
        repeat: expr
        repeat-expr: amt
        type: ptr(dtype)
        
  ptr_ptr:
    params:
      - id: dtype
        type: str
    seq:
      - id: offset
        type: s4
    instances:
      ptr:
        if: offset != 0
        pos: offset
        type: ptr(dtype)

  ptr_ptr_table:
    params:
      - id: dtype
        type: str
      - id: amt
        type: s4
    seq:
      - id: offset
        type: s4
      - id: count
        type: u4
        if: amt == 0
    instances:
      len:
        value: |
          amt == -1 ? 0 
          : amt == 0 ? count 
          : amt
      ptr_table:
        if: offset != 0
        pos: offset
        type: "ptr_table(dtype, len)"