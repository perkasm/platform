import { describe, it, expect } from 'vitest'
import * as Module from './sidebar'

describe('Sidebar component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
