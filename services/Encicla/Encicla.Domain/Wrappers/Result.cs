namespace Encicla.Domain.Wrappers
{
    public readonly record struct Result : IResult
    {
        public bool IsSuccess { get; init; }
        public string? Message { get; init; }
        public string? Detail { get; init; }

        public static Result Success(string? message = null) => new() { IsSuccess = true, Message = message };
        public static Result Failure(string message, string? detail = null) => new() { IsSuccess = false, Message = message, Detail = detail };
    }

    public readonly record struct Result<T> : IResult
    {
        public bool IsSuccess { get; init; }
        public string? Message { get; init; }
        public string? Detail { get; init; }
        public T? Value { get; init; }

        public static Result<T> Success(T value, string? message = null) => new() { IsSuccess = true, Value = value, Message = message };
        public static Result<T> Failure(string message, string? detail = null) => new() { IsSuccess = false, Message = message, Detail = detail };
    }
}
