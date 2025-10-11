import { getPageProperties as getPageProps, getUser } from "src/apis/notion-client/notionApi"
import { customMapImageUrl } from "./customMapImageUrl"

async function getPageProperties(
  id: string,
  block?: any,
  schema?: any
) {
  try {
    // 새로운 API를 사용하여 페이지 속성 가져오기
    const pageProps = await getPageProps(id)
    const properties: any = { id }

    if ((pageProps as any).properties) {
      for (const [key, value] of Object.entries((pageProps as any).properties)) {
        const typedValue = value as any
        switch (typedValue.type) {
          case 'title':
            properties[key] = typedValue.title?.[0]?.plain_text || ''
            break
          case 'rich_text':
            properties[key] = typedValue.rich_text?.[0]?.plain_text || ''
            break
          case 'date':
            properties[key] = typedValue.date ? {
              start_date: typedValue.date.start,
              end_date: typedValue.date.end
            } : null
            break
          case 'select':
            properties[key] = typedValue.select?.name || ''
            break
          case 'multi_select':
            properties[key] = typedValue.multi_select?.map((item: any) => item.name) || []
            break
          case 'checkbox':
            properties[key] = typedValue.checkbox
            break
          case 'number':
            properties[key] = typedValue.number
            break
          case 'url':
            properties[key] = typedValue.url
            break
          case 'email':
            properties[key] = typedValue.email
            break
          case 'phone_number':
            properties[key] = typedValue.phone_number
            break
          case 'files': {
            try {
              if (typedValue.files && typedValue.files.length > 0) {
                const file = typedValue.files[0]
                if (file.type === 'external') {
                  // 외부 URL은 그대로 사용
                  properties[key] = file.external.url
                } else if (file.type === 'file') {
                  // Notion 파일은 customMapImageUrl 사용
                  const newurl = customMapImageUrl(file.file.url, pageProps as any)
                  properties[key] = newurl
                }
              } else {
                properties[key] = undefined
              }
            } catch (error) {
              console.error(`[notion] Error processing file for ${key}:`, error)
              properties[key] = undefined
            }
            break
          }
          case 'created_time':
            properties[key] = typedValue.created_time
            break
          case 'created_by': {
            try {
              if (typedValue.created_by?.id) {
                const user = await getUser(typedValue.created_by.id)
                properties[key] = {
                  id: user.id,
                  name: (user as any).name || `${(user as any).family_name || ''}${(user as any).given_name || ''}` || undefined,
                  profile_photo: (user as any).avatar_url || null,
                }
              }
            } catch (error) {
              properties[key] = typedValue.created_by
            }
            break
          }
          case 'last_edited_time':
            properties[key] = typedValue.last_edited_time
            break
          case 'last_edited_by': {
            try {
              if (typedValue.last_edited_by?.id) {
                const user = await getUser(typedValue.last_edited_by.id)
                properties[key] = {
                  id: user.id,
                  name: (user as any).name || `${(user as any).family_name || ''}${(user as any).given_name || ''}` || undefined,
                  profile_photo: (user as any).avatar_url || null,
                }
              }
            } catch (error) {
              properties[key] = typedValue.last_edited_by
            }
            break
          }
          case 'people': {
            try {
              const users = []
              for (const person of typedValue.people || []) {
                if (person.id) {
                  const user = await getUser(person.id)
                  users.push({
                    id: user.id,
                    name: (user as any).name || `${(user as any).family_name || ''}${(user as any).given_name || ''}` || undefined,
                    profile_photo: (user as any).avatar_url || null,
                  })
                }
              }
              properties[key] = users
            } catch (error) {
              properties[key] = typedValue.people || []
            }
            break
          }
          default:
            properties[key] = typedValue
        }
      }
    }

    return properties
  } catch (error) {
    console.error(`[notion] Error getting page properties for ${id}:`, error)
    return { id }
  }
}

export { getPageProperties as default }
