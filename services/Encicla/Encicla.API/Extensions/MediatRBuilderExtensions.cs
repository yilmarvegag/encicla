using MediatR;
using System.Reflection;

namespace Encicla.API.Extensions
{
    /// <summary>
    /// Extensions to configure AssemblyReference for each project with MediatR.
    /// Adds the mediator and looks for all the IRequest and IRequestHandlers that our assembly has (that is, in our project).
    /// </summary>
    public static class MediatRBuilderExtensions
    {
        public static void ConfigureMediatR(this IServiceCollection services)
        {
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssemblies(
                Assembly.GetExecutingAssembly(),
                Application.AssemblyReference.Assembly,
                Infrastructure.AssemblyReference.Assembly,
                Persistence.AssemblyReference.Assembly);
            });
        }
    }
}
