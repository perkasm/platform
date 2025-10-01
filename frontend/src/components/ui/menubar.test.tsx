import { describe, it, expect } from 'vitest'
import * as Module from './menubar'

describe('Menubar component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
