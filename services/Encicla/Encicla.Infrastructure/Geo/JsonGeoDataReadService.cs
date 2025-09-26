using Encicla.Application.Abstractions.Services;
using Encicla.Domain.DTOs;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace Encicla.Infrastructure.Geo
{
    /// <summary>
    /// Reads geo data (municipalities & neighborhoods) from JSON files under StaticData/geo.
    /// Files are content-copied to the output directory (see .csproj).
    /// </summary>
    public sealed class JsonGeoDataReadService : IGeoDataReadService
    {
        private readonly ILogger<JsonGeoDataReadService> _logger;
        private readonly JsonSerializerOptions _json;
        private readonly string _municipalitiesPath;
        private readonly string _neighborhoodsByMunicipalityPath;

        public JsonGeoDataReadService(
            IHostEnvironment env,
            IOptions<JsonGeoOptions> options,
            ILogger<JsonGeoDataReadService> logger)
        {
            _logger = logger;
            _json = new JsonSerializerOptions(JsonSerializerDefaults.Web);

            var opt = options.Value;

            // If ExternalRoot configured and exists, prefer it. Otherwise ContentRoot.
            var root = !string.IsNullOrWhiteSpace(opt.ExternalRoot) &&
                       Directory.Exists(opt.ExternalRoot)
                ? opt.ExternalRoot!
                : env.ContentRootPath;

            _municipalitiesPath = Path.Combine(root, opt.MunicipalitiesPath);
            _neighborhoodsByMunicipalityPath = Path.Combine(root, opt.NeighborhoodsByMunicipalityPath);

            _logger.LogInformation("Geo JSON root: {Root}", root);
        }

        public async Task<IReadOnlyList<MunicipalityDto>> GetMunicipalitiesAsync(CancellationToken ct)
        {
            if (!File.Exists(_municipalitiesPath))
            {
                _logger.LogWarning("Municipalities JSON not found at {Path}", _municipalitiesPath);
                return [];
            }

            await using var fs = File.OpenRead(_municipalitiesPath);
            var data = await JsonSerializer.DeserializeAsync<List<MunicipalityDto>>(fs, _json, ct);
            return (data ?? []).AsReadOnly();
        }

        public async Task<IReadOnlyList<NeighborhoodDto>> GetNeighborhoodsAsync(int municipalityId, CancellationToken ct)
        {
            if (!File.Exists(_neighborhoodsByMunicipalityPath))
            {
                _logger.LogWarning("Neighborhoods JSON not found at {Path}", _neighborhoodsByMunicipalityPath);
                return [];
            }

            await using var fs = File.OpenRead(_neighborhoodsByMunicipalityPath);
            var list = await JsonSerializer.DeserializeAsync<List<NeighborhoodDto>>(fs, _json, ct) ?? [];
            return (list.Where(n => n.IdMunicipality.Equals(municipalityId)).ToList() ?? []).AsReadOnly();
        }
    }
}
