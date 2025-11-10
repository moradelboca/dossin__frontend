/**
 * Utility functions for string manipulation
 */

/**
 * Converts a string to UpperCamelCase format
 * Examples:
 * - "customer name" -> "CustomerName"
 * - "order_number" -> "OrderNumber"
 * - "delivery-date" -> "DeliveryDate"
 * - "customerName" -> "CustomerName"
 */
export function toUpperCamelCase(input: string): string {
  if (!input) return '';
  
  // Remove leading/trailing whitespace
  const trimmed = input.trim();
  
  // Split by common delimiters: space, underscore, hyphen
  const words = trimmed.split(/[\s_-]+/);
  
  // Capitalize first letter of each word
  const camelCased = words
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  
  return camelCased;
}

/**
 * Formats a value based on the data type
 */
export function formatValueByType(value: any, tipo: string): string {
  if (value === null || value === undefined || value === '') return '';
  
  switch (tipo) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    case 'date':
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          return date.toLocaleDateString('es-AR');
        } catch {
          return value;
        }
      }
      return value;
    case 'text':
    default:
      return String(value);
  }
}

/**
 * Parses a value from string to the appropriate type
 */
export function parseValueByType(value: string, tipo: string): string | number {
  if (!value) return '';
  
  switch (tipo) {
    case 'number':
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    case 'date':
    case 'text':
    default:
      return value;
  }
}

