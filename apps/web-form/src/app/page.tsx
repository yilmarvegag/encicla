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
import { checkDocumentExists, sendOtp } from "@/lib/api";

// Submit final simulado
async function submitAll(values: any) {
  console.log("[SUBMIT FINAL]", values);
  await new Promise((r) => setTimeout(r, 400));
  return true;
}

export default function Page() {
  const stepper = useStepper();

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(stepper.current.schema),
    shouldUnregister: false, // mantener datos de todos los steps
    defaultValues: {
      otpVerified: false,
      contractAccepted: false,
      documentType: "Cédula de Ciudadanía",
      userType: "Residente",
      hasCivica: true,
      ocupacion: "Funcionario Público",
    } as any,
  });

  const currentIndex = utils.getIndex(stepper.current.id);

  const onSubmit = async (values: any) => {

    console.log("[FORM] Valid submit:", stepper.current.id);

    if (stepper.isLast) {
      // En el último paso, ya pasa por el schema de step3; enviamos TODO
      const ok = await submitAll(values);
      // if (ok) stepper.next(); // -> success
      if (ok) {
        alert("¡Formulario enviado! (ver consola)");
        form.reset();
        stepper.reset(); // volver al inicio
      }
    } else if (stepper.isFirst) {
      //validar si existe
      // 1) Validar existencia del documento en DB
      const { data, status } = await checkDocumentExists(values.documentNumber);
      // console.log("Check document exists", { data, status });
      if (status == 200 && data) {
        form.setError("documentNumber", {
          type: "manual",
          message: "El número de documento ya está registrado",
        });
        return; // detener avance
      }
      //enviar otp
      const otp = await sendOtp(values.email);
      console.log("OTP enviado", otp);
      if (otp.data) {
        stepper.next();
        console.log("[FORM] Submit step:", stepper.current.id, values);
      }
    } else {
      stepper.next();
    }
  };

  return (
    <main className="mx-auto max-w-10/12 p-6">
      <h1 className="text-2xl font-semibold mb-6">Proceso de Inscripción</h1>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header con pasos */}
          <nav aria-label="Pasos" className="group">
            <ol className="flex items-center gap-2">
              {stepper.all.map((step, index, array) => (
                <React.Fragment key={step.id}>
                  <li className="flex items-center gap-3">
                    {index < 1 ? (
                      <CogIcon
                        className={`h-10 w-10 rounded-full p-1 ${index < currentIndex ? "bg-green-600" : ""}`}
                      />
                    ) : index < 2 ? (
                      <IdentificationIcon
                        className={`h-10 w-10 rounded-full p-1 ${index < currentIndex ? "bg-green-600" : ""}`}
                      />
                    ) : (
                      <UserCircleIcon
                        className={`h-10 w-10 rounded-full p-1 ${index < currentIndex ? "bg-green-600" : ""}`}
                      />
                    )}
                    <span className="text-sm font-bold">{step.label}</span>
                  </li>
                  {index < array.length - 1 && (
                    <div
                      className={`h-px flex-1 ${index < currentIndex ? "bg-green-600" : "bg-slate-700"}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Contenido por step */}
          <section className="rounded-2xl border border-slate-800 p-4">
            {stepper.switch({
              step1: () => <Step1 />,
              step2: () => <Step2 />,
              step3: () => <Step3 />,
            })}
          </section>

          {/* Footer */}
          {!stepper.isLast ? (
            // <div className="flex justify-end gap-4">
            <div
              className={`flex gap-4 ${stepper.isFirst ? "justify-end" : "justify-between"}`}
            >
              {stepper.isFirst ? null : (
                <button
                  type="button"
                  className="btn"
                  onClick={stepper.prev}
                  disabled={stepper.isFirst}
                >
                  Atrás
                </button>
              )}
              <button type="submit" className="btn w-lg cursor-pointer">
                {stepper.isLast ? "Finalizar" : "Siguiente"}
              </button>
            </div>
          ) : (
            <button type="submit" className="btn w-full">
              Guardar información
            </button>
          )}
        </form>
      </FormProvider>
    </main>
  );
}
