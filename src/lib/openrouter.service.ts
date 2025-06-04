import type {
  OpenRouterConfig,
  ChatMessage,
  ChatCompletionParams,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ModelInfo,
  OpenRouterErrorResponse,
} from "./openrouter.types";
import { OpenRouterError } from "./openrouter.types";

export class OpenRouterService {
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

  // Public Methods
  async createChatCompletion({
    messages,
    model = this.defaultModel,
    systemMessage = this.defaultSystemMessage,
    responseFormat,
    temperature = 0.7,
    maxTokens,
  }: ChatCompletionParams): Promise<ChatCompletionResponse> {
    this.validateMessages(messages);

    const requestBody = this.buildChatCompletionRequest({
      messages,
      model,
      systemMessage,
      responseFormat,
      temperature,
      maxTokens,
      stream: false,
    });

    return this.makeRequest<ChatCompletionResponse>("/chat/completions", "POST", requestBody);
  }

  async createStreamingChatCompletion({
    messages,
    model = this.defaultModel,
    systemMessage = this.defaultSystemMessage,
    responseFormat,
    temperature = 0.7,
    maxTokens,
  }: ChatCompletionParams): Promise<ReadableStream<ChatCompletionChunk>> {
    this.validateMessages(messages);

    const requestBody = this.buildChatCompletionRequest({
      messages,
      model,
      systemMessage,
      responseFormat,
      temperature,
      maxTokens,
      stream: true,
    });

    const response = await this.makeStreamRequest("/chat/completions", requestBody);
    return this.processStreamResponse(response);
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    const response = await this.makeRequest<{ data: ModelInfo[] }>("/models", "GET");
    return response.data;
  }

  // Private Methods
  private validateConfig(config: OpenRouterConfig): void {
    if (!config.apiKey || typeof config.apiKey !== "string") {
      throw new OpenRouterError("API key is required and must be a string", "INVALID_CONFIG");
    }

    if (!config.defaultModel || typeof config.defaultModel !== "string") {
      throw new OpenRouterError("Default model is required and must be a string", "INVALID_CONFIG");
    }

    if (!config.systemMessage || typeof config.systemMessage !== "string") {
      throw new OpenRouterError("System message is required and must be a string", "INVALID_CONFIG");
    }
  }

  private validateMessages(messages: ChatMessage[]): void {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new OpenRouterError("Messages array is required and cannot be empty", "INVALID_MESSAGES");
    }

    for (const message of messages) {
      if (!message.role || !["user", "assistant", "system"].includes(message.role)) {
        throw new OpenRouterError(
          "Each message must have a valid role (user, assistant, or system)",
          "INVALID_MESSAGE_ROLE"
        );
      }

      if (!message.content || typeof message.content !== "string") {
        throw new OpenRouterError("Each message must have content as a string", "INVALID_MESSAGE_CONTENT");
      }
    }
  }

  private buildChatCompletionRequest(params: ChatCompletionParams): Record<string, unknown> {
    const { messages, model, systemMessage, responseFormat, temperature, maxTokens, stream } = params;

    // Prepare messages with system message
    const allMessages: ChatMessage[] = [];

    if (systemMessage) {
      allMessages.push({ role: "system", content: systemMessage });
    }

    allMessages.push(...messages);

    const requestBody: Record<string, unknown> = {
      model,
      messages: allMessages,
      temperature,
      stream: stream || false,
    };

    if (maxTokens) {
      requestBody.max_tokens = maxTokens;
    }

    if (responseFormat) {
      requestBody.response_format = responseFormat;
    }

    return requestBody;
  }

  private async makeRequest<T>(endpoint: string, method: "GET" | "POST", body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": import.meta.env.SITE || "http://localhost:4321",
      "X-Title": "10x Cards App",
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method === "POST") {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      return await this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      throw new OpenRouterError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "NETWORK_ERROR"
      );
    }
  }

  private async makeStreamRequest(endpoint: string, body: unknown): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": import.meta.env.SITE || "http://localhost:4321",
      "X-Title": "10x Cards App",
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response;
  }

  private async processResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new OpenRouterError("Failed to parse response JSON", "INVALID_RESPONSE", response.status);
    }
  }

  private processStreamResponse(response: Response): ReadableStream<ChatCompletionChunk> {
    const reader = response.body?.getReader();

    if (!reader) {
      throw new OpenRouterError("No response body available for streaming", "STREAM_ERROR");
    }

    return new ReadableStream<ChatCompletionChunk>({
      async start(controller) {
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data) as ChatCompletionChunk;
                  controller.enqueue(parsed);
                } catch {
                  // Skip invalid JSON lines
                  continue;
                }
              }
            }
          }
        } catch (error) {
          controller.error(
            new OpenRouterError(
              `Stream processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
              "STREAM_ERROR"
            )
          );
        }
      },
    });
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorCode = "HTTP_ERROR";

    try {
      const errorData = (await response.json()) as OpenRouterErrorResponse;
      if (errorData.error) {
        errorMessage = errorData.error.message;
        errorCode = errorData.error.code;
      }
    } catch {
      // If we can't parse the error response, use the default message
    }

    // Map HTTP status codes to specific error types
    switch (response.status) {
      case 401:
        throw new OpenRouterError("Invalid API key", "AUTHENTICATION_ERROR", response.status);
      case 403:
        throw new OpenRouterError("Access forbidden", "AUTHORIZATION_ERROR", response.status);
      case 429:
        throw new OpenRouterError("Rate limit exceeded", "RATE_LIMIT_ERROR", response.status);
      case 400:
        throw new OpenRouterError(errorMessage, "BAD_REQUEST", response.status);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new OpenRouterError("Server error", "SERVER_ERROR", response.status);
      default:
        throw new OpenRouterError(errorMessage, errorCode, response.status);
    }
  }
}
