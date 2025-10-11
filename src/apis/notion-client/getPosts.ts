import { CONFIG } from "site.config"
import { queryDatabase, getPageProperties as getPageProps } from "./notionApi"
import { TPosts } from "src/types"
import { customMapImageUrl } from "src/libs/utils/notion/customMapImageUrl"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// 캐시 변수
let postsCache: TPosts | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  // 캐시 확인
  const now = Date.now()
  if (postsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return postsCache
  }
  const databaseId = CONFIG.notionConfig.pageId as string
  
  try {
    // 데이터베이스에서 페이지들 조회
    const response = await queryDatabase(databaseId)
    
    if (!response.results || response.results.length === 0) {
      return []
    }

    const data = []
    
            // 각 페이지의 상세 정보 가져오기 (병렬 처리)
            const pagePromises = response.results
              .filter(page => page.object === 'page')
              .map(async (page) => {
                try {
                  const pageProps = await getPageProps(page.id)
          
          // 페이지 속성에서 필요한 정보 추출
          const properties: any = {
            id: page.id,
            createdTime: new Date((page as any).created_time).toString(),
            fullWidth: false, // 기본값
          }

          // 페이지 속성들을 파싱
          if ((pageProps as any).properties) {
            Object.entries((pageProps as any).properties).forEach(([key, value]: [string, any]) => {
              switch (value.type) {
                case 'title':
                  properties[key] = value.title?.[0]?.plain_text || ''
                  break
                case 'rich_text':
                  properties[key] = value.rich_text?.[0]?.plain_text || ''
                  break
                case 'date':
                  properties[key] = value.date ? {
                    start_date: value.date.start,
                    end_date: value.date.end
                  } : null
                  break
                case 'select':
                  properties[key] = value.select?.name || null
                  break
                case 'multi_select':
                  properties[key] = value.multi_select?.map((item: any) => item.name) || []
                  break
                case 'checkbox':
                  properties[key] = value.checkbox || false
                  break
                case 'number':
                  properties[key] = value.number || null
                  break
                case 'url':
                  properties[key] = value.url || null
                  break
                case 'email':
                  properties[key] = value.email || null
                  break
                case 'phone_number':
                  properties[key] = value.phone_number || null
                  break
                case 'files': {
                  try {
                    if (value.files && value.files.length > 0) {
                      const file = value.files[0]
                      if (file.type === 'external') {
                        properties[key] = file.external.url
                      } else if (file.type === 'file') {
                        // Notion 파일은 customMapImageUrl 사용
                        const newurl = customMapImageUrl(file.file.url, pageProps as any)
                        properties[key] = newurl
                      }
                    } else {
                      properties[key] = null
                    }
                  } catch (error) {
                    console.error(`[notion] Error processing file for ${key}:`, error)
                    properties[key] = null
                  }
                  break
                }
                case 'created_time':
                  properties[key] = value.created_time
                  break
                case 'created_by':
                  properties[key] = value.created_by
                  break
                case 'last_edited_time':
                  properties[key] = value.last_edited_time
                  break
                case 'last_edited_by':
                  properties[key] = value.last_edited_by
                  break
                default:
                  properties[key] = value
              }
            })
          }

                  // 디버깅: 첫 번째 포스트의 속성 확인
              return properties
                } catch (error) {
                  console.error(`[notion] Error getting page properties for ${page.id}:`, error)
                  return null
                }
              })

            // 모든 페이지 속성을 병렬로 가져오기
            const pageResults = await Promise.all(pagePromises)
            data.push(...pageResults.filter(result => result !== null))

    // 날짜순으로 정렬
    data.sort((a: any, b: any) => {
      const dateA = new Date(a?.date?.start_date || a.createdTime)
      const dateB = new Date(b?.date?.start_date || b.createdTime)
      return dateB.getTime() - dateA.getTime()
    })

            const posts = data as TPosts
            
    // 캐시 저장
    postsCache = posts
    cacheTimestamp = now

    return posts
  } catch (error) {
    console.error('[notion] Error fetching posts:', error)
    return []
  }
}
