using Encicla.Domain.Enums;

namespace Encicla.Domain.Entities
{
    public class Registration
    {
        public Guid Id { get; init; } = Guid.NewGuid();
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string DocumentType { get; set; } = default!;
        public string DocumentNumber { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public bool HabeasDataAccepted { get; set; }
        public bool TermsAccepted { get; set; }
        public bool OtpVerified { get; set; }

        // Step 2
        public UserType? UserType { get; set; }
        public bool HasCivicaPersonalizada { get; set; }
        public string? CivicaNumber { get; set; }
        public bool CivicaValidated { get; set; }
        public bool ContractAccepted { get; set; }
        public string[] DocumentFileIds { get; set; } = Array.Empty<string>();
        public string? SignedContractFileId { get; set; }

        // Step 3
        public string Address { get; set; } = string.Empty;
        public string MunicipioId { get; set; } = string.Empty;
        public string? Comuna { get; set; }
        public string? Barrio { get; set; }
        public string Ocupacion { get; set; } = string.Empty;
        public string EmergencyName { get; set; } = string.Empty;
        public string EmergencyPhone { get; set; } = string.Empty;
        public string EmergencyKinship { get; set; } = string.Empty;

        public string Status { get; set; } = "Incompleto";
    }
}
