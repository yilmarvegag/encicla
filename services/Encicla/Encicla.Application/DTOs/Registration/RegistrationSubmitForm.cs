using Microsoft.AspNetCore.Http;

namespace Encicla.Application.DTOs.Registration
{
    public class RegistrationSubmitForm
    {
        // Step1
        public string FirstName { get; set; } = default!;
        public string? SecondName { get; set; }
        public string FirstLastName { get; set; } = default!;
        public string? SecondLastName { get; set; }
        public string DocumentType { get; set; } = default!;
        public string DocumentNumber { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public bool HabeasDataAccepted { get; set; }
        public bool TermsAccepted { get; set; }

        // Step2
        public string UserType { get; set; } = default!;
        public bool HasCivicaPersonalizada { get; set; }
        public string? CivicaNumber { get; set; }
        public bool ContractAccepted { get; set; }
        public IFormFile? SignatureImage { get; set; }
        public IFormFile? SignedContractPdf { get; set; }
        public IFormFile? BiometricImage { get; set; }

        public IFormFile? IdDoc { get; set; }
        public IFormFile? IdFront { get; set; }
        public IFormFile? IdBack { get; set; }
        public IFormFile? PassportFile { get; set; }
        public IFormFile? GuardianId { get; set; }
        public IFormFile? AuthorizationLetter { get; set; }

        // Step3
        public string Address { get; set; } = default!;
        public string Municipio { get; set; } = default!;
        public string? Comuna { get; set; }
        public string? Barrio { get; set; }
        public string Ocupacion { get; set; } = default!;
        public string EmergencyName { get; set; } = default!;
        public string EmergencyPhone { get; set; } = default!;
        public string EmergencyKinship { get; set; } = default!;

        // Correlación
        public string? RegistrationId { get; set; }

        // OTP recibido en el último paso
        public string OtpCode { get; set; } = default!;
    }
}
