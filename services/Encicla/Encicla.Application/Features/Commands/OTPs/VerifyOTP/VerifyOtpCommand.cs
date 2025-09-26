using Encicla.Application.Abstractions.Messaging;

namespace Encicla.Application.Features.Commands.OTPs.VerifyOTP
{
    public sealed record class VerifyOtpCommand(string Email, string Otp) : ICommand<bool>;
}
