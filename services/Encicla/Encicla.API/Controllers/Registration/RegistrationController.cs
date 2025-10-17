using Encicla.API.Abstractions;
using Encicla.Application.DTOs.Registration;
using Encicla.Application.Features.Commands.Registrations.SubmitRegistration;
using Encicla.Application.Features.Queries.Registration.ValidateDocumentQuery;
using Encicla.Domain.Wrappers;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Encicla.API.Controllers.Registration
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    public class RegistrationController : ApiController
    {
        public RegistrationController(IMediator mediator) : base(mediator)
        {
        }

        /// <summary>POST /api/v{version}/registration/validate-document</summary>
        [HttpPost("validate-document")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ValidateDocument([FromBody] ValidateDocumentQuery request, CancellationToken ct)
        {
            var result = await _mediator.Send(new ValidateDocumentQuery(request.DocumentNumber), ct);
            return Handle(result);
        }

        /// POST /api/v1/registration/submit (multipart/form-data)
        [HttpPost]
        //[RequestSizeLimit(50_000_000)]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(Response<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> Submit([FromForm] RegistrationSubmitForm form, CancellationToken ct)
        {
            var cmd = new SubmitRegistrationCommand(
                form.FirstName, form.SecondName, form.FirstLastName, form.SecondLastName,
                form.DocumentType, form.DocumentNumber, form.Email, form.Phone,
                form.HabeasDataAccepted, form.TermsAccepted,
                form.UserType, form.HasCivicaPersonalizada, form.CivicaNumber, form.ContractAccepted,
                form.SignatureImage, form.SignedContractPdf, form.BiometricImage,
                form.IdDoc, form.IdFront, form.IdBack, form.PassportFile, form.GuardianId, form.AuthorizationLetter,
                form.Address, form.Municipio, form.Comuna, form.Barrio, form.Ocupacion,
                form.EmergencyName, form.EmergencyPhone, form.EmergencyKinship,
                form.OtpCode, form.RegistrationId
            );

            var result = await _mediator.Send(cmd, ct);
            return Handle(result);
        }
    }
}
