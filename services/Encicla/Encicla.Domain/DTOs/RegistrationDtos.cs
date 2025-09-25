using Encicla.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Encicla.Domain.DTOs
{
    internal class RegistrationDtos
    {
    }

    public record StartRegistrationRequest(
        string FirstName, string LastName, string DocumentType, string DocumentNumber,
        string Email, string Phone, bool HabeasDataAccepted, bool TermsAccepted
        );
    public record StartRegistrationResponse(Guid RegistrationId);

    public record VerifyOtpRequest(string Email, string Code);

    public record Step2Request(
        UserType UserType, bool HasCivicaPersonalizada, string? CivicaNumber,
        bool ContractAccepted, IEnumerable<string> Documents
    );
    public record Step2Response(bool CivicaValidated);

    public record Step3Request(
        string Address, string MunicipioId, string? Comuna, string? Barrio,
        string Ocupacion, string EmergencyName, string EmergencyPhone, string EmergencyKinship
    );
    public record Step3Response(string Status);

    public record FinalizeRequest(); // por si hay hooks posteriores
    public record FinalizeResponse(Guid RegistrationId, string Status);

    public record RegistrationItem(Guid Id, string FirstName, string LastName, string DocumentNumber, string Email, string Phone, string Status);
}
