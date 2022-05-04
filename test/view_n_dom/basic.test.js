import path from 'path'
import { expect, test } from '@jest/globals'
import model from 'dkt/model'
import modernRoot from '../modernRoot'
import testingInit from '../testingInit'
import testingInitView from './testingInitView'

const takeDefault = ({ default: val }) => val

const getRootView = async () => {
  const [AppView, createRootBwlevView] = await Promise.all([
    import('./AppView.js').then(takeDefault),
    import('./SessionView.js').then(takeDefault),
  ])
  const RootView = createRootBwlevView(AppView)
  return RootView
}

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
  })

  const inited = await testingInit(AppRoot, {}, { proxies: true })

  const { computed } = inited

  await computed()

  {
    const { whenViewReady, document } = await testingInitView(inited, {
      getRootView,
      document_path: path.resolve(__dirname, './main.html'),

    })

    await whenViewReady()

    expect(document.querySelector('.app .app-main-part')).toMatchSnapshot()
  }
})
