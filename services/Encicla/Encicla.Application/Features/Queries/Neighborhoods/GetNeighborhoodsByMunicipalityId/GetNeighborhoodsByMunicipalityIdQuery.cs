using Encicla.Application.Abstractions.Messaging;
using Encicla.Domain.DTOs;

namespace Encicla.Application.Features.Queries.Neighborhoods.GetNeighborhoodsByMunicipalityId
{
    public sealed record GetNeighborhoodsByMunicipalityIdQuery(int MunicipalityId) : IQuery<IReadOnlyList<NeighborhoodDto>>;
}
