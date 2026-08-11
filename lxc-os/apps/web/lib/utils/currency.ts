/**
 * Formats a number as INR currency.
 * @param amount The numeric value to format.
 * @param compact If true, uses compact notation (e.g., 10M, 1B).
 * @returns Formatted currency string.
 */
export const formatCurrency = (amount: number | string, compact: boolean = false) => {
  let num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  
  if (num === undefined || num === null || isNaN(num)) {
      return '₹0';
  }

  const absNum = Math.abs(num);

  if (compact) {
      if (absNum < 1000) {
          return `₹${absNum.toLocaleString('en-IN')}`;
      }

      const units = [
          { value: 1e21, symbol: 'S' },
          { value: 1e18, symbol: 'P' },
          { value: 1e15, symbol: 'Q' },
          { value: 1e12, symbol: 'T' },
          { value: 1e9, symbol: 'B' },
          { value: 1e6, symbol: 'M' },
          { value: 1e3, symbol: 'K' }
      ];

      for (let i = 0; i < units.length; i++) {
          if (absNum >= units[i].value) {
              const value = absNum / units[i].value;
              const formatted = value >= 100 ? value.toFixed(0) : value.toFixed(1);
              return `₹${formatted.replace(/\.0$/, '')}${units[i].symbol}`;
          }
      }
      
      return `₹${(absNum / 1e9).toFixed(0)}B`;
  }

  return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
  }).format(absNum);
};
