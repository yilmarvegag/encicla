using Encicla.Application.Abstractions.Messaging;
using Encicla.Application.Abstractions.Services;
using Encicla.Domain.DTOs;
using Encicla.Domain.Wrappers;

namespace Encicla.Application.Features.Queries.Neighborhoods.GetNeighborhoodsByMunicipalityId
{
    internal sealed class GetNeighborhoodsByMunicipalityIdQueryHandler(IGeoDataReadService _geo) : IQueryHandler<GetNeighborhoodsByMunicipalityIdQuery, IReadOnlyList<NeighborhoodDto>>
    {
        public async Task<Result<IReadOnlyList<NeighborhoodDto>>> Handle(GetNeighborhoodsByMunicipalityIdQuery request, CancellationToken cancellationToken)
        {
            var list = await _geo.GetNeighborhoodsAsync(request.MunicipalityId, cancellationToken);
            return Result<IReadOnlyList<NeighborhoodDto>>.Success(list);
        }
    }
}
