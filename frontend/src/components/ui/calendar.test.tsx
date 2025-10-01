import { describe, it, expect } from 'vitest'
import * as Module from './calendar'

describe('Calendar component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
