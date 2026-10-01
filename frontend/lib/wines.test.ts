import { describe, expect, it } from 'vitest'
import { catalogStill } from './wines'

describe('catalogStill', () => {
  it('maps shared beer.png to the SKU still', () => {
    expect(catalogStill('beer-cauce-ambar', '/images/city-wine/beer.png')).toBe(
      '/images/city-wine/beer-cauce-ambar.png',
    )
  })

  it('maps shared glassware.png to the SKU still', () => {
    expect(catalogStill('glass-copa-sommelier', '/images/city-wine/glassware.png')).toBe(
      '/images/city-wine/glass-copa-sommelier.png',
    )
  })

  it('keeps a staff-uploaded url', () => {
    expect(catalogStill('beer-bruma', 'https://cdn.example/custom.png')).toBe('https://cdn.example/custom.png')
  })
})
