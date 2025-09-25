using Encicla.API.Extensions;
using Encicla.API.Filters;
using Encicla.API.Middlewares;
using Encicla.Application.Behaviours;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

/* Add services to the container */

// O usar caché en memoria para desarrollo
builder.Services.AddDistributedMemoryCache();

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

//Scrutor
builder.Services.ConfigureScrutor();

//MediatR
builder.Services.ConfigureMediatR();
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationPipelineBehavior<,>));
builder.Services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingPipelineBehavior<,>));

// Controllers
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateModelFilterAttribute>();
    options.Conventions.Add(new RouteTokenTransformerConvention(new LowercaseControllerTransformer()));
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Api versioning
builder.Services.ConfigureApiVersioning();

//Fluentvalidators
builder.Services.AddValidatorsFromAssembly(
    Encicla.Application.AssemblyReference.Assembly,
    includeInternalTypes: true);

// CORS
builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy("AllowAllOrigins", builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    }
    else if (builder.Environment.IsEnvironment("QA"))
    {
        options.AddPolicy("QACorsPolicy", builder =>
        {
            builder.WithOrigins("https://enicla.qa.net")  // Permite solo el frontend de QA
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    }
    else
    {
        options.AddPolicy("Restricted", builder =>
        {
            builder.WithOrigins("https://enicla.com")  // Permite solo el frontend de Producción
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    }
});

var app = builder.Build();

// Seguridad HTTP headers
app.Use(async (context, next) =>
{
    //Previene ataques de tipo MIME-sniffing
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    //Evita ataques de clickjacking
    context.Response.Headers["X-Frame-Options"] = "DENY";
    //Evita ataques de cross-site scripting (XSS)
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    //Mejora la seguridad obligando al navegador a rechazar conexiones HTTP inseguras, incluso si un usuario escribe manualmente http
    context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    await next();
});


// Usa la política CORS según el entorno
app.UseCors(builder.Environment.IsDevelopment()
                ? "AllowAllOrigins"
                : builder.Environment.IsEnvironment("QA")
                    ? "QACorsPolicy"
                    : "Restricted");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

//Middleware pipeline
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "StaticData")),
    //RequestPath = "/static"
});

app.MapControllers();

app.Run();
