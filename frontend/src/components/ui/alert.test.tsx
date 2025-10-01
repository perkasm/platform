import { describe, it, expect } from 'vitest'
import * as Module from './alert'

describe('Alert component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
