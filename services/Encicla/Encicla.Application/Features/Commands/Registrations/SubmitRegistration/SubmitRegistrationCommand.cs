using Encicla.Application.Abstractions.Messaging;
using Microsoft.AspNetCore.Http;

namespace Encicla.Application.Features.Commands.Registrations.SubmitRegistration
{
    public sealed record class SubmitRegistrationCommand(
        // STEP 1
        string FirstName,
        string? SecondName,
        string FirstLastName,
        string? SecondLastName,
        string DocumentType,
        string DocumentNumber,
        string Email,
        string Phone,
        bool HabeasDataAccepted,
        bool TermsAccepted,

        // STEP 2
        string UserType,                  // "Residente" | "MenorEdad" | "VisitanteNacional" | "VisitanteExtranjero"
        bool HasCivicaPersonalizada,
        string? CivicaNumber,
        bool ContractAccepted,
        IFormFile? SignatureImage,        // png/jpg
        IFormFile? SignedContractPdf,     // pdf
        IFormFile? BiometricImage,        // jpg (selfie)
        IFormFile? IdDoc,                 // web: un solo archivo
        IFormFile? IdFront,               // mobile: anverso
        IFormFile? IdBack,                // mobile: reverso
        IFormFile? PassportFile,          // extranjeros
        IFormFile? GuardianId,            // menor de edad
        IFormFile? AuthorizationLetter,   // menor de edad

        // STEP 3
        string Address,
        string Municipio,
        string? Comuna,
        string? Barrio,
        string Ocupacion,
        string EmergencyName,
        string EmergencyPhone,
        string EmergencyKinship,

        // Seguridad / correlación
        string OtpCode,                   // OTP ingresado en el último paso
        string? RegistrationId            // correlación opcional (guid string)
    ) : ICommand<Guid>;                   // retorna el Id del registro
}
