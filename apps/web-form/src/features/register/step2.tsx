"use client";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { Step2Values } from "./schemas";
import { ContractGateSimple } from "./contract-gate-simple";
import { ContractSign } from "./contract-sign";
import { BiometricCapture } from "./biometric-capture";
import { IdDocsUploader } from "./id-docs-uploader";
import { useStepper } from "./stepper";

// union y type guard para documentType
const DOC_TYPES = [
  "Cédula de Ciudadanía",
  "Tarjeta de Identidad",
  "Pasaporte",
] as const;
type DocType = (typeof DOC_TYPES)[number];
function toDocType(v: unknown): DocType {
  return (DOC_TYPES as readonly string[]).includes(v as string)
    ? (v as DocType)
    : "Cédula de Ciudadanía";
}

export function Step2() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<Step2Values>();
  const docType = watch("userType");

  const { getMetadata } = useStepper();

  // trae el documentType del step1 y tipéalo seguro
  useEffect(() => {
    const meta = getMetadata("step1") as { documentType?: unknown } | undefined;
    const dt = toDocType(meta?.documentType);
    setValue("documentType", dt, { shouldValidate: true });
  }, [getMetadata, setValue]);

  // Registra campos seteados por código
  useEffect(() => {
    register("signatureDataUrl");
    register("signedContract");
    register("biometricOk");
    register("biometricImage");
    register("idDoc");
    register("passportFile");
    register("guardianId");
    register("authorizationLetter");
  }, [register]);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tipo de usuario *
          </label>
          {/* Tipo de usuario */}
          <select className="input" {...register("userType")}>
            <option value="Residente">Residente Valle de Aburrá</option>
            <option value="MenorEdad">Menor de Edad</option>
            <option value="VisitanteNacional">Visitante Nacional</option>
            <option value="VisitanteExtranjero">Visitante Extranjero</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center">
          {/* Cívica personalizada opcional */}
          <div className="flex items-center mt-4">
            <label className="">
              <input
                type="checkbox"
                {...register("hasCivica")}
                className={`h-5 w-5 rounded ${errors.hasCivica ? "accent-red-600" : "accent-sky-500"}`}
              />
              &nbsp;
              ¿Tienes Cívica Personalizada?
            </label>
          </div>
          <div className="mt-4">
            {watch("hasCivica") && (
              <input
                // className="input mt-2"
                className={`mt-2 input ${errors.civicaNumber ? "input-error" : ""}`}
                placeholder="Número de Cívica personalizada"
                {...register("civicaNumber")}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          {/* Documentos según tipo */}
            <p className="font-medium mb-2">Tipo de Documento ({docType})</p>
            <IdDocsUploader />
        </div>
      </div>

      {/* Contrato + tiempo de lectura + firma + aceptación */}
      <div className="rounded-xl  p-3 grid gap-3">
        <p className="font-medium">Contrato de Uso del Sistema</p>

        <ContractGateSimple
          onAccept={() =>
            setValue("contractAccepted", true, { shouldValidate: true })
          }
        />

        <label
          className={`flex items-center gap-2 p-2 rounded-md ${
            errors.contractAccepted ? "border border-red-600 bg-red-900/20" : ""
          }`}
        >
          <input
            className={`h-5 w-5 rounded ${errors.contractAccepted ? "accent-red-600" : "accent-sky-500"}`}
            type="checkbox"
            {...register("contractAccepted")}
          />
          Acepto los términos del contrato
        </label>

        <div>
          <p className="text-sm mb-2">Firma del contrato</p>
          <ContractSign
            onChange={(png) =>
              setValue("signatureDataUrl", png, { shouldValidate: true })
            }
            onPdf={(file) =>
              setValue("signedContract", file as any, { shouldValidate: true })
            }
          />
        </div>
        

        {(errors.contractAccepted ||
          errors.signatureDataUrl ||
          errors.signedContract) && (
          <p className="text-red-400 text-sm">
            Debes leer, firmar y aceptar el contrato.
          </p>
        )}
      </div>

      {/* Biometría */}
      <div className="">
        <p className="font-medium mb-2">Verificación Biométrica</p>
        <BiometricCapture
          onOk={(img) => {
            setValue("biometricOk", true, { shouldValidate: true });
            setValue("biometricImage", img, { shouldValidate: true });
          }}
        />
        {(errors.biometricOk || errors.biometricImage) && (
          <p className="text-red-400 text-sm">Biometría obligatoria.</p>
        )}
      </div>

      {/* Errores generales */}
      <div className="text-red-400 text-sm">
        {Object.values(errors).map(
          (e, i) => e && <div key={i}>{String(e.message)}</div>
        )}
      </div>
    </div>
  );
}
