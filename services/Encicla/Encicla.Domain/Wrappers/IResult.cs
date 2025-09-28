namespace Encicla.Domain.Wrappers
{
    public interface IResult
    {
        bool IsSuccess { get; }
        string? Message { get; }
        string? Detail { get; }
    }
}
