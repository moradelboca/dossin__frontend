
import React from "react";
import AutocompleteEmpresas from "../autocompletes/AutocompleteEmpresas";

type EmpresaField = {
  key: string;
  label: string;
  rol: string;
};

interface FormFieldsProps {
  data: any;
  errors: any;
  setData: (data: any) => void;
  errorTitular?: any;
  empresaFields: EmpresaField[]; // Se agrega la propiedad
}

const ContratoFormFields: React.FC<FormFieldsProps> = ({
  data,
  errors,
  setData,
  errorTitular,
}) => {
  return (
    <>
      <AutocompleteEmpresas
        value={data.titularCartaDePorte || null}
        onChange={(newValue) =>
          setData({ ...data, titularCartaDePorte: newValue })
        }
        error={!!errors.titularCartaDePorte || !!errorTitular}
        helperText={errors.titularCartaDePorte || errorTitular || ""}
        labelText="Titular Carta de Porte"
        rolEmpresa="remitente comercial" 
      />
      <AutocompleteEmpresas
        value={data.remitenteProductor || null}
        onChange={(newValue) =>
          setData({ ...data, remitenteProductor: newValue })
        }
        labelText="Remitente Productor"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.remitenteVentaPrimaria || null}
        onChange={(newValue) =>
          setData({ ...data, remitenteVentaPrimaria: newValue })
        }
        labelText="Remitente Venta Primaria"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.remitenteVentaSecundaria || null}
        onChange={(newValue) =>
          setData({ ...data, remitenteVentaSecundaria: newValue })
        }
        labelText="Remitente Venta Secundaria"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.remitenteVentaSecundaria2 || null}
        onChange={(newValue) =>
          setData({ ...data, remitenteVentaSecundaria2: newValue })
        }
        labelText="Remitente Venta Secundaria 2"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.corredorVentaPrimaria || null}
        onChange={(newValue) =>
          setData({ ...data, corredorVentaPrimaria: newValue })
        }
        labelText="Corredor Venta Primaria"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.corredorVentaSecundaria || null}
        onChange={(newValue) =>
          setData({ ...data, corredorVentaSecundaria: newValue })
        }
        labelText="Corredor Venta Secundaria"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.representanteEntregador || null}
        onChange={(newValue) =>
          setData({ ...data, representanteEntregador: newValue })
        }
        labelText="Representante Entregador"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.representanteRecibidor || null}
        onChange={(newValue) =>
          setData({ ...data, representanteRecibidor: newValue })
        }
        labelText="Representante Recibidor"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.destinatario || null}
        onChange={(newValue) =>
          setData({ ...data, destinatario: newValue })
        }
        labelText="Destinatario"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.destino || null}
        onChange={(newValue) =>
          setData({ ...data, destino: newValue })
        }
        labelText="Destino"
        rolEmpresa="transportista"
      />
      <AutocompleteEmpresas
        value={data.intermediarioDeFlete || null}
        onChange={(newValue) =>
          setData({ ...data, intermediarioDeFlete: newValue })
        }
        labelText="Intermediario de Flete"
        rolEmpresa="remitente comercial"
      />
      <AutocompleteEmpresas
        value={data.fletePagador || null}
        onChange={(newValue) =>
          setData({ ...data, fletePagador: newValue })
        }
        labelText="Flete Pagador"
        rolEmpresa="remitente comercial"
      />
    </>
  );
};

export default ContratoFormFields;
