using Encicla.Domain.DTOs;

namespace Encicla.Application.Abstractions.Services
{
    /// <summary>
    /// Read-only access to static geographic data (municipalities & neighborhoods).
    /// Implementations must be in Infrastructure.
    /// </summary>
    public interface IGeoDataReadService
    {
        Task<IReadOnlyList<MunicipalityDto>> GetMunicipalitiesAsync(CancellationToken ct);
        Task<IReadOnlyList<NeighborhoodDto>> GetNeighborhoodsAsync(int municipalityId, CancellationToken ct);
    }
}
