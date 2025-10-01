import { describe, it, expect } from 'vitest'
import * as Module from './avatar'

describe('Avatar component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
