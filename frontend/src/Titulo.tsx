function Titulo() {
  const nombre = "Matias";
  if (nombre) {
    return <h1> Hola {nombre}</h1>;
  }
  return <h1>Hola Mundo</h1>; //jsx
}

export default Titulo;
