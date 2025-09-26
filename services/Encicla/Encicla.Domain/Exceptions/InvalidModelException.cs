using Encicla.Domain.Wrappers;
using FluentValidation.Results;

namespace Encicla.Domain.Exceptions
{
    public sealed class InvalidModelException : EnciclaDomainException
    {
        public List<Error> Errors { get; set; } = [];

        public InvalidModelException() : base("One or more validation failures have occurred.")
        {
        }

        public InvalidModelException(string message) : base(message)
        {
        }

        public InvalidModelException(IEnumerable<ValidationFailure> failures) : this()
        {
            foreach (var error in failures)
            {
                Errors.Add(new Error(error.PropertyName, error.ErrorMessage));
            }
        }
    }
}
