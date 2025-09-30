"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useStepper, utils } from "@/features/register/stepper";
import { Step1 } from "@/features/register/step1";
import { Step2 } from "@/features/register/step2";
import { Step3 } from "@/features/register/step3";
import {
  CogIcon,
  IdentificationIcon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";
import { checkDocumentExists, sendOtp } from "@/lib/form.service";
import { StepsHeader } from "@/components/ui/StepsHeader";

async function submitAll(values: any) {
  console.log("[SUBMIT FINAL]", values);
  await new Promise((r) => setTimeout(r, 400));
  return true;
}

export default function Page() {
  const stepper = useStepper();
  const otpSent = React.useRef(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // New loading state

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

  const currentIndex = utils.getIndex(stepper.current.id);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true); // Disable button immediately

    try {
      if (stepper.isLast) {
        const ok = await submitAll(values);
        if (ok) {
          alert("¡Formulario enviado! (ver consola)");
          form.reset();
          stepper.reset();
        }
      } else if (stepper.isFirst) {
        const { data, status } = await checkDocumentExists(
          values.documentNumber
        );
        if (status === 200 && data) {
          form.setError("documentNumber", {
            type: "manual",
            message: "El número de documento ya está registrado",
          });
          return;
        }
        // Remove setTimeout (unreliable for async); handle directly
        if (!otpSent.current) {
          setTimeout(async () => {
            const otp = await sendOtp(values.email);
            console.log("OTP enviado", otp);
            otpSent.current = true;
          }, 1500);
        }
        stepper.next();
      } else {
        stepper.next();
      }
    } catch (error) {
      console.error("[FORM] Error submitting:", error);
      // Optionally set form error or show user feedback
      form.setError("root", {
        type: "manual",
        message: "Error procesando la solicitud. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false); // Re-enable button regardless of success/error
    }
  };

  // Configuración de los steps con iconos
  const stepsConfig = [
    { id: "step1", label: "Información Básica", icon: CogIcon },
    { id: "step2", label: "Identificación", icon: IdentificationIcon },
    { id: "step3", label: "Información Personal", icon: UserCircleIcon },
  ];

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
          <StepsHeader steps={stepsConfig} currentIndex={currentIndex} />

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
          {/* {!stepper.isLast ? (
            
          ) : (
            // Último paso: un solo CTA
            <>
              <div className="hidden md:block">
                <button
                  type="submit"
                  className="btn btn-primary w-full md:w-auto"
                >
                  Guardar información
                </button>
              </div>
              <div className="md:hidden sticky bottom-0 left-0 right-0  py-3 px-4 shadow-lg">
                <button type="submit" className="btn btn-primary w-full">
                  Guardar información
                </button>
              </div>
            </>
          )} */}
        </form>
      </FormProvider>
    </main>
  );
}
