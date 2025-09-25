namespace Encicla.Infrastructure.Geo
{
    public sealed class JsonGeoOptions
    {
        /// <summary>
        /// Relative paths from ContentRoot (they will exist because we copy them)
        /// </summary>
        public string MunicipalitiesPath { get; init; } =
            Path.Combine("StaticData", "Geo", "municipalities.json");

        public string NeighborhoodsByMunicipalityPath { get; init; } =
            Path.Combine("StaticData", "Geo", "neighborhoods_by_municipality.json");

        /// <summary>
        /// Optional external override (for prod hot-swap)
        /// </summary>
        public string? ExternalRoot { get; init; } // e.g. /mnt/config/encicla/geo
    }
}
