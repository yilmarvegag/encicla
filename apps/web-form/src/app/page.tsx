"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useStepper, utils } from "@/features/register/stepper";
import { Step1 } from "@/features/register/step1";
import { Step2 } from "@/features/register/step2";
import { Step3 } from "@/features/register/step3";

import { checkDocumentExists, sendOtp, submitRegistration, verifyOtp } from "@/lib/form.service";
import { StepsHeader } from "@/components/ui/StepsHeader";


export default function Page() {
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(stepper.current.schema),
    shouldUnregister: false,
    defaultValues: {
      contractAccepted: false,
      documentType: "Cédula de Ciudadanía",
      userType: "Residente",
      hasCivica: false,
      ocupacion: "Funcionario Público",
    } as any,
  });

  const otpSent = React.useRef(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    // console.info("[FORM VALUES]", values);
    try {
      if (stepper.isLast) {
        const allFields = form.getValues(); 
        console.log("[ALL VALUES]", allFields);
        // 1) verificar OTP con email del step1 y otpCode del step3
        const ok = await verifyOtp({ email: allFields.email, code: allFields.otpCode });
        if (!(ok?.data === true)) {
          form.setError("otpCode", { type: "manual", message: "OTP incorrecto" });
          return;
        }

        // 2) enviar TODO en multipart
        // si guardaste id de registro en metadata:
        const regId = stepper.getMetadata("step1")?.id;
        const allValues = { ...allFields, registrationId: regId };
        const resp = await submitRegistration(allValues);
        console.log("[RESP SUBMIT]", resp);
        alert("¡Formulario enviado!");
        form.reset();
        stepper.reset();
        return;
      }


      // Paso 1: check doc y enviar OTP si no se ha enviado
      // if (stepper.isFirst) {
      //   const { data, status } = await checkDocumentExists(values.documentNumber);
      //   if (status === 200 && data) {
      //     form.setError("documentNumber", {
      //       type: "manual",
      //       message: "El número de documento ya está registrado",
      //     });
      //     return;
      //   }
      //   if (!otpSent.current) {
      //     await sendOtp(values.email);
      //     otpSent.current = true;
      //   }
      //   stepper.next();
      //   return;
      // }

      // Paso 2 → paso 3
      stepper.next();
    } catch (err) {
      console.error(err);
      form.setError("root", { type: "manual", message: "Error procesando la solicitud. Intenta de nuevo." });
    } finally {
      setIsSubmitting(false);
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
          onSubmit={form.handleSubmit(onSubmit)}
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
