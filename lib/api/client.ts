import { apiCache, debounce } from '@/lib/utils/performance';

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export class APIClient {
  private baseURL: string;
  
  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  // 通用请求方法with缓存
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<APIResponse<T>> {
    // 检查缓存
    if (cacheKey && apiCache.has(cacheKey)) {
      return { data: apiCache.get(cacheKey), status: 200 };
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'Request failed',
          status: response.status,
        };
      }

      // 缓存成功的GET请求
      if (cacheKey && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        apiCache.set(cacheKey, data, cacheTTL);
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // GET请求（带缓存）
  async get<T>(endpoint: string, cacheTTL: number = 5 * 60 * 1000): Promise<APIResponse<T>> {
    const cacheKey = `GET:${endpoint}`;
    return this.request<T>(endpoint, { method: 'GET' }, cacheKey, cacheTTL);
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 清除缓存
  clearCache(): void {
    apiCache.clear();
  }

  // 清除特定缓存
  clearCacheByPattern(pattern: string): void {
    // 这里可以实现更复杂的缓存清除逻辑
    apiCache.clear(); // 简化实现
  }
}

// 创建默认客户端实例
export const apiClient = new APIClient();

// 特定API方法with优化
export class GameAPI {
  private client: APIClient;
  
  constructor(client: APIClient = apiClient) {
    this.client = client;
  }

  // 获取玩家列表（长时间缓存）
  async getPlayers() {
    return this.client.get('/api/players', 10 * 60 * 1000); // 10分钟缓存
  }

  // 获取游戏统计（短时间缓存）
  async getGameStats(gameId: number) {
    return this.client.get(`/api/stats/games/${gameId}`, 2 * 60 * 1000); // 2分钟缓存
  }

  // 获取玩家统计（中等时间缓存）
  async getPlayerStats(playerId: number) {
    return this.client.get(`/api/stats/${playerId}`, 5 * 60 * 1000); // 5分钟缓存
  }

  // 获取游戏历史（短时间缓存）
  async getGameHistory() {
    return this.client.get('/api/games', 1 * 60 * 1000); // 1分钟缓存
  }

  // 获取游戏移动记录（短时间缓存）
  async getGameMoves(gameId: number) {
    return this.client.get(`/api/moves/${gameId}`, 30 * 1000); // 30秒缓存
  }

  // 创建游戏（无缓存）
  async createGame(gameData: any) {
    const result = await this.client.post('/api/games', gameData);
    // 创建游戏后清除相关缓存
    this.client.clearCacheByPattern('/api/games');
    return result;
  }

  // 更新游戏（无缓存）
  async updateGame(gameId: number, gameData: any) {
    const result = await this.client.put(`/api/games/${gameId}`, gameData);
    // 更新游戏后清除相关缓存
    this.client.clearCacheByPattern('/api/games');
    this.client.clearCacheByPattern(`/api/stats`);
    return result;
  }

  // 保存游戏移动（无缓存）
  async saveGameMove(moveData: any) {
    const result = await this.client.post('/api/moves', moveData);
    // 保存移动后清除相关缓存
    this.client.clearCacheByPattern('/api/moves');
    return result;
  }
}

// 防抖的API调用（用于频繁调用的场景）
export const debouncedAPICall = debounce(async (endpoint: string, options?: RequestInit) => {
  return fetch(endpoint, options);
}, 300);

// 创建游戏API实例
export const gameAPI = new GameAPI();