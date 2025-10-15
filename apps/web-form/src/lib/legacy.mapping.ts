type Step1 = {
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName?: string;
  documentType: "Cédula de Ciudadanía" | "Tarjeta de Identidad" | "Pasaporte";
  documentNumber: string;
  email: string;
  phone: string;
};

type Step2 = {
  hasCivica?: boolean;
  civicaNumber?: string;
  userType:
    | "Residente"
    | "MenorEdad"
    | "VisitanteNacional"
    | "VisitanteExtranjero";
};

type Step3 = {
  address: string;
  municipio: string | number;
  comuna?: string;
  barrio?: string;
  ocupacion:
    | "Funcionario Público"
    | "Empleado"
    | "Independiente"
    | "Estudiante"
    | "Desempleado";
  emergencyName: string;
  emergencyPhone: string;
  emergencyKinship: string;
};

function mapDocPrefix(documentType: Step1["documentType"]) {
  switch (documentType) {
    case "Cédula de Ciudadanía":
      return "CC";
    case "Tarjeta de Identidad":
      return "TI";
    case "Pasaporte":
      return "PA";
    default:
      return "CC";
  }
}

/**
 * Construye el payload que espera POST /Account/PostRegisterUser
 * a partir de todos los valores del formulario.
 */
export function mapFormToLegacyUser(step1: Step1, step2: Step2, step3: Step3) {
  const tipDoc = mapDocPrefix(step1.documentType);
  const numDoc = step1.documentNumber.trim();
  const dni = `${tipDoc}${numDoc}`;

  
  const estrategiaId = 4;
  const tipoUso = 4;
  const enabled = true;
  const passwordHash =
    "AQAAAAEAACcQAAAAEKHCM9oY8vrVAam5QBWFM4n1riu+t+StjelVyv4+GKCikunDMGxV4YbgLV3F0Mz9dw==";
  const nowIso = new Date().toISOString();

  const direccion = step3.address;
  const municipio = String(step3.municipio || "");
  const pais = "CO";

  const payload = {
    estrategiaId,
    firstName: `${step1.firstName} ${step1.secondName ?? ""}`.trim(),
    lastName: `${step1.firstLastName} ${step1.secondLastName ?? ""}`.trim(),
    password: passwordHash,
    passwordConfirm: passwordHash,
    username: step1.email,
    id: crypto.randomUUID(),
    telephone: step1.phone,
    dni,
    enabled,
    direccion,
    fechaAlta: nowIso,
    fechaAltaBE: nowIso,

    // Campos fijos / obligatorios en el modelo legacy
    // (no los tenemos en el formulario, así que van con valores por defecto)
    numeroCelular: step1.phone,
    pin: "9999",
    fechaNacimiento: "1900-01-01", //default
    sexo: "N",
    estrato: "0",
    ocupacion: step3.ocupacion,
    empresa: "NOT_SPECIFIED",
    telefonoFijo: "NOT_SPECIFIED",
    departamento: "NOT_SPECIFIED", // default
    municipio,
    pais,
    contacto: step3.emergencyName,
    telefonoContacto: step3.emergencyPhone,

    // Tarjeta/rol (no tenemos serial, así que no usamos)
    numeroTarjeta: "NOT_SPECIFIED",
    tipoUso,
    eMail: step1.email,
    entidad: "NEW_FORM",
    estrategias: [
      {
        disabled: true,
        group: {
          disabled: true,
          name: "NEW_FORM",
        },
        selected: true,
        text: "NEW_FORM",
        value: "NEW_FORM",
      },
    ],
    aceptaTerminos: true,
    aceptaHabeasData: true,
  };

  return payload;
}
