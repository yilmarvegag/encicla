using Encicla.API.Abstractions;
using Encicla.Application.Features.Commands.OTPs.SendOTP;
using Encicla.Application.Features.Queries.Registration.ValidateDocumentQuery;
using Encicla.Domain.Wrappers;
using MediatR;
using Microsoft.AspNetCore.Http;
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
    }
}
