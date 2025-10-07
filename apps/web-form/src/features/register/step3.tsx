// apps/web-form/src/features/register/step3.tsx
"use client";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Step3Values } from "./schemas";
import { AddressFields } from "./address-fields";
import { useMunicipalities, useNeighborhoods } from "./useMunicipalityCatalog";

export function Step3() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<Step3Values>();

  const municipio = useWatch({ control, name: "municipio" }) ?? "";
  const barrioSel = useWatch({ control, name: "barrio" }) ?? "";

  const {
    municipalities,
    isLoading: loadingMuns,
    error: munErr,
  } = useMunicipalities();
  const {
    neighborhoods,
    isLoading: loadingNeis,
    error: neiErr,
  } = useNeighborhoods(municipio);

  useEffect(() => {
    setValue("barrio", "", { shouldValidate: true });
    setValue("comuna", "", { shouldValidate: true });
  }, [municipio, setValue]);

  const onBarrioChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const value = e.target.value;
    setValue("barrio", value, { shouldValidate: true });
    const found = neighborhoods.find((n) => n.name === value);
    if (found?.commune)
      setValue("comuna", found.commune, { shouldValidate: true });
  };

  return (
    <div className="grid gap-4">
      <AddressFields />

      <p className="text-sm font-bold">Complemento de la dirección</p>

      <div className="grid md:grid-cols-3 gap-2">
        <div>
          <select
            className={`w-full input ${errors.municipio ? "input-error" : ""}`}
            {...register("municipio")}
          >
            <option value="">
              {loadingMuns
                ? "Cargando municipios..."
                : "Selecciona un municipio"}
            </option>
            {municipalities.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.name}
              </option>
            ))}
          </select>
          {errors.municipio && (
            <p className="text-red-500 text-sm mt-1">
              {errors.municipio.message}
            </p>
          )}
        </div>

        <div>
          <input
            className="input"
            placeholder="Comuna"
            disabled
            {...register("comuna")}
          />
        </div>

        <div>
          <select
            className={`w-full input ${errors.barrio ? "input-error" : ""}`}
            value={barrioSel}
            onChange={onBarrioChange}
            disabled={!municipio || municipio === "0" || loadingNeis}
          >
            <option value="">
              {loadingNeis
                ? "Cargando barrios..."
                : municipio && municipio !== "0"
                  ? "Selecciona un barrio"
                  : "Selecciona municipio primero"}
            </option>
            {neighborhoods.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.barrio && (
            <p className="text-red-500 text-sm mt-1">{errors.barrio.message}</p>
          )}
        </div>
      </div>

      <select
        className={`w-full input ${errors.ocupacion ? "input-error" : ""}`}
        {...register("ocupacion")}
      >
        <option>Funcionario Público</option>
        <option>Empleado</option>
        <option>Independiente</option>
        <option>Estudiante</option>
        <option>Desempleado</option>
      </select>

      <div className="grid md:grid-cols-3 gap-2">
        <div>
          <input
            className={`w-full input ${errors.emergencyName ? "input-error" : ""}`}
            placeholder="Nombre contacto"
            {...register("emergencyName")}
          />
          {errors.emergencyName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.emergencyName.message}
            </p>
          )}
        </div>
        <div>
          <input
            className={`w-full input ${errors.emergencyPhone ? "input-error" : ""}`}
            placeholder="Teléfono contacto"
            {...register("emergencyPhone")}
          />
          {errors.emergencyPhone && (
            <p className="text-red-500 text-sm mt-1">
              {errors.emergencyPhone.message}
            </p>
          )}
        </div>
        <div>
          <input
            className={`w-full input ${errors.emergencyKinship ? "input-error" : ""}`}
            placeholder="Parentesco"
            {...register("emergencyKinship")}
          />
          {errors.emergencyKinship && (
            <p className="text-red-500 text-sm mt-1">
              {errors.emergencyKinship.message}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm font-bold">Ingresa el código envido al correo electrónico ingresado</p>

      <div>
        <input
          className={`w-full input ${errors.otpCode ? "input-error" : ""}`}
          placeholder="Código OTP (6 dígitos)"
          {...register("otpCode")}
        />
        {errors.otpCode && (
          <p className="text-red-500 text-sm mt-1">{errors.otpCode.message}</p>
        )}
      </div>

      {(munErr || neiErr) && (
        <div className="text-yellow-400 text-sm">
          No se pudo cargar el catálogo. Intenta de nuevo.
        </div>
      )}
      {/* <div className="text-red-400 text-sm">
        {Object.values(errors).map(
          (e, i) => e && <div key={i}>{String(e.message)}</div>
        )}
      </div> */}
    </div>
  );
}
