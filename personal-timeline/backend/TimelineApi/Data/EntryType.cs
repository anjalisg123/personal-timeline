using System.Text.Json.Serialization;

namespace TimelineApi.Data;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EntryType
{
    Achievement = 0,
    Activity    = 1,
    Milestone   = 2,
    Memory      = 3
}
