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
  ApiResponseLegacy,
  attachRoleToUser,
  submitRegistration,
  uploadRegistrationFiles,
} from "@/lib/form.service";
import { StepsHeader } from "@/components/ui/StepsHeader";
import { mapFormToLegacyUser } from "@/lib/legacy.mapping";
import { notify } from "@/lib/toast";
import { toast } from "react-toastify";

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

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    // console.info("[FORM VALUES]", values);
    try {
      if (stepper.isLast) {
        const id = toast.loading('Enviando tu registro…');
        const allFields = form.getValues();
        // 1) verificar OTP con email del step1 y otpCode del step3
        // const ok = await verifyOtp({ email: allFields.email, code: allFields.otpCode });
        // if (!(ok?.data === true)) {
        //   form.setError("otpCode", { type: "manual", message: "OTP incorrecto" });
        //   return;
        // }

        // 2) enviar TODO en multipart
        // si guardaste id de registro en metadata:
        // const regId = stepper.getMetadata("step1")?.id;
        // const allValues = { ...allFields, registrationId: regId };
        // const resp = await submitRegistration(allValues);

        const step1 = {
          firstName: allFields.firstName,
          secondName: allFields.secondName,
          firstLastName: allFields.firstLastName,
          secondLastName: allFields.secondLastName,
          documentType: allFields.documentType,
          documentNumber: allFields.documentNumber,
          email: allFields.email,
          phone: allFields.phone,
        };

        const step2 = {
          hasCivica: allFields.hasCivica,
          civicaNumber: allFields.civicaNumber,
          userType: allFields.userType,
        };

        const step3 = {
          address: allFields.address,
          municipio: allFields.municipio,
          comuna: allFields.comuna,
          barrio: allFields.barrio,
          ocupacion: allFields.ocupacion,
          emergencyName: allFields.emergencyName,
          emergencyPhone: allFields.emergencyPhone,
          emergencyKinship: allFields.emergencyKinship,
        };

        const payload = mapFormToLegacyUser(step1, step2, step3);
        const resp: ApiResponseLegacy = await submitRegistration(payload);
        toast.dismiss(id); // cierra el spinner
        // console.info(resp);
        if (resp?.isSuccess) {
          //2) attach role
          // const attachData = {
          //   estrategiaId: 4,
          //   fechaInicio: new Date().toISOString(),
          //   rolId: process.env.NEXT_PUBLIC_WS_ROL_ID || "",
          //   usuarioId: resp.result?.id,
          //   usuarioEstadoId: 4,
          //   serialId: 0,
          //   tipoUsoId: 4,
          //   tipoIncumplimientoId: null,
          // };
          // const attach = await attachRoleToUser(attachData);
          // 3) si todo OK, subir archivos, pendiente con backend
          const idFront = allFields.idFront,
            idBack = allFields.idBack,
            passportFile = allFields.passportFile,
            guardianId = allFields.guardianId,
            authorizationLetter = allFields.authorizationLetter,
            signedContract = allFields.signedContract,
            biometricImage = allFields.biometricImage,
            signaturePng = allFields.signaturePng;

          // const files = await uploadRegistrationFiles(resp.result?.id || 0, {
          //   idFront,
          //   idBack,
          //   passportFile,
          //   guardianId,
          //   authorizationLetter,
          //   signedContract,
          //   biometricImage,
          //   signaturePng,
          // });
          // console.log("[RESP FILES]", files);

          // 4) mensaje final de error si no se subieron los archivos
          // if (files.status !== 200) {
          //   alert(
          //     "El formulario se envió pero hubo un problema subiendo los archivos. Por favor contacta al administrador."
          //   );
          //   return;
          // }

          // alert("¡Formulario enviado!");
          // alert("¡Formulario enviado! Pronto recibirás noticias nuestras.");
          notify.success(resp.message || "¡Formulario enviado!");
          form.reset();
          stepper.reset();
          return;
        } else {
          // console.error(resp.message);
          // alert(resp.message || "Error enviando el formulario");
          notify.error(resp.message ?? "No se pudo completar el registro");
          return;
        }
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
      notify.error("Ocurrió un problema. Intenta de nuevo.");
      // form.setError("root", {
      //   type: "manual",
      //   message: "Error procesando la solicitud. Intenta de nuevo.",
      // });
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
