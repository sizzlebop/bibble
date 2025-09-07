# Weather Configuration Enhancement

**Added:** Weather configuration wizard and smart default location handling in Bibble v1.7.4

## New Configuration Command

### `bibble config weather`

Launches an interactive configuration wizard for weather settings.

**Features:**
- 🔑 **API Key Setup**: Configure OpenWeatherMap API key with validation
- 📍 **Default Location**: Set your preferred location for weather queries
- 🌡️ **Unit Preferences**: Choose between metric, imperial, or kelvin units
- ⚙️ **Advanced Settings**: Configure cache duration and rate limits
- ✅ **Beautiful UI**: Pink Pixel themed configuration wizard with emojis and status indicators

## Configuration Options

| Setting | Key | Description | Default |
|---------|-----|-------------|----------|
| **API Key** | `weather.apiKey` | OpenWeatherMap API key | `process.env.OPENWEATHER_API_KEY` |
| **Default Location** | `weather.defaultLocation` | Default location for weather queries | `""` (empty) |
| **Units** | `weather.units` | Temperature units | `"metric"` |
| **Cache Duration** | `weather.cacheMinutes` | Weather result cache time | `10` minutes |
| **Rate Limit** | `weather.rateLimitPerHour` | API requests per hour | `1000` |
| **Request Timeout** | `weather.requestTimeoutMs` | API request timeout | `10000` ms |

## Smart Location Handling

### Priority Order:
1. **Explicit Parameter**: `location` parameter in tool call
2. **Default Location**: User-configured default location
3. **Error with Help**: Helpful error message if neither is provided

### Usage Examples:

#### With Default Location Configured:
```bash
# Uses default location
> What's the weather like today?
🌤️ Bibble uses configured default location...

# Override with specific location
> What's the weather in Tokyo?
🌤️ Bibble uses Tokyo instead of default...
```

#### Without Default Location:
```bash
> What's the weather like today?
❌ No location specified. Please provide a location or run 'bibble config weather'.

# Provide location explicitly
> What's the weather in London?
🌤️ Bibble gets weather for London...
```

## Configuration Wizard Flow

```
🌤️ Weather Configuration ✨

Set up your OpenWeatherMap API key, default location, and preferred units.

✓ Do you want to configure your OpenWeatherMap API key? Yes
  Get a free API key at: https://openweathermap.org/api
  
  🔐 Enter your OpenWeatherMap API key: [hidden input]

✓ Do you want to set a default location for weather queries? Yes
  You can use city names, zip codes, or coordinates (lat,lon).
  
  📍 Enter your default location: New York

🌡️ Preferred temperature units:
  > Metric (°C, m/s)
    Imperial (°F, mph)
    Kelvin (K, m/s)

⚙️ Configure advanced settings? No

✅ Weather configuration saved successfully!

Configuration Summary:
  API Key: ✓ Configured
  Default Location: New York
  Units: Metric (°C)
  Cache Duration: 10 minutes
  Rate Limit: 1000 requests/hour
```

## Enhanced Weather Tool

### Updated Parameters:
- `location` (optional): City, zip code, or coordinates
- `units` (optional): 'metric' | 'imperial' | 'kelvin'
- `includeforecast` (optional): Include weather forecast
- `forecastDays` (optional): Number of forecast days (1-5)

### Intelligent Defaults:
- **Location**: Uses configured default or prompts for specification
- **Units**: Uses configured preference (default: metric)
- **API Key**: Uses configured key or environment variable
- **Caching**: Uses configured duration (default: 10 minutes)

### Error Messages:
- **No API Key**: "Please run 'bibble config weather' to set up your API key."
- **No Location**: "Please provide a location or configure default with 'bibble config weather'."
- **Invalid Location**: "Location '[location]' not found. Please check spelling or try different format."
- **Rate Limited**: "Rate limit exceeded. Please wait [time] before more requests."

## Benefits

### For Users:
- 🎯 **Seamless Experience**: "What's the weather?" just works with default location
- 🔧 **Easy Setup**: Beautiful configuration wizard guides setup
- 🌍 **Flexible Usage**: Override default location anytime
- ⚡ **Smart Caching**: Configurable cache prevents redundant API calls
- 🛡️ **Rate Protection**: Built-in rate limiting prevents API quota exhaustion

### For LLM Interaction:
- 🤖 **Context Aware**: LLM can request weather without always specifying location
- 💬 **Natural Language**: "What's the weather today?" vs "What's the weather in [location]?"
- 🔄 **Fallback Logic**: Clear error messages when location missing
- 📊 **Consistent Units**: User preference respected across all weather queries

## Configuration Management

### View Current Settings:
```bash
bibble config list
# Shows weather.* settings in beautiful table format

bibble config get weather.defaultLocation
# Get specific weather setting
```

### Manual Configuration:
```bash
bibble config set weather.apiKey "your-api-key-here"
bibble config set weather.defaultLocation "San Francisco"
bibble config set weather.units "imperial"
```

### Environment Variable Support:
```bash
# Still supported for API key
export OPENWEATHER_API_KEY="your-api-key-here"

# Config takes precedence over environment variable
```

## Technical Implementation

### Configuration Integration:
- **Config Class**: Uses existing Bibble configuration system
- **Dot Notation**: Settings stored as `weather.*` keys
- **Validation**: Input validation in configuration wizard
- **Type Safety**: TypeScript interfaces for all configuration

### Tool Enhancement:
- **Parameter Resolution**: Smart resolution order (param → config → error)
- **Backward Compatible**: Existing tool calls continue to work
- **Error Handling**: Helpful error messages guide users to configuration
- **Caching Integration**: Uses configured cache duration dynamically

### Security Features:
- **API Key Protection**: Configuration wizard uses password input type
- **Rate Limiting**: Per-hour limits prevent API quota exhaustion
- **Input Validation**: Location and API key validation in wizard
- **Error Messages**: No sensitive data exposed in error messages

This enhancement makes Bibble's weather tool much more user-friendly while maintaining full flexibility for power users! 🌤️✨
