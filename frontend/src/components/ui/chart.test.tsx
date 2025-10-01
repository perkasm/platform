import { describe, it, expect } from 'vitest'
import * as Module from './chart'

describe('Chart component', () => {
  it('module loads', () => {
    expect(Module).toBeTruthy()
  })
})
