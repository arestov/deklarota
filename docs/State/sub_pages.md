

`sub_pages`

- sub_page

- ```
  sub_page: {
    nested_start: {
      constr: NestedStart,
      title: [[]],
    },
    tabs: {
      constr: Tabs,
      title: [[]],
    },
  }
  ```

- sub_pager.item

- ```
  sub_pager: {
    item: [
      WorkSpaceItem,
      [[]],
      {
        remoteId: 'simple_name',
      },
    ],
  },
  ```

- sub_pager.by_type

- ```
  sub_pager: {
    by_type: {
      search: {
        head: {
          query: 'by_slash.0',
        },
        constr: Search,
        reusable: [
          ['mp_detailed'],
          det => !det,
        ],
      },
      user_current: [
        CurrentUserSpace, [[]], {
        // for_current_user: [true],
        },
      ],
      recipe: [
        Recipe, [[]], {
          id: 'by_slash.0',
        },
      ],
    },
    type: {
      search: 'search',
      recipes: 'recipe',
      users: name => {
        if (name === 'me') {
          return 'user_current'
        }
  
        return null
      },
    },
  },
  ```

- 