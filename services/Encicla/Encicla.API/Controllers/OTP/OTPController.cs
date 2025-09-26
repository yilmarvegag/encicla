using Encicla.API.Abstractions;
using Encicla.Application.Features.Commands.OTPs.SendOTP;
using Encicla.Application.Features.Commands.OTPs.VerifyOTP;
using Encicla.Domain.Wrappers;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Encicla.API.Controllers.OTP
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    public class OTPController : ApiController
    {
        public OTPController(IMediator mediator) : base(mediator)
        {
        }

        /// <summary>POST /api/v{version}/otp/send</summary>
        /// <remarks>Envía un OTP al correo electrónico proporcionado.</remarks>
        [HttpPost("send")]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpCommand request, CancellationToken ct)
        {
            var result = await _mediator.Send(request, ct);
            return Handle(result);
        }

        /// <summary>POST /api/v{version}/otp/verify</summary>
        /// <remarks>Verifica un OTP para el correo electrónico proporcionado.</remarks>
        [HttpPost("verify")]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpCommand request, CancellationToken ct)
        {
            var result = await _mediator.Send(request, ct);
            return Handle(result);
        }
    }
}
