2 системы адресации

- legacy

- ```
  '@one:state_name:rel_lev_1.rel_lev_2.etc.etc'// @ - collects first of state_name from rels
  '@state_name:rel_lev_1.etc' // collects all values of state_name from rels
  '^state_name.obj_prop', // ^state_name from parent;value of state name is obj - state_name: {obj_prop: 'hi!'}
  '^^state_name' // ^^ - state_name of parent of parent
  '#state_name' // # - state_name from root
  ```

  used almost everywhere: `attrs` `"compx"`, `effects` require, trigger

- modernPath

- ```
  '< state_name < rel_name < route/resource/subresource < parent/root' // order of adressing parts: state, rel, routing, parent/root
  
  '< title < one:friends << #' // route is missing, base is root
  '< title < many:friends << ^^^' // route is missing, base is parent of parent of parent
  '<<<<' // self, there are cases where you may need it
  '< title' // just state
  '<< just_rel'
  '<<< /artists/blink 182/tracks/miss you' // just route
  '< title <<< #' // state from root
  '< title <<< ^' // state from parent
  '< album_name << /artists/blink 182/tracks/miss you' // state from resource by routing address
  ```

  used in relativly new dcls: `actions`, `rels` `"compx"`

