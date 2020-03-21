2 системы адресации

- legacy

- ```
  '@one:attr_name:rel_lev_1.rel_lev_2.etc.etc'// @ - collects first of attr_name from rels
  '@attr_name:rel_lev_1.etc' // collects all values of attr_name from rels
  '^attr_name.obj_prop', // ^attr_name from parent;value of attr name is obj - attr_name: {obj_prop: 'hi!'}
  '^^attr_name' // ^^ - attr_name of parent of parent
  '#attr_name' // # - attr_name from root
  ```

  used almost everywhere: `attrs` `"compx"`, `effects` require, trigger

- modernPath

- ```
  '< attr_name < rel_name < route/resource/subresource < parent/root' // order of adressing parts: attr, rel, routing, parent/root

  '< title < one:friends << #' // route is missing, base is root
  '< title < many:friends << ^^^' // route is missing, base is parent of parent of parent
  '<<<<' // self, there are cases where you may need it
  '< title' // just attr
  '<< just_rel'
  '<<< /artists/blink 182/tracks/miss you' // just route
  '< title <<< #' // attr from root
  '< title <<< ^' // attr from parent
  '< album_name << /artists/blink 182/tracks/miss you' // attr from resource by routing address
  ```

  used in relativly new dcls: `actions`, `rels` `"compx"`
