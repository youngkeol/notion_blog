// 이 함수는 더 이상 사용되지 않지만 기존 코드와의 호환성을 위해 유지
// 새로운 API에서는 데이터베이스 쿼리 결과에서 직접 페이지 ID를 가져옵니다
export default function getAllPageIds(
  response?: any,
  viewId?: string
) {
  // 새로운 API에서는 이 함수가 필요하지 않습니다
  // getPosts 함수에서 직접 데이터베이스 쿼리 결과를 처리합니다
  console.warn('[notion] getAllPageIds is deprecated with new API. Use database query results directly.')
  return []
}
