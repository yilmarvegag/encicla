"use client";

import * as React from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useStepper, utils } from "@/features/register/stepper";
import { Step1 } from "@/features/register/step1";
import { Step2 } from "@/features/register/step2";
import { Step3 } from "@/features/register/step3";

// import { checkDocumentExists, sendOtp, submitRegistration, verifyOtp } from "@/lib/form.service";
import {
  extractIdFromResponse,
  getCivicaNumber,
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
import { useEffect } from "react";

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

  const hasCivica = form.watch("hasCivica", "1");

  useEffect(() => {
    const loadCivica = async () => {
      // Si desmarca el checkbox, limpiar valor
      if (!hasCivica) {
        form.setValue("civicaNumber", "1");
        return;
      }

      try {
        const docType = form.getValues("documentType");
        const docNumber = form.getValues("documentNumber");

        if (!docType || !docNumber) return;

        notify.info("Consultando número de tarjeta cívica...");

        const response: ResponseData<string> = await getCivicaNumber(
          docType,
          docNumber,
        );

        toast.dismiss();
        if (
          response.status === 200 &&
          response.data !== "Error de usuario o contraseña"
        ) {
          form.setValue("civicaNumber", response.data);
          notify.success("Número de tarjeta cívica encontrado y asociado.");
        } else {
          form.setValue("civicaNumber", "1");
          notify.warn("No fue posible encontrar una tarjeta cívica asociada.");
        }
      } catch (error) {
        // console.error(error);
        toast.dismiss();
        form.setValue("civicaNumber", "1");
        notify.error("Error consultando la información de la tarjeta cívica.");
      }
    };

    loadCivica();
  }, [hasCivica, form]);

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
          phoneFijo: allFields.phoneFijo,
          dateOfBirth: allFields.dateOfBirth,
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
          stratum: allFields.stratum,
          company: allFields.company,
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
        toast.dismiss(idMsj);
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
      toast.dismiss(idMsj);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative z-10 flex flex-row items-center justify-between px-6 py-8 bg-[#0074c5] mb-15">
        <div className="flex flex-col items-start">
          <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-6 text-white">
            Formulario de Inscripción
          </h1>
        </div>

        <Image
          src="https://encicla-portal-prd-staging-fxhth4dnh3b9fqfr.eastus2-01.azurewebsites.net/wp-content/uploads/2025/09/Logo-encicla.svg"
          alt="EnCicla"
          width={80}
          height={80}
          className="h-16 md:h-20 w-auto"
        />
      </div>
      {/* </div> */}
      {/* <main className="container-safe pt-4 md:pt-6"> */}
      <main className="container-safe pt-4 md:pt-6 bg-white text-black ">
        {/* Título compacto en móvil */}
        {/* <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-6">
          Proceso de Inscripción
        </h1> */}

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-4 md:space-y-6 border border-gray-500 p-5 rounded-3xl shadow-sm"
          >
            {/* Header con pasos responsive */}
            <StepsHeader currentIndex={2} />

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
                    className="btn btn-green sm:w-full lg:w-1/4"
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
                  className={`btn btn-green w-3/4 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
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
                      className="btn btn-green w-1/4"
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
                    className="btn btn-green w-3/4"
                  >
                    {stepper.isLast ? "Guardar información" : "Siguiente"}
                  </button>
                </div>
              </div>
            </>
          </form>
        </FormProvider>
      </main>

      <footer className="bg-[#0074c5] text-white px-6 py-6 mt-5">
        {/* Fila principal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          {/* Logo izquierda */}
          <div className="flex items-center gap-3">
            <Image
              src="https://encicla-portal-prd-staging-fxhth4dnh3b9fqfr.eastus2-01.azurewebsites.net/wp-content/uploads/2025/09/Logo-encicla.svg"
              alt="EnCicla"
              width={120}
              height={50}
              className="h-16 md:h-20"
              style={{width: "auto"}}
              priority
            />
          </div>

          {/* Texto centro */}
          <p className="text-center text-sm md:text-base font-medium leading-snug">
            Programa del Área Metropolitana <br className="hidden md:block" />
            del Valle de Aburrá
          </p>

          {/* Logo GOV.CO derecha */}
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Image
              src="https://encicla-portal-prd-staging-fxhth4dnh3b9fqfr.eastus2-01.azurewebsites.net/wp-content/uploads/2025/10/Logo_Footer_GOVCO.png"
              alt="GOV.CO"
              width={237}
              height={51}
              className="h-16 md:h-20"
              style={{width: "auto"}}
              priority
            />
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm mt-4 text-white/90">
          © 2025 Área Metropolitana del Valle de Aburrá. Todos los derechos
          reservados.
        </p>
      </footer>
    </>
  );
}
