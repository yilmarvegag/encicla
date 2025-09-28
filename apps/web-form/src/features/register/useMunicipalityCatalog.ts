// apps/web-form/src/features/register/useMunicipalityCatalog.ts
"use client";
import useSWR from "swr";
import { getMunicipalities, getNeighborhoods, type Municipality, type Neighborhood } from "@/lib/form.service";

export function useMunicipalities() {
  const { data, error, isLoading } = useSWR<Municipality[]>(
    "municipalities",
    async () => {
      const env = await getMunicipalities();
      return env.data.sort((a,b)=>a.name.localeCompare(b.name));
    },
    { revalidateOnFocus: false }
  );
  return { municipalities: data ?? [], error, isLoading };
}

export function useNeighborhoods(municipalityId?: string | number) {
  const idStr = municipalityId == null ? "" : String(municipalityId).trim();
  const disabled = !idStr || idStr === "0";

  const { data, error, isLoading } = useSWR<Neighborhood[]>(
    disabled ? null : (["neighborhoods", idStr] as const),
    async ([, id]:string) => {
      const env = await getNeighborhoods(id);
      return env.data.sort((a,b)=>a.name.localeCompare(b.name));
    },
    { revalidateOnFocus: false }
  );

  return { neighborhoods: data ?? [], error, isLoading };
}
