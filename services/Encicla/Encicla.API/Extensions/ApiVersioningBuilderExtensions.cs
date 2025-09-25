using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace Encicla.API.Extensions
{
    /// <summary>
    /// Allows api versioning in controller, swagger, etc.
    /// </summary>
    public static class ApiVersioningBuilderExtensions
    {
        public static void ConfigureApiVersioning(this IServiceCollection services)
        {
            services.AddApiVersioning(options =>
            {
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.ReportApiVersions = true;
                options.ApiVersionReader = ApiVersionReader.Combine(
                    new UrlSegmentApiVersionReader(),
                    new HeaderApiVersionReader("x-api-version"),
                    new MediaTypeApiVersionReader("v")
                );
            })
            .AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
                options.DefaultApiVersion = new ApiVersion(1, 0);
            });

            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
                options.SuppressMapClientErrors = true;
            });
        }
    }
}
