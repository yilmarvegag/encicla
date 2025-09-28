# Encicla.API/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar solution y proyectos
COPY ["Encicla.sln", "./"]
COPY ["Encicla.API/*.csproj", "Encicla.API/"]
COPY ["Encicla.Application/*.csproj", "Encicla.Application/"]
COPY ["Encicla.Domain/*.csproj", "Encicla.Domain/"]
COPY ["Encicla.Infrastructure/*.csproj", "Encicla.Infrastructure/"]
COPY ["Encicla.Persistence/*.csproj", "Encicla.Persistence/"]

RUN dotnet restore "Encicla.sln"

# Copiar todo el código fuente
COPY . .

# Crear directorio StaticData si no existe
RUN mkdir -p /src/Encicla.API/StaticData

WORKDIR "/src/Encicla.API"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Crear directorio StaticData en el contenedor final
RUN mkdir -p /app/StaticData

COPY --from=publish /app/publish .

# Opcional: si tienes archivos estáticos que copiar
# COPY --from=publish /src/Encicla.API/StaticData /app/StaticData

ENTRYPOINT ["dotnet", "Encicla.API.dll"]