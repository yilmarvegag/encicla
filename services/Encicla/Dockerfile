# Encicla.API/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyecto primero (para mejor caching)
COPY ["Encicla.sln", "./"]
COPY ["Encicla.API/*.csproj", "Encicla.API/"]
COPY ["Encicla.Application/*.csproj", "Encicla.Application/"]
COPY ["Encicla.Domain/*.csproj", "Encicla.Domain/"]
COPY ["Encicla.Infrastructure/*.csproj", "Encicla.Infrastructure/"]
COPY ["Encicla.Persistence/*.csproj", "Encicla.Persistence/"]

RUN dotnet restore "Encicla.sln"

# Copiar todo el código fuente
COPY . .

# Crear directorio StaticData en el build
RUN mkdir -p /src/Encicla.API/StaticData

WORKDIR "/src/Encicla.API"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Crear directorio StaticData en el contenedor final
RUN mkdir -p /app/StaticData

# Copiar los archivos publicados
COPY --from=publish /app/publish .

# Si necesitas copiar archivos estáticos existentes
COPY --from=publish /src/Encicla.API/StaticData/ /app/StaticData/

ENTRYPOINT ["dotnet", "Encicla.API.dll"]