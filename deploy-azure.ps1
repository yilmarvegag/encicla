param(
    [Parameter(Mandatory=$true)]
    [string]$AppName,

    [string]$TAG
)


# ==================== CONFIGURACIÓN ====================
$IMAGE_NAME     = "encicla-"+$AppName
$ACR_NAME       = "acrenciclaprd"               # sin .azurecr.io
$CONTAINER_APP  = "encicla-"+$AppName+"-prd"         
$RESOURCE_GROUP = "rg-encicla-web-prd"
$REGISTRY = "$ACR_NAME.azurecr.io"
$FULL_IMAGE = "$IMAGE_NAME`:$TAG"

# URL Prod: https://webapp.metropol.gov.co/prodwsencicla/api
# URL QA  : https://webapp.metropol.gov.co/pruebawsencicla/api
$API_URL = "https://webapp.metropol.gov.co/pruebawsencicla/api"     
# =====================================================


switch ($AppName) {

    "web-form" {
        $EnvVars = @{
            NEXT_PUBLIC_API_BASE_URL        = $API_URL
            NEXT_PUBLIC_SECONDS_READ_PDF    ="52"
            NEXT_PUBLIC_FACE_WASM_URL       ="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
            NEXT_PUBLIC_FACE_MODEL_URL      ="https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
            NEXT_PUBLIC_FACE_DELEGATE       ="CPU"
        }
    }

    "web-admin" {
        $EnvVars = @{
            NEXT_PUBLIC_API_BASE_URL = $API_URL
        }
    }
}

$EnvString = $EnvVars.GetEnumerator() | ForEach-Object {
    "$($_.Key)=$($_.Value)"
}

Write-Host "Iniciando deployment a Azure Container Apps..." -ForegroundColor Cyan


# 1. Login a Azure
az account show > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Iniciando login a Azure..." -ForegroundColor Yellow
    az login
}

# 2. Login al Container Registry
Write-Host "Login al ACR $ACR_NAME" -ForegroundColor Yellow
az acr login --name $ACR_NAME


if ([string]::IsNullOrWhiteSpace($TAG)) {

    Write-Host ""
    Write-Host "======================================" -ForegroundColor Yellow
    Write-Host "Debe indicar un tag para desplegar." -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Yellow
    Write-Host ""

    # az containerapp revision list `
    #     --name $IMAGE_NAME"-prd" `
    #     --resource-group $RESOURCE_GROUP `
    #     --output table

    az acr repository show-tags --name $ACR_NAME --repository $IMAGE_NAME

    $CurrentImage = az containerapp show `
    --name $CONTAINER_APP `
    --resource-group $RESOURCE_GROUP `
    --query "properties.template.containers[0].image" `
    --output tsv

    Write-Host ""
    Write-Host "Imagen actual:" -ForegroundColor Green
    Write-Host $CurrentImage
    Write-Host "=========================================="
    Write-Host "Revisa el ultimo tag disponible:" -ForegroundColor Yellow
    Write-Host "Ejemplo:" -ForegroundColor Cyan
    Write-Host "pnpm deploy:web-form --tag=ultimo-tag+1"

    exit 0
}


# 3. Build de la imagen
Write-Host "Construyendo imagen Docker..." -ForegroundColor Yellow
$env:IMAGE_TAG = $FULL_IMAGE
docker compose build --no-cache $AppName

# Tageo imagen
Write-Host "Construyendo el tag de imagen Docker..." -ForegroundColor Green
docker tag $FULL_IMAGE $REGISTRY/$FULL_IMAGE

# 4. Push a Azure Container Registry
Write-Host "Subiendo imagen a ACR..." -ForegroundColor Yellow
docker push $FULL_IMAGE

Write-Host "Imagen subida: $FULL_IMAGE" -ForegroundColor Green

# 5. Actualizar el Container App
Write-Host "Actualizando Azure Container App $CONTAINER_APP" -ForegroundColor Yellow

Write-Host "Variables para el Contanedor: $EnvString" -ForegroundColor Red

$REVISION_SUFFIX = "v" + (Get-Date -Format "yyyyMMdd-HHmmss")

if (-not $EnvVars) {
    throw "No se configuraron variables para $AppName"
}

az containerapp update `
    --name $CONTAINER_APP `
    --resource-group $RESOURCE_GROUP `
    --image $REGISTRY/$FULL_IMAGE `
    --revision-suffix $REVISION_SUFFIX

Write-Host "`n Deployment completado exitosamente!" -ForegroundColor Green

Write-Host "`n Variables de entorno: " -ForegroundColor Red
Write-Host "=========================================="
az containerapp show `
    --name $CONTAINER_APP `
    --resource-group rg-encicla-web-prd `
    --query "properties.template.containers[0].env[].{Nombre:name, Valor:value, SecretRef:secretRef}" `
    --output table
Write-Host "=========================================="
Write-Host "Container App: $CONTAINER_APP" -ForegroundColor Cyan
$URL_APP = az containerapp show `
    --name $CONTAINER_APP `
    --resource-group $RESOURCE_GROUP `
    --query "properties.configuration.ingress.fqdn" `
    --output tsv
Write-Host "URL: https://$URL_APP" -ForegroundColor Green
Write-Host "Imagen: $FULL_IMAGE" -ForegroundColor Cyan
Write-Host "Finalizado" -ForegroundColor Green