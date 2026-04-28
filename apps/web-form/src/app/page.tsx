"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useStepper, utils } from "@/features/register/stepper";
import { Step1 } from "@/features/register/step1";
import { Step2 } from "@/features/register/step2";
import { Step3 } from "@/features/register/step3";

// import { checkDocumentExists, sendOtp, submitRegistration, verifyOtp } from "@/lib/form.service";
import {
  extractIdFromResponse,
  getUserByDni,
  // attachRoleToUser,
  submitRegistration,
  uploadRegistrationFiles,
  // uploadRegistrationFiles,
} from "@/lib/form.service";
import { StepsHeader } from "@/components/ui/StepsHeader";
import { mapFormToLegacyUser } from "@/lib/legacy.mapping";
import { notify } from "@/lib/toast";
import { toast } from "react-toastify";
import { dataUrlToFile } from "@/lib/formdata.util";
import { ApiResponseLegacy, ResponseData } from "@/types/api.type";

export default function Page() {
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(stepper.current.schema),
    shouldUnregister: false,
    defaultValues: {
      contractAccepted: false,
      documentType: "CC",
      userType: "Residente",
      hasCivica: false,
      ocupacion: "Funcionario Público",
    } as any,
  });

  // const otpSent = React.useRef(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onInvalid = (errs: any) => {
    // console.warn("[INVALID]", errs);
    const first = Object.keys(errs)[0];
    if (first) form.setFocus(first as any);
    notify.warn("Revisa los campos marcados en obligatorios.");
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    let idMsj;
    // console.info("[FORM VALUES]", values);
    try {
      const allFields = form.getValues();
      if (stepper.isLast) {
        idMsj = toast.loading("Enviando tu registro…");

        // Validar que el teléfono de contacto y el de emergencia no sean iguales
        if (
          allFields.phone &&
          allFields.emergencyPhone &&
          allFields.phone === allFields.emergencyPhone
        ) {
          form.setError("emergencyPhone" as any, {
            type: "manual",
            message:
              "El teléfono de emergencia debe ser diferente al teléfono de contacto.",
          });
          toast.dismiss(idMsj);
          notify.error(
            "El teléfono de emergencia debe ser diferente al teléfono de contacto.",
          );
          return;
        }

        const step1 = {
          firstName: allFields.firstName,
          secondName: allFields.secondName,
          firstLastName: allFields.firstLastName,
          secondLastName: allFields.secondLastName,
          documentType: allFields.documentType,
          documentNumber: allFields.documentNumber,
          email: allFields.email,
          phone: allFields.phone,
          sex: allFields.sexAssignedAtBirth,
          pin: allFields.pin,
          habeas: allFields.habeas,
          terms: allFields.terms,
        };

        const step2 = {
          hasCivica: allFields.hasCivica,
          civicaNumber: allFields.civicaNumber,
          userType: allFields.userType,
        };

        const step3 = {
          address: allFields.address,
          municipio: allFields.municipioNombre,
          comuna: allFields.comuna,
          barrio: allFields.barrio,
          ocupacion: allFields.ocupacion,
          emergencyName: allFields.emergencyName,
          emergencyPhone: allFields.emergencyPhone,
          emergencyKinship: allFields.emergencyKinship,
        };

        const payload = mapFormToLegacyUser(step1, step2, step3);
        const resp: ApiResponseLegacy = await submitRegistration(payload);
        // console.info(resp);
        if (resp?.isSuccess) {
          toast.dismiss(idMsj);
          const userId = extractIdFromResponse(resp);
          // 3) subir archivos
          const {
            idFront,
            idBack,
            passportFile,
            guardianId,
            authorizationLetter,
            signedContract,
          } = allFields;

          // const files = await uploadRegistrationFiles(userId || "999", {
          await uploadRegistrationFiles(userId || "999", {
            idFront,
            idBack,
            passportFile,
            guardianId,
            authorizationLetter,
            signedContract,
            biometricImage: (typeof allFields.biometricImage === "string"
              ? dataUrlToFile(allFields.biometricImage, "biometric.jpg")
              : allFields.biometricImage) as File | undefined,
            signaturePng: (typeof allFields.signatureDataUrl === "string"
              ? dataUrlToFile(allFields.signatureDataUrl, "signature.png")
              : allFields.signaturePng) as File | undefined,
          });
          // console.info("[FILES UPLOADED]", files);

          toast.dismiss(idMsj);
          notify.success(resp.message || "¡Formulario enviado!");
          //
          setTimeout(() => {
            form.reset();
            stepper.reset();
          }, 100);
          //
          return;
        } else {
          // console.error(resp.message);
          // alert(resp.message || "Error enviando el formulario");
          toast.dismiss(idMsj);
          notify.error(resp.message ?? "No se pudo completar el registro");
          return;
        }
      }

      //
      if (stepper.isFirst) {
        // 1) Validación: ¿ya existe usuario con este documento?
        idMsj = toast.loading("Validando datos, un momento por favor.");
        const docType = allFields.documentType;
        const docNumber = allFields.documentNumber;
        const email = allFields.email;

        const response: ResponseData<boolean> = await getUserByDni(
          docType,
          docNumber,
          email,
        );
        // console.warn(response);
        toast.dismiss()
        if (response.status == 200 && response.data === true) {
          // La API respondió 200 con JSON: el usuario ya existe -> NO continuar
          let nameInput = "documentNumber";
          if (response.message?.includes("corre")) {
            nameInput = "email";
          }

          form.setError(nameInput as any, {
            type: "manual",
            message: response.message,
          });

          return;
        }
      }

      // Paso 2 → paso 3
      stepper.next();
    } catch (err) {
      console.error(err);
      notify.error("Ocurrió un problema. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
      // toast.dismiss(idMsj);
    }
  };

  return (
    <main className="container-safe pt-4 md:pt-6">
      {/* Título compacto en móvil */}
      <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-6">
        Proceso de Inscripción
      </h1>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-4 md:space-y-6 border border-gray-500 p-5 rounded-3xl shadow-sm"
        >
          {/* Header con pasos responsive */}
          <StepsHeader currentIndex={currentIndex} />

          {/* Contenido del paso con padding responsivo */}
          <section className="rounded-2xl  p-4 sm:p-6 md:p-8 shadow-sm">
            {stepper.switch({
              step1: () => <Step1 />,
              step2: () => <Step2 />,
              step3: () => <Step3 />,
            })}
          </section>

          {/* Acciones: barra fija en móvil, inline en desktop */}
          <>
            {/* Desktop / md+: acciones en flujo */}
            <div className="hidden md:flex gap-4 justify-between">
              {stepper.isFirst ? (
                <span />
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary sm:w-full lg:w-1/4"
                  onClick={stepper.prev}
                  disabled={stepper.isFirst}
                >
                  Atrás
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className={`btn btn-primary w-3/4 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {stepper.isLast ? "Guardar información" : "Siguiente"}
              </button>
            </div>

            {/* Mobile: barra fija inferior */}
            <div className="md:hidden sticky bottom-0 left-0 right-0  py-3 px-4 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                {stepper.isFirst ? (
                  <span />
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary w-1/4"
                    onClick={stepper.prev}
                    disabled={stepper.isFirst}
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="btn btn-primary w-3/4"
                >
                  {stepper.isLast ? "Guardar información" : "Siguiente"}
                </button>
              </div>
            </div>
          </>
        </form>
      </FormProvider>
    </main>
  );
}
