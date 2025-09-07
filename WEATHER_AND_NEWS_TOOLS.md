# Weather and News Tools for Bibble

This document describes the new native weather and news tools added to Bibble v1.7.2.

## Weather Tool 🌤️

### `get-weather`

Get current weather and optional forecast for any location using the OpenWeatherMap API.

**Parameters:**
- `location` (string, required): City name, zip code, or coordinates
- `units` (enum, optional): 'metric' | 'imperial' | 'kelvin' (default: 'metric')
- `includeforecast` (boolean, optional): Include weather forecast (default: false)
- `forecastDays` (number, optional): Number of forecast days 1-5 (default: 3)

**Features:**
- ✅ Current weather conditions
- ✅ Optional 5-day forecast
- ✅ Multiple unit systems (Celsius, Fahrenheit, Kelvin)
- ✅ Rate limiting and caching
- ✅ Beautiful formatted output with emojis
- ✅ Support for cities, zip codes, and coordinates

**Setup Required:**
```bash
# Set your OpenWeatherMap API key
export OPENWEATHER_API_KEY="your_api_key_here"
```

**Example Usage:**
```bash
# Get current weather for London
get-weather: {"location": "London", "units": "metric"}

# Get weather with 5-day forecast for New York
get-weather: {"location": "New York", "units": "imperial", "includeforecast": true, "forecastDays": 5}

# Get weather for coordinates
get-weather: {"location": "40.7128,-74.0060", "units": "metric"}
```

**Sample Output:**
```
🌡️  Temperature: 22°C (feels like 24°C)
🌤️  Condition: partly cloudy
💧 Humidity: 65%
🌬️  Wind: 3.2 m/s NW
🔍 Visibility: 10km
☁️  Cloudiness: 40%
🌅 Sunrise: 6:30 AM | Sunset: 8:15 PM

📅 3-Day Forecast:
  Today: 25°C/18°C - partly cloudy
  Tomorrow: 23°C/16°C - light rain
  Day 3: 20°C/14°C - overcast
```

---

## News Tools 📰

### `get-hackernews-stories`

Get the latest stories from Hacker News with optional comments.

**Parameters:**
- `storyType` (enum, optional): 'top' | 'new' | 'best' | 'ask' | 'show' | 'job' (default: 'top')
- `maxStories` (number, optional): Number of stories 1-50 (default: 10)
- `includeComments` (boolean, optional): Include top comments (default: false)
- `maxComments` (number, optional): Max comments per story 1-20 (default: 3)

**Features:**
- ✅ Multiple story types (top, new, best, ask HN, show HN, jobs)
- ✅ Optional top comments for each story
- ✅ Rate limiting and caching
- ✅ Clean formatted output
- ✅ No API key required

### `get-hackernews-story`

Get detailed information about a specific Hacker News story by ID.

**Parameters:**
- `storyId` (number, required): The Hacker News story ID
- `includeComments` (boolean, optional): Include comments (default: true)
- `maxComments` (number, optional): Max comments 1-20 (default: 5)

**Example Usage:**
```bash
# Get top 5 stories
get-hackernews-stories: {"storyType": "top", "maxStories": 5}

# Get latest "Ask HN" stories with comments
get-hackernews-stories: {"storyType": "ask", "maxStories": 8, "includeComments": true}

# Get specific story details
get-hackernews-story: {"storyId": 40123456, "includeComments": true}
```

**Sample Output:**
```
📰 Top 3 stories from Hacker News:

1. Revolutionary AI Framework Changes Everything
   🔗 https://example.com/ai-framework (example.com)
   👤 techuser | 📊 256 points | 💬 89 comments | ⏰ 2h ago
   📝 This new framework promises to revolutionize how we think about AI...
   
2. Show HN: I built a terminal-based chatbot
   🔗 https://github.com/user/project (github.com)
   👤 developer123 | 📊 124 points | 💬 34 comments | ⏰ 4h ago
   💬 Top Comments:
      "This looks amazing! Great work." - commenter1 (1h ago)
      "How does this compare to existing solutions?" - commenter2 (45m ago)
```

---

## Integration Features

### Beautiful UI Integration
- **Weather Icon**: 🌤️ with cyan theming
- **News Icon**: 📰 with orange theming
- **Status Indicators**: Animated loading and completion states
- **Rich Formatting**: Emojis, colors, and structured output
- **Error Handling**: Clear, user-friendly error messages

### Performance Features
- **Caching**: Weather (10 minutes), News (5 minutes)
- **Rate Limiting**: Prevents API overuse
- **Batch Processing**: Efficient parallel requests
- **Timeout Handling**: Graceful timeout management
- **Fallback Support**: Comprehensive error recovery

### Security Features
- **Input Validation**: All parameters validated with Zod schemas
- **API Key Protection**: Secure handling of API keys
- **Safe HTML Stripping**: Clean text extraction from HTML content
- **Rate Limiting**: Prevents abuse and API quota exhaustion

---

## Technical Implementation

### Architecture
- **Built-in Tools**: No external MCP server dependencies
- **TypeScript**: Full type safety and validation
- **Zod Schemas**: Parameter validation and type inference
- **Axios Integration**: Robust HTTP client with timeouts
- **Caching System**: Memory-based result caching
- **Error Handling**: Comprehensive error recovery

### Tool Categories
- **Weather**: `weather` category with 🌤️ icon
- **News**: `news` category with 📰 icon
- **Integration**: Seamless integration with existing tool system

### Compatibility
- **All Providers**: Works with OpenAI, Anthropic, Google Gemini, and compatible endpoints
- **Cross-Platform**: Full Windows, macOS, and Linux support
- **Theme System**: Integrates with Pink Pixel theme system
- **Icon System**: Beautiful contextual icons and status indicators

---

## Getting Started

1. **Weather Setup**: Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. **Set Environment Variable**: `export OPENWEATHER_API_KEY="your_key"`
3. **News Ready**: Hacker News tools work immediately (no setup required)
4. **Start Using**: Tools are automatically available in Bibble v1.7.2+

**Example Chat Session:**
```
> What's the weather like in San Francisco?
🌤️ Bibble will use get-weather tool...

> Show me the top Hacker News stories
📰 Bibble will use get-hackernews-stories tool...

> Get me a 5-day forecast for Tokyo with metric units
🌤️ Bibble will use get-weather with forecast...
```

These tools extend Bibble's native capabilities, making it an even more powerful AI assistant for staying informed about weather and tech news! 🚀✨
