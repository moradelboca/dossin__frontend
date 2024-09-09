import Sidenav, { NavBody } from "./Sidenav";
import CardGridInconvenientes from "./CardGridInconvenientes";

export function ContainerHome() {
  return (
    <Sidenav>
      <NavBody title="Inconvenientes" />
      <CardGridInconvenientes />
    </Sidenav>
  );
}
