﻿namespace Encicla.API.Extensions
{
    public class LowercaseControllerTransformer : IOutboundParameterTransformer
    {
        public string? TransformOutbound(object? value)
        {
            return value?.ToString()?.ToLowerInvariant();
        }
    }
}
