import { describe, it, expect } from 'vitest';
import { parseAgdDescargasCsv, parseBungeDescargasCsv, parseDescargasCsv } from './parsers';

describe('parseAgdDescargasCsv', () => {
  it('should parse AGD CSV correctly', () => {
    const csvContent = `Fecha,NRO CP/CTG,Producto,Cosecha,Kg Entregados
17/09/2025,10126525579,SOJA,2425,30970
17/09/2025,10126525407,SOJA,2425,30228
12/09/2025,10126444014,SOJA,2425,29320`;

    const result = parseAgdDescargasCsv(csvContent);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      fecha: '17/09/2025',
      grano: 'SOJA',
      numeroCTG: '10126525579',
      kgDescargados: 30970,
      proveedor: 'AGD'
    });
    expect(result[1]).toEqual({
      fecha: '17/09/2025',
      grano: 'SOJA',
      numeroCTG: '10126525407',
      kgDescargados: 30228,
      proveedor: 'AGD'
    });
  });

  it('should handle numbers with commas and dots', () => {
    const csvContent = `Fecha,NRO CP/CTG,Producto,Cosecha,Kg Entregados
17/09/2025,10126525579,SOJA,2425,"30.970,50"`;

    const result = parseAgdDescargasCsv(csvContent);

    expect(result).toHaveLength(1);
    expect(result[0].kgDescargados).toBe(30970.50);
  });

  it('should skip invalid rows', () => {
    const csvContent = `Fecha,NRO CP/CTG,Producto,Cosecha,Kg Entregados
17/09/2025,10126525579,SOJA,2425,30970
invalid-date,123,SOJA,2425,1000
17/09/2025,,SOJA,2425,2000
17/09/2025,10126525579,,2425,3000`;

    const result = parseAgdDescargasCsv(csvContent);

    expect(result).toHaveLength(1);
    expect(result[0].numeroCTG).toBe('10126525579');
  });

  it('should return empty array for invalid CSV', () => {
    const result = parseAgdDescargasCsv('invalid csv content');
    expect(result).toEqual([]);
  });
});

describe('parseBungeDescargasCsv', () => {
  it('should parse Bunge format correctly and extract grain from header', () => {
    const textContent = `"Producto: GIRASOL         Corredor: Directo"
"CADEWOR                   Kgs. desc: 3.514.771 ; Kgs. trasnf: 0 ; Diferencia:"
"Cliente:                  Resumen:"
"SA                        3.514.771"
"Planta: TANCACHA"
""
""
"Carta"
"Kgs. Kgs. Kgs. Kgs. Kgs. Kgs.   Kgs.                                Otras Kgs. Kgs. Carta porte /                                           Condición"
"Fecha      Recibo      Origen     Cosecha                                                        Contratos                                          porte    Chasis Acoplado Cobertura"
"Desc Zar Hum Cal Serv Volatil Aplicados                            mermas Neto Transf. CTG elect.                                             Flete"
"elect."
"30714128678"
"00000-"
"19/03/2025 22189190 PEDERNERA         2025    28.700      0       0   0     0      0      28.700 99.1000400393         0 28.700     0 010121936102            GOF930 NPF176- CADEWOR           FOB"
"00002607"
"SA"
"30714128678"
"00000-"
"20/03/2025 22200617 PEDERNERA         2025    31.910      0       0   0     0      0      31.910 99.1000400393         0 31.910     0 010121935893          OJD361 AE692DL - CADEWOR           FOB"`;

    const result = parseBungeDescargasCsv(textContent);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      fecha: '19/03/2025',
      grano: 'GIRASOL', // Ahora extrae el grano correcto del header
      numeroCTG: '10121936102', // Ahora extrae el CTG correcto de 11 dígitos (sin 0 inicial)
      kgDescargados: 28700,
      proveedor: 'Bunge'
    });
    expect(result[1]).toEqual({
      fecha: '20/03/2025',
      grano: 'GIRASOL', // Ahora extrae el grano correcto del header
      numeroCTG: '10121935893', // Ahora extrae el CTG correcto de 11 dígitos (sin 0 inicial)
      kgDescargados: 31910,
      proveedor: 'Bunge'
    });
  });

  it('should handle different number formats', () => {
    const textContent = `"19/03/2025 22189190 PEDERNERA 2025 1.234.567,89 010121936102"`;

    const result = parseBungeDescargasCsv(textContent);

    expect(result).toHaveLength(1);
    expect(result[0].kgDescargados).toBe(1234567.89);
    expect(result[0].numeroCTG).toBe('10121936102');
  });

  it('should skip lines that do not match pattern', () => {
    const textContent = `"Header line"
"19/03/2025 22189190 PEDERNERA 2025 28700 010121936102"
"Invalid line without proper format"
"20/03/2025 22200617 PEDERNERA 2025 31910 010121935893"`;

    const result = parseBungeDescargasCsv(textContent);

    expect(result).toHaveLength(2);
    expect(result[0].numeroCTG).toBe('10121936102');
    expect(result[1].numeroCTG).toBe('10121935893');
  });

  it('should handle missing grain in header and use default', () => {
    const textContent = `"Some other header"
"19/03/2025 22189190 PEDERNERA 2025 28700 010121936102"`;

    const result = parseBungeDescargasCsv(textContent);

    expect(result).toHaveLength(1);
    expect(result[0].grano).toBe('DESCONOCIDO');
    expect(result[0].numeroCTG).toBe('10121936102');
  });

  it('should return empty array for empty content', () => {
    const result = parseBungeDescargasCsv('');
    expect(result).toEqual([]);
  });
});

describe('parseDescargasCsv', () => {
  it('should call correct parser for AGD', () => {
    const csvContent = `Fecha,NRO CP/CTG,Producto,Cosecha,Kg Entregados
17/09/2025,10126525579,SOJA,2425,30970`;

    const result = parseDescargasCsv(csvContent, 'AGD');

    expect(result).toHaveLength(1);
    expect(result[0].proveedor).toBe('AGD');
  });

  it('should call correct parser for Bunge', () => {
    const textContent = `"19/03/2025 22189190 PEDERNERA 2025 28700 010121936102"`;

    const result = parseDescargasCsv(textContent, 'Bunge');

    expect(result).toHaveLength(1);
    expect(result[0].proveedor).toBe('Bunge');
    expect(result[0].numeroCTG).toBe('10121936102');
  });

  it('should throw error for unsupported provider', () => {
    expect(() => {
      parseDescargasCsv('test', 'InvalidProvider' as any);
    }).toThrow('Proveedor no soportado: InvalidProvider');
  });
});
