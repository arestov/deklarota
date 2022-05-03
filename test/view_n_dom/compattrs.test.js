import path from 'path'
import { expect, test } from '@jest/globals'
import model from 'dkt/model'
import modernRoot from '../modernRoot'
import testingInit from '../testingInit'
import testingInitView from './testingInitView'
import spv from '../../js/libs/spv'

const takeDefault = ({ default: val }) => val

test('should init', async () => {
  const User = model({
    model_name: 'User',
    attrs: {
      name: ['input', 'George'],
    },
  })

  const AppRoot = modernRoot({
    attrs: {},
    rels: {
      user: ['nest', [User]],
    },
    checkActingRequestsPriority: () => {},
  })

  const inited = await testingInit(AppRoot, {}, { proxies: true })

  const { computed } = inited

  await computed()

  {
    const getRootView = async () => {
      const [AppView, createRootBwlevView, View] = await Promise.all([
        import('./AppView.js').then(takeDefault),
        import('./SessionView.js').then(takeDefault),
        import('dkt/view/View').then(takeDefault),
      ])

      const AppViewChanged = spv.inh(AppView, null, {
        attrs: {
          rootMark: ['input', ':) rootValue'],
          parentMark: ['input', '0__0 parentValue'],
        },
        children_views: {
          user: spv.inh(View, null, {
            attrs: {
              simpleValue: ['input', 'VValue'],
              fromRoot: ['comp', ['< rootMark <<< #']],
              fromParent: ['comp', ['< parentMark <<< ^']],
            },
          }),
        },
      })
      const RootView = createRootBwlevView(AppViewChanged)
      return RootView
    }


    const { whenViewReady, document } = await testingInitView(inited, {
      getRootView,
      document_path: path.resolve(__dirname, './main.html'),
    })

    await whenViewReady()

    expect(document.querySelector('.app .app-main-part')).toMatchSnapshot()
  }
})
