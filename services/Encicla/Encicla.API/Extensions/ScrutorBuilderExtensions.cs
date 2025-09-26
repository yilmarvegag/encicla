using Scrutor;

namespace Encicla.API.Extensions
{
    /// <summary>
    /// Scrutor automatically registers all services with the ASP.NET Core DI container.
    /// https://andrewlock.net/using-scrutor-to-automatically-register-your-services-with-the-asp-net-core-di-container/
    /// </summary>
    public static class ScrutorBuilderExtensions
    {
        public static void ConfigureScrutor(this IServiceCollection services)
        {
            services.Scan(
                selector => selector
                .FromAssemblies(
                    Infrastructure.AssemblyReference.Assembly,
                    Persistence.AssemblyReference.Assembly)
                .AddClasses(false)
                .UsingRegistrationStrategy(RegistrationStrategy.Skip)
                .AsImplementedInterfaces()
                .WithScopedLifetime());
        }
    }
}
