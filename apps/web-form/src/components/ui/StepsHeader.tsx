import {
  CogIcon,
  IdentificationIcon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";

  // Configuración de los steps con iconos
  const stepsConfig : { id: string; label: string; icon: React.ComponentType<any> }[] = [
    { id: "step1", label: "Información Básica", icon: CogIcon },
    { id: "step2", label: "Identificación", icon: IdentificationIcon },
    { id: "step3", label: "Información Personal", icon: UserCircleIcon },
  ];


export function StepsHeader({
  currentIndex,
}: {
  currentIndex: number;
}) {
  return (
    <nav aria-label="Pasos" className="w-full">
      <ol className="flex items-center w-full gap-0 md:gap-8">
        {stepsConfig.map((s, index) => {
          const active = index === currentIndex;
          const done = index < currentIndex;
          const Icon = s.icon;

          return (
            <li
              key={s.id}
              className="flex items-center flex-1 md:flex-initial"
            >
              {/* Conector a la IZQUIERDA (solo desktop y no en el 1ro) */}
              {index > 0 && (
                <div
                  className={`hidden md:block h-0.5 flex-1 ${
                    done ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}

              {/* Ícono + label */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Ícono circular */}
                <div
                  className={`relative flex items-center justify-center
                              w-10 h-10 rounded-full border-2 shrink-0
                              ${
                                active
                                  ? "border-sky-600 bg-sky-50"
                                  : done
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-300 bg-white"
                              }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active
                        ? "text-sky-600"
                        : done
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  />

                  {/* Check en completados */}
                  {done && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Label: oculto en móvil; visible en md+ (así móvil ve solo íconos) */}
                <span
                  className={`hidden md:block text-sm font-medium whitespace-nowrap ${
                    active ? "text-sky-600" : done ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Conector a la DERECHA (móvil y desktop) */}
              {index < stepsConfig.length - 1 && (
                <>
                  {/* Móvil: línea centrada verticalmente al ícono */}
                  <div
                    className={`md:hidden h-0.5 mx-2 flex-1 ${
                      done ? "bg-green-500" : "bg-gray-300"
                    }`}
                    // la altura 0.5 ya queda alineada a mitad del ícono por flex alignment
                  />

                  {/* Desktop: ya ponemos el conector del siguiente item en su lado izquierdo,
                      pero para consistencia visual dejamos también este corto */}
                  <div
                    className={`hidden md:block h-0.5 w-8 mx-2 ${
                      done ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
