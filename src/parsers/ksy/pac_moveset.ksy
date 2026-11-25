meta:
  id: pac_moveset
  ks-debug: false
  ks-opaque-types: false
  endian: be
  encoding: ascii
  imports:
    - move_def
seq:
  - {id: header, type: arc_header}
  - {id: files, type: arc_file, repeat: expr, repeat-expr: header.file_count}
types:
  arc_header:
    seq:
    - id: tag
      type: strz
      size: 0x4
    - id: version
      size: 0x2
    - id: file_count
      type: u2
    - id: padding
      size: 0x8
    - id: name
      type: strz
      size: 0x30
  arc_file:
    seq:
      - id: arc_file_header
        type: header
      - id: content 
        size: arc_file_header.file_size
    instances:
      moveset:
        if: arc_file_header.file_type == 1
        pos: content_start.offset
        type: u4
    types:
      header:
        seq:
        - {id: file_type, type: u2}
        - {id: index, type: u2}
        - {id: file_size, type: u4}
        - {id: group_index, type: u1}
        - {id: padding_1, size: 0x1}
        - {id: redirect_index, type: u2}
        - {id: padding_2, size: 0x14}
