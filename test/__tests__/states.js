/* eslint-disable fp/no-mutation, fp/no-let */
import pvUpdate from 'pv/updateAttr'
import pvState from 'pv/getAttr'

import init from 'test/init'

describe('states', () => {
  let testApp

  function getTestAppState(attr) {
    return pvState(testApp.app_model, attr)
  }

  function updateTestAppState(attr, value) {
    return pvUpdate(testApp.app_model, attr, value)
  }

  describe('input attrs', () => {
    beforeEach(async () => {
      testApp = await init({
        attrs: {
          first_name: ['input', 'Alice'],
        },
      })
    })

    describe('initial value', () => {
      it('should be undefined if no input value was provided', () => {
        expect(getTestAppState('last_name')).toBeUndefined()
      })

      it('should be taken from the input attr', async () => {
        expect(getTestAppState('first_name')).toBe('Alice')
      })
    })

    describe('update', () => {
      it('could be performed outside steps routine', async () => {
        await updateTestAppState('first_name', 'Bob')
        await updateTestAppState('last_name', 'Brooks')
        expect(getTestAppState('first_name')).toBe('Bob')
        expect(getTestAppState('last_name')).toBe('Brooks')
      })

      it('could be performed inside steps routine', async () => {
        await testApp.steps([
          () => {
            updateTestAppState('first_name', 'Bob')
            updateTestAppState('last_name', 'Brooks')
          },
        ])
        expect(getTestAppState('first_name')).toBe('Bob')
        expect(getTestAppState('last_name')).toBe('Brooks')
      })
    })
  })

  describe('computed attrs', () => {
    const computeFn = jest.fn()
    computeFn.mockImplementation((firstName, lastName) => `${firstName} ${lastName}`)

    beforeEach(async () => {
      computeFn.mockClear()

      testApp = await init({
        attrs: {
          first_name: ['input', 'Alice'],
          full_name: ['comp',
            ['first_name', 'last_name'],
            computeFn,
          ],
        },
      })
    })

    describe('compute fn', () => {
      it('should be called twice on app create', () => {
        expect(computeFn).toHaveBeenCalledTimes(2)
      })

      it('should receive input values', () => {
        expect(computeFn).toHaveBeenCalledWith('Alice', undefined)
      })

      it('should be called 3 times on a single argument update', async () => {
        await updateTestAppState('last_name', 'Anderson')
        expect(computeFn).toHaveBeenCalledTimes(3)
      })

      it('should be called 3 times on argument update within steps', async () => {
        await testApp.steps([
          () => updateTestAppState('last_name', 'Anderson'),
        ])
        expect(computeFn).toHaveBeenCalledTimes(3)
      })

      it('should be called 4 times on multiple arguments update within steps', async () => {
        await testApp.steps([
          () => updateTestAppState('first_name', 'Bob'),
          () => updateTestAppState('last_name', 'Brooks'),
        ])
        expect(computeFn).toHaveBeenCalledTimes(4)
      })

      it('should be called 4 times on multiple arguments update within a single step', async () => {
        await testApp.steps([
          () => {
            updateTestAppState('first_name', 'Bob')
            updateTestAppState('last_name', 'Brooks')
          },
        ])
        expect(computeFn).toHaveBeenCalledTimes(4)
        expect(computeFn.mock.calls).toEqual([
          ['Alice', undefined],
          ['Alice', undefined],
          ['Bob', undefined],
          ['Bob', 'Brooks'],
        ])
      })
    })

    describe('initial value', () => {
      it('should be calculated', () => {
        expect(getTestAppState('full_name')).toBe('Alice undefined')
      })
    })

    describe('update attempt', () => {
      it.skip('should throw an error', async () => {
        expect.assertions(1)
        try {
          await Promise.reject(new Error('WTF?'))
          await testApp.steps([
            () => updateTestAppState('full_name', 'Alice Anderson'),
          ])
        } catch (e) {
          expect(e).toEqual(expect.anything())
        }
      })
    })

    describe('arguments update', () => {
      describe('outside steps', () => {
        it('should cause update', async () => {
          updateTestAppState('first_name', 'Bob')
          updateTestAppState('last_name', 'Brooks')
          await Promise.resolve()
          expect(getTestAppState('full_name')).toEqual('Bob Brooks')
        })
      })

      describe('with steps', () => {
        it('should cause update', async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', 'Bob'),
            () => updateTestAppState('last_name', 'Brooks'),
          ])
          expect(getTestAppState('full_name')).toEqual('Bob Brooks')
        })
      })
    })
  })

  describe('prechecked computed attrs', () => {
    const computeFn = jest.fn()
    computeFn.mockImplementation((firstName, lastName) => `${firstName} ${lastName}`)

    beforeEach(async () => {
      computeFn.mockClear()
      testApp = await init({
        attrs: {
          full_name: ['comp',
            ['&first_name', 'last_name'],
            computeFn,
          ],
        },
      })
    })

    describe('compute fn', () => {
      it('should not be called if precondition fails', () => {
        expect(computeFn).not.toHaveBeenCalled()
      })

      it('should not be called on attr update if precheck fails', async () => {
        await testApp.steps([
          () => updateTestAppState('last_name', 'Anderson'),
        ])
        expect(computeFn).not.toHaveBeenCalled()
      })

      it('should be called once on precheck pass', async () => {
        await testApp.steps([
          () => updateTestAppState('first_name', 'Alice'),
        ])
        expect(computeFn).toHaveBeenCalledTimes(1)
        expect(computeFn.mock.calls).toEqual([
          ['Alice', undefined],
        ])
        expect(getTestAppState('full_name')).toEqual('Alice undefined')
      })

      describe('should be called once when precheck attr', () => {
        afterEach(() => {
          expect(computeFn).toHaveBeenCalledTimes(1)
        })

        it('changes to empty string', async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', ''),
          ])
        })

        it('changes to NaN', async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', NaN),
          ])
        })

        it('changes to false', async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', false),
          ])
        })

        it('changes to 0', async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', NaN),
          ])
        })
      })

      describe('should not be called when precheck attr', () => {
        beforeEach(async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', 'Alice'),
          ])
          expect(computeFn).toHaveBeenCalledTimes(1)
          computeFn.mockClear()
        })

        afterEach(() => {
          expect(computeFn).not.toHaveBeenCalled()
        })

        it('changes to undefined', async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', undefined),
          ])
        })

        it('changes to null', async () => {
          await testApp.steps([
            () => updateTestAppState('first_name', null),
          ])
        })
      })
    })
  })
})
