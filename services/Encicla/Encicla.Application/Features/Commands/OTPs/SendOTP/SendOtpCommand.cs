using Encicla.Application.Abstractions.Messaging;

namespace Encicla.Application.Features.Commands.OTPs.SendOTP
{
    public sealed record class SendOtpCommand(string Email) : ICommand<bool>;
}
