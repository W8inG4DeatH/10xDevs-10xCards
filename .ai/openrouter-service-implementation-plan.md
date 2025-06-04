# OpenRouter Service Implementation Plan

## 1. Service Description

The OpenRouter service will act as a bridge between our application and the OpenRouter.ai API, providing access to various LLM models. The service will be implemented as a TypeScript class that handles all communication with OpenRouter.ai, manages API responses, and provides a clean interface for chat-based interactions.

## 2. Constructor

```typescript
class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://openrouter.ai/api/v1";
  private readonly defaultModel: string;
  private readonly defaultSystemMessage: string;

  constructor(config: OpenRouterConfig) {
    this.validateConfig(config);
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel;
    this.defaultSystemMessage = config.systemMessage;
  }
}
```

## 3. Public Methods and Fields

### 3.1 Chat Completion Method

```typescript
async createChatCompletion({
  messages,
  model = this.defaultModel,
  systemMessage = this.defaultSystemMessage,
  responseFormat,
  temperature = 0.7,
  maxTokens,
}: ChatCompletionParams): Promise<ChatCompletionResponse> {
  // Implementation details in section 4.1
}
```

### 3.2 Stream Chat Completion Method

```typescript
async createStreamingChatCompletion({
  messages,
  model = this.defaultModel,
  systemMessage = this.defaultSystemMessage,
  responseFormat,
  temperature = 0.7,
  maxTokens,
}: ChatCompletionParams): Promise<ReadableStream<ChatCompletionChunk>> {
  // Implementation details in section 4.2
}
```

### 3.3 Available Models Method

```typescript
async getAvailableModels(): Promise<ModelInfo[]> {
  // Implementation details in section 4.3
}
```

## 4. Private Methods and Fields

### 4.1 API Request Handler

```typescript
private async makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<T>
```

### 4.2 Request Validation

```typescript
private validateMessages(messages: ChatMessage[]): void
private validateConfig(config: OpenRouterConfig): void
```

### 4.3 Response Processing

```typescript
private processResponse(response: Response): Promise<unknown>
private processStreamResponse(response: Response): ReadableStream
```

## 5. Error Handling

### 5.1 Custom Error Types

```typescript
class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
  }
}
```

### 5.2 Error Categories

- Authentication Errors (401, 403)
- Rate Limiting Errors (429)
- API Errors (400, 500)
- Network Errors
- Validation Errors

## 6. Security Considerations

### 6.1 API Key Management

- Store API key in environment variables
- Never expose API key in client-side code
- Implement key rotation mechanism

### 6.2 Request/Response Security

- Implement request signing
- Validate all incoming data
- Sanitize responses before processing
- Set appropriate request timeouts

### 6.3 Rate Limiting

- Implement client-side rate limiting
- Track API usage
- Handle rate limit errors gracefully

## 7. Step-by-Step Implementation Plan

### Phase 1: Basic Setup

1. Create service directory structure:

   ```
   src/
   ├── lib/
   │   └── openrouter/
   │       ├── index.ts
   │       ├── types.ts
   │       ├── errors.ts
   │       └── constants.ts
   ```

2. Define core types:

   ```typescript
   // types.ts
   export interface OpenRouterConfig {
     apiKey: string;
     defaultModel: string;
     systemMessage: string;
   }

   export interface ChatMessage {
     role: "user" | "assistant" | "system";
     content: string;
   }
   ```

### Phase 2: Core Implementation

1. Implement base service class with constructor
2. Add API request handling methods
3. Implement message validation
4. Add error handling

### Phase 3: Chat Completion Features

1. Implement basic chat completion
2. Add streaming support
3. Implement response format handling
4. Add model selection support

### Phase 4: Advanced Features

1. Add rate limiting
2. Implement retry logic
3. Add logging and monitoring
4. Implement caching if needed

### Phase 5: Testing and Documentation

1. Write unit tests
2. Add integration tests
3. Create API documentation
4. Add usage examples

## 8. Usage Examples

### 8.1 Basic Chat Completion

```typescript
const openRouter = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: "anthropic/claude-2",
  systemMessage: "You are a helpful assistant.",
});

const response = await openRouter.createChatCompletion({
  messages: [{ role: "user", content: "Hello!" }],
});
```

### 8.2 Structured Response Format

```typescript
const response = await openRouter.createChatCompletion({
  messages: [{ role: "user", content: "List three colors." }],
  responseFormat: {
    type: "json_schema",
    json_schema: {
      name: "colors",
      strict: true,
      schema: {
        type: "object",
        properties: {
          colors: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
});
```

### 8.3 Streaming Chat Completion

```typescript
const stream = await openRouter.createStreamingChatCompletion({
  messages: [{ role: "user", content: "Tell me a story." }],
});

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

## 9. Environment Setup

Create a `.env` file with the following variables:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_DEFAULT_MODEL=anthropic/claude-2
OPENROUTER_SYSTEM_MESSAGE="You are a helpful assistant."
```

## 10. Next Steps

1. Review and implement the plan
2. Set up monitoring and logging
3. Create comprehensive test suite
4. Document API endpoints and usage
5. Set up CI/CD pipeline for testing
