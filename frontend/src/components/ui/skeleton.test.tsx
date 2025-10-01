import { describe, it, expect } from 'vitest'
import * as Module from './skeleton'

describe('Skeleton component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
