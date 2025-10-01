import { describe, it, expect } from 'vitest'
import * as Module from './command'

describe('Command component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
