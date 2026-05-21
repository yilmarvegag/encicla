// apps/web-form/src/features/register/step1.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { Step1Values } from "./schemas";

export function Step1() {
  const {
    register,
    formState: { errors },
  } = useFormContext<Step1Values>();

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Primer Nombre *
          </label>
          <input
            className={`w-full input ${errors.firstName ? "input-error" : ""}`}
            placeholder="Primer nombre"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Segundo Nombre
          </label>
          <input
            className="w-full input"
            placeholder="Segundo nombre"
            {...register("secondName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Primer Apellido *
          </label>
          <input
            className={`w-full input ${errors.firstLastName ? "input-error" : ""}`}
            placeholder="Primer apellido"
            {...register("firstLastName")}
          />
          {errors.firstLastName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.firstLastName.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Segundo Apellido
          </label>
          <input
            className="w-full input"
            placeholder="Segundo apellido"
            {...register("secondLastName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Correo Electrónico *
          </label>
          <input
            className={`w-full input ${errors.email ? "input-error" : ""}`}
            placeholder="Correo electrónico"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Confirmar Correo Electrónico *
          </label>
          <input
            className={`w-full input ${errors.emailConfirm ? "input-error" : ""}`}
            placeholder="Confirmar Correo electrónico"
            {...register("emailConfirm")}
          />
          {errors.emailConfirm && (
            <p className="text-red-500 text-sm mt-1">
              {errors.emailConfirm.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
              Tipo de Documento *
            </label>
            <select className="w-full input" {...register("documentType")}>
              <option value="0">Selecciona...</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjera</option>
              <option value="PA">Pasaporte</option>
            </select>
            {errors.documentType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.documentType.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
              Número de documento *
            </label>
            <input
              className={`w-full input ${errors.documentNumber ? "input-error" : ""}`}
              placeholder="Número de documento"
              {...register("documentNumber")}
            />
            {errors.documentNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.documentNumber.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Teléfono *
          </label>
          <input
            className={`w-full input ${errors.phone ? "input-error" : ""}`}
            placeholder="Celular"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Sexo *
          </label>
          <select
            className={`w-full input ${
              errors.sexAssignedAtBirth ? "input-error" : ""
            }`}
            {...register("sexAssignedAtBirth")}
          >
            <option value="">Selecciona una opción</option>
            <option value="H">Hombre</option>
            <option value="M">Mujer</option>
          </select>
          {errors.sexAssignedAtBirth && (
            <p className="text-red-500 text-sm mt-1">
              {errors.sexAssignedAtBirth.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            PIN de acceso (4 dígitos) *
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className={`w-full input ${errors.pin ? "input-error" : ""}`}
            placeholder="****"
            autoComplete="on"
            {...register("pin")}
          />
          {errors.pin && (
            <p className="text-red-500 text-sm mt-1">
              {errors.pin.message}
            </p>
          )}
        </div>
      </div>

      {/* --fecha de nacimiento y estrado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            inputMode="numeric"
            maxLength={4}
            className={`w-full input ${errors.dateOfBirth ? "input-error" : ""}`}
            placeholder="01/02/2000"
            autoComplete="on"
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>       

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 py-2">
            Teléfono fijo
          </label>
          <input
            className="w-full input"
            placeholder="Número de teléfono fijo"
            {...register("phoneFijo")}
          />
          {errors.phoneFijo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phoneFijo.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className={`flex items-center gap-2 p-2 rounded-md ${
              errors.habeas ? "border border-red-600 bg-red-900/20" : ""
            }`}
          >
            <input
              type="checkbox"
              {...register("habeas")}
              className={`h-5 w-5 rounded ${errors.habeas ? "accent-red-600" : "accent-[#0175ca]"}`}
            />
            Acepto la
            <a
              href="/docs/habeas-data.pdf"
              target="_blank"
              className="underline text-sky-400"
            >
              Política de Habeas Data
            </a>
          </label>
          {errors.habeas && (
            <p className="text-red-500 text-sm mt-1">{errors.habeas.message}</p>
          )}
        </div>

        <div>
          <label
            className={`flex items-center gap-2 p-2 rounded-md ${
              errors.terms ? "border border-red-600 bg-red-900/20" : ""
            }`}
          >
            <input
              type="checkbox"
              {...register("terms")}
              className={`h-5 w-5 rounded ${errors.terms ? "accent-red-600": "accent-[#0175ca]"}`}
            />
            Acepto los
            <a
              href="/docs/terminos-condiciones.pdf"
              target="_blank"
              className="underline text-sky-400"
            >
              Términos y Condiciones
            </a>
          </label>
          {errors.terms && (
            <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
          )}
        </div>
      </div>

      {/* <div className="text-red-400 text-sm">
        {Object.values(errors).map((e, i) => (
          <div key={i}>{e?.message as string}</div>
        ))}
      </div> */}
    </div>
  );
}
