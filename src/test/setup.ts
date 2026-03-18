import '@testing-library/jest-dom'

// jsdom no implementa createObjectURL/revokeObjectURL por defecto
if (typeof URL.createObjectURL !== "function") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (URL as any).createObjectURL = () => "blob:mock";
}
if (typeof URL.revokeObjectURL !== "function") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (URL as any).revokeObjectURL = () => {};
}







