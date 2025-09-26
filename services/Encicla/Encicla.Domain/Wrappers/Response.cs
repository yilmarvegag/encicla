using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace Encicla.Domain.Wrappers
{
    public class Response : ProblemDetails
    {
        [JsonPropertyName("message")] public string Message { get; set; } = string.Empty;
        [JsonPropertyName("data")] public object? Data { get; set; }
        [JsonPropertyName("errors")] public List<Error> Errors { get; set; } = new();
    }

    public class Response<T> : ProblemDetails
    {
        [JsonPropertyName("message")] public string Message { get; set; } = string.Empty;
        [JsonPropertyName("data")] public T? Data { get; set; }
        [JsonPropertyName("errors")] public List<Error> Errors { get; set; } = new();
    }
}
