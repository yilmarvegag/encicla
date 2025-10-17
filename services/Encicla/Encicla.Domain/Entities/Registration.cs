namespace Encicla.Domain.Entities
{
    //public enum RegistrationStatus { Draft, Submitted, Rejected }
    public class Registration
    {
        public Guid Id { get; set; }

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

        public string? SignatureImageUrl { get; set; }
        public string? SignedContractUrl { get; set; }
        public string? BiometricImageUrl { get; set; }

        public string? IdDocUrl { get; set; }
        public string? IdFrontUrl { get; set; }
        public string? IdBackUrl { get; set; }
        public string? PassportUrl { get; set; }
        public string? GuardianIdUrl { get; set; }
        public string? AuthorizationLetterUrl { get; set; }

        // Step3
        public string Address { get; set; } = default!;
        public string Municipio { get; set; } = default!;
        public string? Comuna { get; set; }
        public string? Barrio { get; set; }
        public string Ocupacion { get; set; } = default!;
        public string EmergencyName { get; set; } = default!;
        public string EmergencyPhone { get; set; } = default!;
        public string EmergencyKinship { get; set; } = default!;

        public string Status { get; set; } = "Pendiente";
        public DateTimeOffset CreatedAt { get; set; }
    }


}
