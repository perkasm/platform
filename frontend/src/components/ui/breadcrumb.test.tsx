import { describe, it, expect } from 'vitest'
import * as Module from './breadcrumb'

describe('Breadcrumb component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
