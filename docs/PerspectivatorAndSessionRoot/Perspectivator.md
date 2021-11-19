- SessionRoot и Perspectivator (prev. AttentionRouter, prev. spyglass, known as `map` arg) - нужны для хранения информации о том куда направлено внимание пользователя. Т.е. для описания логики навигации в приложении.
- Все перспективаторы, включая вложенные прикрепляются к SessionRoot. Уникальность и одновремененно предсказуемость различных перспективаторов определяется в первую очередь через имя Perspective. Опционально определяется через model и bwlev внутри которого происходит "навигация"

Например:

song_action:
  для каждой song и каждого bwlev будет создан отдельная перспективатор в рамках которой можно будет переключать отображаемую секцию для данной композиции, вроде add to favorite, add to playlist, playing repeat settings (global, but in context)


`_x_skip_navigation` предназначен для того чтобы модель не использовалась в качестве nav parent (а потомки для nav parent использовали не эту модель а nav parent этой модели, т.е вместо .map_parent был вызов .map_parent.map_parent) (устаревший, см. nav_parent_at_perspectivator_)
