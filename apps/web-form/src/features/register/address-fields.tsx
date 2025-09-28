"use client";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { Step3Values } from "./schemas";
import {
  VIA_TIPOS,
  LETRA_OPTIONS,
  COMP1_OPTIONS,
  //   COMP2_OPTIONS,
  buildAddress,
} from "../../utils/address";

export function AddressFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<Step3Values>();

  const viaTipo = watch("viaTipo");
  const viaNumero = watch("viaNumero");
  const viaLetra = watch("viaLetra");
  const viaComp = watch("viaComp");
  const numero = watch("numero");
  const letra = watch("letra");
  const compNum = watch("compNum");
  const comp2 = watch("comp2");
  const viaComp2 = watch("viaComp2");
  const apto = watch("apto");

  useEffect(() => {
    const addr = buildAddress({
      viaTipo,
      viaNumero,
      viaLetra,
      viaComp,
      //   numero, letra, compNum, comp2, num2, apto,
      numero,
      letra,
      viaComp2,
      compNum,
      comp2,
      apto,
    });
    setValue("address", addr, { shouldValidate: true });
    //   }, [viaTipo, viaNumero, viaLetra, viaComp, numero, letra, compNum, comp2, num2, apto, setValue]);
  }, [
    viaTipo,
    viaNumero,
    viaLetra,
    viaComp,
    numero,
    letra,
    viaComp2,
    compNum,
    comp2,
    apto,
    setValue,
  ]);

  return (
    <div className="grid gap-3">
      <p className="text-sm font-bold">Dirección Residencia *</p>

      <div className="grid sm:grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-2">
        <select className="input" {...register("viaTipo")}>
          {VIA_TIPOS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <input
          className={`w-full input ${errors.viaNumero ? "input-error" : ""}`}
          {...register("viaNumero")}
          placeholder="47"
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <select className="input" {...register("viaLetra")}>
          {LETRA_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select className="input" {...register("viaComp")}>
          {COMP1_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <input
          className={`w-full input ${errors.numero ? "input-error" : ""}`}
          {...register("numero")}
          placeholder="61"
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <select className="input" {...register("letra")}>
          {LETRA_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-2">
        <select className="input" {...register("viaComp2")}>
          {COMP1_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <input
          className={`w-full input ${errors.compNum ? "input-error" : ""}`}
          {...register("compNum")}
          placeholder="30"
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <select className="input" {...register("comp2")}>
          {LETRA_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <input
          className={`w-full input md:col-span-3 lg:col-span-3 ${errors.apto ? "input-error" : ""}`}
          {...register("apto")}
          placeholder="apto 302"
        />
      </div>

      <div>
        <label className="text-sm font-bold">Dirección Completa:</label>
        <div className="mt-1 rounded-lg bg-slate-800 px-3 py-2 border border-slate-700 text-sm">
          {watch("address")}
        </div>
      </div>
    </div>
  );
}
