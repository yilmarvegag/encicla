using Encicla.Domain.Repositories;
using Encicla.Domain.Wrappers;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Encicla.API.Abstractions
{
    /// <summary>
    /// Contains the statement to the mediator.
    /// </summary>
    public abstract class ApiController : ControllerBase
    {
        protected readonly IMediator _mediator;
        protected readonly IUnitOfWork? _unitOfWork;

        protected ApiController(IMediator mediator) => _mediator = mediator;
        protected ApiController(IMediator mediator, IUnitOfWork unitOfWork)
        { _mediator = mediator; _unitOfWork = unitOfWork; }

        protected IActionResult Handle(Result result)
        {
            var response = new Response
            {
                Instance = HttpContext.Request.Path,
                Title = result.IsSuccess ? HttpStatusCode.OK.ToString() : HttpStatusCode.BadRequest.ToString(),
                Status = result.IsSuccess ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest,
                Type = result.IsSuccess ? "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200"
                                            : "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
                Message = result.Message ?? string.Empty,
                Detail = result.Detail
            };
            return result.IsSuccess ? Ok(response) : BadRequest(response);
        }

        protected IActionResult Handle<T>(Result<T> result)
        {
            var response = new Response<T>
            {
                Instance = HttpContext.Request.Path,
                Title = result.IsSuccess ? HttpStatusCode.OK.ToString() : HttpStatusCode.BadRequest.ToString(),
                Status = result.IsSuccess ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest,
                Type = result.IsSuccess ? "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200"
                                            : "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
                Message = result.Message ?? string.Empty,
                Detail = result.Detail,
                Data = result.Value
            };
            return result.IsSuccess ? Ok(response) : BadRequest(response);
        }

        // Útil para capturar validaciones manuales en una sola línea
        protected IActionResult ValidationFailure(string message, IEnumerable<Error>? errs = null)
        {
            var response = new Response
            {
                Instance = HttpContext.Request.Path,
                Title = HttpStatusCode.BadRequest.ToString(),
                Status = StatusCodes.Status400BadRequest,
                Type = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
                Message = message,
                Errors = errs?.ToList() ?? []
            };
            return BadRequest(response);
        }
    }
}
