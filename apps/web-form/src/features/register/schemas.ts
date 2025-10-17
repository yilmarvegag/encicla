import { z } from "zod";
import { COMP1_OPTIONS, LETRA_OPTIONS } from "../../utils/address";

/* STEP 1 */
const emailField = z
  .email("Correo inválido")
  .trim()
  .min(8, "Correo requerido")
  .transform((v) => v.toLowerCase());

export const step1Schema = z
  .object({
    firstName: z.string().min(3, "Mínimo 3 caracteres"),
    secondName: z.string().optional(),
    firstLastName: z.string().min(3, "Mínimo 3 caracteres"),
    secondLastName: z.string().optional(),
    documentType: z.enum([
      "CC",
      "TI",
      "CE",
      "PA",
    ]),
    documentNumber: z.string().min(8, "Mínimo 8 caracteres"),
    email: emailField,
    emailConfirm: emailField,
    phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').regex(/^\d+$/, "Solo números"),
    habeas: z.boolean().refine((v) => v, "Debes aceptar el Habeas Data"),
    terms: z
      .boolean()
      .refine((v) => v, "Debes aceptar los Términos y Condiciones"),

    // Gate para OTP verificado
    // otpVerified: z.boolean().refine(v => v, 'Debes verificar el OTP'),
  })
  .superRefine((val, ctx) => {
    if (val.email !== val.emailConfirm) {
      ctx.addIssue({
        code: "custom",
        path: ["emailConfirm"], // 👈 el error cae en el campo de confirmación
        message: "Los correos no coinciden",
      });
    }
  });
export type Step1Values = z.infer<typeof step1Schema>;

/* STEP 2 */
export const step2Schema = z
  .object({
    documentType: z.enum([
      "CC",
      "TI",
      "CE",
      "PA",
    ]),
    userType: z.enum([
      "Residente",
      "MenorEdad",
      "VisitanteNacional",
      "VisitanteExtranjero",
    ]),

    hasCivica: z.boolean().default(false),
    civicaNumber: z.string().optional(),

    contractAccepted: z.boolean().refine((v) => v, "Debes aceptar el contrato"),
    signatureDataUrl: z.string().min(50, "Debes firmar el contrato"),
    signedContract: z.any(),

    biometricOk: z
      .boolean()
      .refine((v) => v, "Debes completar la verificación biométrica"),
    biometricImage: z.string().min(50, "Captura biométrica requerida"),

    // uploads
    idDoc: z.any().optional(),
    passportFile: z.any().optional(),
    guardianId: z.any().optional(), // documento acudiente
    authorizationLetter: z.any().optional(), // carta autorización
  })
  .superRefine((v, ctx) => {
    switch (v.userType) {
      case "Residente":
        if (!v.idDoc)
          ctx.addIssue({
            code: "custom",
            path: ["idBack"],
            message: "Adjunta el documento (ambas caras)",
          });
        break;

      case "VisitanteNacional":
        if (!v.idDoc)
          ctx.addIssue({
            code: "custom",
            path: ["idDoc"],
            message: "Adjunta el documento (ambas caras)",
          });
        break;

      case "VisitanteExtranjero":
        if (!v.passportFile)
          ctx.addIssue({
            code: "custom",
            path: ["passportFile"],
            message: "Adjunta el pasaporte (PDF o imagen)",
          });
        break;

      case "MenorEdad":
        // tarjeta de identidad (usamos idDoc) + acudiente + carta
        if (!v.idDoc)
          ctx.addIssue({
            code: "custom",
            path: ["idDoc"],
            message: "Adjunta la tarjeta de identidad (ambas caras)",
          });
        if (!v.guardianId)
          ctx.addIssue({
            code: "custom",
            path: ["guardianId"],
            message: "Adjunta el documento del acudiente",
          });
        if (!v.authorizationLetter)
          ctx.addIssue({
            code: "custom",
            path: ["authorizationLetter"],
            message: "Adjunta la carta de autorización",
          });
        break;
    }
  });

export type Step2Values = z.infer<typeof step2Schema>;

export const numeric = {
  required: (message?: string) =>
    z
      .coerce
      .number({
        error: message || "Solo números permitidos",
      })
      .min(1, "Este campo es requerido"),
};

/* STEP 3 — dirección estructurada */
export const step3Schema = z.object({
  viaTipo: z.enum(["Calle", "Carrera", "Transversal", "Diagonal", "Avenida"]),
  viaNumero: numeric.required("Solo números"),
  viaLetra: z.enum(LETRA_OPTIONS).default("No aplica"),
  viaComp: z.enum(COMP1_OPTIONS).default("No aplica"),
  numero: numeric.required("Solo números"),
  letra: z.enum(LETRA_OPTIONS).default("No aplica"),
  viaComp2: z.enum(COMP1_OPTIONS).default("No aplica"),
  compNum: numeric.required("Solo números"),
  comp2: z.enum(LETRA_OPTIONS).default("No aplica"),
  apto: z.string().min(1, "Indica apto/casa/interior o N/A"),

  // Derivado:
  address: z.string().min(8, "Dirección incompleta"),

  municipio: z.string().min(1, "Selecciona un municipio"),
  comuna: z.string().min(1, "Selecciona una comuna"),
  barrio: z.string().min(1, "Selecciona un barrio"),

  ocupacion: z.enum([
    "Funcionario Público",
    "Empleado",
    "Independiente",
    "Estudiante",
    "Desempleado",
  ]),
  emergencyName: z.string().min(3, "Nombre requerido"),
  emergencyPhone: z.string().regex(/^\d{7,10}$/, "Teléfono inválido").startsWith("3", "Debe iniciar con 3"),
  emergencyKinship: z.string("Solo letras").min(3, "Parentesco requerido"),
  // otpCode: z.string().regex(/^\d{6}$/, "OTP inválido (6 dígitos)"),
});
export type Step3Values = z.infer<typeof step3Schema>;
