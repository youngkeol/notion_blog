/**
 * Notion API Rate Limiting 상태를 확인하는 유틸리티 함수
 */

export interface RateLimitInfo {
  isRateLimited: boolean;
  remainingRequests?: number;
  resetTime?: Date;
  retryAfter?: number;
  statusCode?: number;
  errorType?: 'rate_limit' | 'server_error' | 'unknown';
}

export const checkRateLimit = (error: any): RateLimitInfo => {
  const result: RateLimitInfo = {
    isRateLimited: false,
  };

  if (!error.response) {
    return result;
  }

  const status = error.response.status;
  const headers = error.response.headers;

  result.statusCode = status;

  // Rate limiting 관련 헤더 확인
  if (headers['x-ratelimit-remaining']) {
    result.remainingRequests = parseInt(headers['x-ratelimit-remaining']);
  }

  if (headers['x-ratelimit-reset']) {
    result.resetTime = new Date(parseInt(headers['x-ratelimit-reset']) * 1000);
  }

  if (headers['retry-after']) {
    result.retryAfter = parseInt(headers['retry-after']);
  }

  // 에러 타입 분류
  if (status === 429) {
    result.isRateLimited = true;
    result.errorType = 'rate_limit';
  } else if (status >= 500) {
    result.errorType = 'server_error';
  } else {
    result.errorType = 'unknown';
  }

  return result;
};

export const logRateLimitInfo = (rateLimitInfo: RateLimitInfo) => {
  console.log("🔍 Rate Limiting 분석 결과:");
  console.log(`   상태 코드: ${rateLimitInfo.statusCode}`);
  console.log(`   Rate Limit 여부: ${rateLimitInfo.isRateLimited ? '예' : '아니오'}`);
  
  if (rateLimitInfo.remainingRequests !== undefined) {
    console.log(`   남은 요청 수: ${rateLimitInfo.remainingRequests}`);
  }
  
  if (rateLimitInfo.resetTime) {
    console.log(`   리셋 시간: ${rateLimitInfo.resetTime.toLocaleString()}`);
  }
  
  if (rateLimitInfo.retryAfter) {
    console.log(`   재시도 대기 시간: ${rateLimitInfo.retryAfter}초`);
  }
  
  console.log(`   에러 타입: ${rateLimitInfo.errorType}`);
  
  // 해결 방법 제시
  if (rateLimitInfo.isRateLimited) {
    console.log("💡 해결 방법:");
    console.log("   1. 잠시 후 재시도 (권장)");
    console.log("   2. 요청 빈도 줄이기");
    console.log("   3. 캐싱 활용");
  } else if (rateLimitInfo.errorType === 'server_error') {
    console.log("💡 해결 방법:");
    console.log("   1. 잠시 후 재시도");
    console.log("   2. Notion 서버 상태 확인");
  }
};
