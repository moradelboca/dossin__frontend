import Navbar from "./Navbar";
import Navside from "./Navside";
import { useAuth } from "../autenticacion/ContextoAuth";

// Interfaz de props para Nav
interface NavProps {
  navAbierto: boolean;
  setNavAbierto: React.Dispatch<React.SetStateAction<boolean>>;
  anchoAbierto: number;
  anchoCerrado: number;
}

export function Nav({ navAbierto, setNavAbierto, anchoAbierto, anchoCerrado }: NavProps) {
  const transicion = "width 0.3s ease-in-out";

  // Función para alternar el estado
  const handleClickToggleNav = () => {
    setNavAbierto((prev) => !prev);
  };

  // Función para cerrar el nav (útil en mobile al hacer clic fuera)
  const handleCloseNav = () => {
    setNavAbierto(false);
  };

  const { user } = useAuth();
  const rolId = user?.rol?.id;

  return (
    <nav>
      <Navbar
        navAbierto={navAbierto}
        anchoAbierto={anchoAbierto}
        anchoCerrado={anchoCerrado}
        transicion={transicion}
        handleClickToggleNav={handleClickToggleNav}
      />
      {rolId !== 3 && (
        <Navside
          navAbierto={navAbierto}
          anchoAbierto={anchoAbierto}
          anchoCerrado={anchoCerrado}
          transicion={transicion}
          onClose={handleCloseNav}
        />
      )}
    </nav>
  );
}
