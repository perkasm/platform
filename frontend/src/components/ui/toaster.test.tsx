import { describe, it, expect } from 'vitest'
import * as Module from './toaster'

describe('Toaster module', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
