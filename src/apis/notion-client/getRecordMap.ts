import { getPageContent, getPageProperties } from "./notionApi"

// 캐시 변수
const recordMapCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10분

export const getRecordMap = async (pageId: string) => {
  // 캐시 확인
  const now = Date.now()
  const cached = recordMapCache.get(pageId)
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  try {
    
    // 페이지 속성과 내용을 가져오기
    const [pageProperties, pageContent] = await Promise.all([
      getPageProperties(pageId),
      getPageContent(pageId)
    ])

    // API v1 데이터를 그대로 사용 (변환 없음)
    const recordMap: any = {
      block: {},
      collection: {},
      collection_view: {},
      notion_user: {},
      signed_urls: {}
    }

    // 페이지 블록
    recordMap.block[pageId] = {
      value: {
        id: pageId,
        type: 'page',
        content: pageContent.results?.map((block: any) => block.id) || []
      }
    }

    // children 블록들을 그대로 추가 (재귀적으로 자식 블록도 가져오기)
    const fetchChildBlocks = async (blocks: any[]) => {
      for (const block of blocks) {
        if (block && block.id) {
          recordMap.block[block.id] = {
            value: block
          }

          // has_children이 true이면 자식 블록 가져오기
          if (block.has_children) {
            try {
              const childContent = await getPageContent(block.id)
              if (childContent.results && childContent.results.length > 0) {
                // 재귀적으로 자식 블록 처리
                await fetchChildBlocks(childContent.results)
              }
            } catch (error) {
              console.error(`[notion] Error fetching child blocks for ${block.id}:`, error)
            }
          }
        }
      }
    }

    if (pageContent.results && pageContent.results.length > 0) {
      await fetchChildBlocks(pageContent.results)
    }

    // 캐시 저장
    recordMapCache.set(pageId, { data: recordMap, timestamp: now })

    return recordMap
  } catch (error) {
    console.error("[notion] Error fetching record map:", error)
    throw error
  }
}
