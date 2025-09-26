using Encicla.API.Abstractions;
using Encicla.Application.Features.Queries.Municipalities.GetMunicipalityList;
using Encicla.Application.Features.Queries.Neighborhoods.GetNeighborhoodsByMunicipalityId;
using Encicla.Domain.DTOs;
using Encicla.Domain.Wrappers;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Encicla.API.Controllers.Municipality
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    public class MunicipalityController : ApiController
    {
        public MunicipalityController(IMediator mediator) : base(mediator) { }

        /// <summary>GET /api/geo/municipalities</summary>
        [HttpGet]
        [ProducesResponseType(typeof(Response<List<MunicipalityDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMunicipalities(CancellationToken ct)
        {
            var result = await _mediator.Send(new GetMunicipalityListQuery(), ct);
            return Handle(result);
        }

        /// <summary>GET /api/geo/municipalities/{municipalityId}/neighborhoods</summary>
        [HttpGet("{municipalityId}/neighborhoods")]
        [ProducesResponseType(typeof(Response<List<NeighborhoodDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetNeighborhoods([FromRoute] int municipalityId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetNeighborhoodsByMunicipalityIdQuery(municipalityId), ct);
            return Handle(result);
        }
    }
}
