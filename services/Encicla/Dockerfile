# Encicla.API/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyecto
COPY ["Encicla.sln", "./"]
COPY ["Encicla.API/*.csproj", "Encicla.API/"]
COPY ["Encicla.Application/*.csproj", "Encicla.Application/"]
COPY ["Encicla.Domain/*.csproj", "Encicla.Domain/"]
COPY ["Encicla.Infrastructure/*.csproj", "Encicla.Infrastructure/"]
COPY ["Encicla.Persistence/*.csproj", "Encicla.Persistence/"]

RUN dotnet restore "Encicla.sln"

# Copiar TODO incluyendo StaticData
COPY . .

WORKDIR "/src/Encicla.API"
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Verificar que los archivos estáticos están presentes
RUN echo "=== Verificando archivos estáticos ===" && \
    ls -la /app/StaticData/Geo/ || echo "No se pudo listar StaticData/Geo"

ENTRYPOINT ["dotnet", "Encicla.API.dll"]