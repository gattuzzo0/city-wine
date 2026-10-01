export function nextStockAfterSale(stock: number, qty: number): number {
  if (!Number.isInteger(stock) || !Number.isInteger(qty) || qty < 1) {
    throw new Error('Cantidad inválida')
  }
  if (stock < qty) throw new Error('No hay suficiente inventario')
  return stock - qty
}
