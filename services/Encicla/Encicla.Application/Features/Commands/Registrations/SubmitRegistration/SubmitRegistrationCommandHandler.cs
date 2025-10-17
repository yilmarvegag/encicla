using Encicla.Application.Abstractions.Messaging;
using Encicla.Application.Abstractions.Services;
using Encicla.Application.DTOs.Registration;
using Encicla.Domain.Entities;
using Encicla.Domain.Repositories;
using Encicla.Domain.Wrappers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Encicla.Application.Features.Commands.Registrations.SubmitRegistration
{
    internal sealed class SubmitRegistrationCommandHandler
    : ICommandHandler<SubmitRegistrationCommand, Guid>
    {
        private readonly IBlobStorage _blob;
        private readonly IOtpService _otpService;
        //private readonly IRegistrationRepository _repo;
        //private readonly IUnitOfWork _uow;
        private readonly ILogger<SubmitRegistrationCommandHandler> _logger;

        public SubmitRegistrationCommandHandler(
            IBlobStorage blob,
            IOtpService otpService,
            //IRegistrationRepository repo,
            //IUnitOfWork uow,
            ILogger<SubmitRegistrationCommandHandler> logger)
        {
            _blob = blob;
            _otpService = otpService;
            //_repo = repo;
            //_uow = uow;
            _logger = logger;
        }

        public async Task<Result<Guid>> Handle(SubmitRegistrationCommand request, CancellationToken ct)
        {
            // 1) Validaciones rápidas
            if (string.IsNullOrWhiteSpace(request.Email))
                return Result<Guid>.Failure("Email requerido.");

            //if (!await _otpService.VerifyOtpAsync(request.Email, request.OtpCode, ct))
            //    return Result<Guid>.Failure("OTP inválido.");

            // 2) Normaliza/crea Id de correlación
            var regId = !string.IsNullOrWhiteSpace(request.RegistrationId) && Guid.TryParse(request.RegistrationId, out var parsed)
                ? parsed
                : Guid.NewGuid();

            // 3) Subidas a blob (opcionales)
            // Estructura: registrations/{regId}/[tipo]/archivo.ext
            // Devuelve URL (o null)
            string basePath = $"registrations/{regId}";

            StoredFile? signatureUrl = await UploadOpt(request.SignatureImage, $"{basePath}/contract", "signature", ct);
            StoredFile? contractPdfUrl = await UploadOpt(request.SignedContractPdf, $"{basePath}/contract", "signed-contract", ct);
            StoredFile? biometricUrl = await UploadOpt(request.BiometricImage, $"{basePath}/biometric", "selfie", ct);

            // Documentos de identidad
            StoredFile? idDocUrl = await UploadOpt(request.IdDoc, $"{basePath}/id", "id-doc", ct);
            StoredFile? idFrontUrl = await UploadOpt(request.IdFront, $"{basePath}/id", "id-front", ct);
            StoredFile? idBackUrl = await UploadOpt(request.IdBack, $"{basePath}/id", "id-back", ct);
            StoredFile? passportUrl = await UploadOpt(request.PassportFile, $"{basePath}/passport", "passport", ct);
            StoredFile? guardianIdUrl = await UploadOpt(request.GuardianId, $"{basePath}/guardian", "guardian-id", ct);
            StoredFile? authorizationUrl = await UploadOpt(request.AuthorizationLetter, $"{basePath}/guardian", "authorization", ct);

            // 4) Mapea a tu agregado/entidad de dominio
            var entity = new Registration
            {
                Id = regId,
                FirstName = request.FirstName,
                SecondName = request.SecondName,
                FirstLastName = request.FirstLastName,
                SecondLastName = request.SecondLastName,
                DocumentType = request.DocumentType,
                DocumentNumber = request.DocumentNumber,
                Email = request.Email,
                Phone = request.Phone,
                HabeasDataAccepted = request.HabeasDataAccepted,
                TermsAccepted = request.TermsAccepted,

                UserType = request.UserType, // si tienes enum, mapea aquí
                HasCivicaPersonalizada = request.HasCivicaPersonalizada,
                CivicaNumber = request.CivicaNumber,
                ContractAccepted = request.ContractAccepted,

                SignatureImageUrl = signatureUrl?.BlobPath,
                SignedContractUrl = contractPdfUrl?.BlobPath,
                BiometricImageUrl = biometricUrl?.BlobPath,

                IdDocUrl = idDocUrl?.BlobPath,
                IdFrontUrl = idFrontUrl?.BlobPath,
                IdBackUrl = idBackUrl?.BlobPath,
                PassportUrl = passportUrl?.BlobPath,
                GuardianIdUrl = guardianIdUrl?.BlobPath,
                AuthorizationLetterUrl = authorizationUrl?.BlobPath,

                Address = request.Address,
                Municipio = request.Municipio,
                Comuna = request.Comuna,
                Barrio = request.Barrio,
                Ocupacion = request.Ocupacion,
                EmergencyName = request.EmergencyName,
                EmergencyPhone = request.EmergencyPhone,
                EmergencyKinship = request.EmergencyKinship,

                Status = "Pendiente",
                CreatedAt = DateTimeOffset.UtcNow
            };

            //// 5) Persistencia
            //await _repo.UpsertAsync(entity, ct); // o AddAsync si siempre es nuevo
            //await _uow.SaveChangesAsync(ct);

            _logger.LogInformation("Registration {Id} submitted", regId);

            return Result<Guid>.Success(regId, "Registro creado.");
        }

        private async Task<StoredFile?> UploadOpt(IFormFile? file, string folder, string baseName, CancellationToken ct)
        {
            if (file is null || file.Length == 0) return null;

            // conserva extensión si la trae el usuario
            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(ext))
            {
                // fallback por content-type
                ext = file.ContentType switch
                {
                    "application/pdf" => ".pdf",
                    "image/png" => ".png",
                    "image/jpeg" => ".jpg",
                    _ => ""
                };
            }

            var blobPath = $"{folder}/{baseName}{ext}".ToLowerInvariant();
            await using var stream = file.OpenReadStream();
            return await _blob.SaveAsync(stream, blobPath, ext, ct);
        }
    }
}
