import { Client } from '@notionhq/client'
import { CONFIG } from 'site.config'

// Notion API 클라이언트 초기화
export const notion = new Client({
  auth: process.env.NOTION_TOKEN || CONFIG.notionConfig.notionToken,
})

// 데이터베이스 쿼리 함수
export const queryDatabase = async (databaseId: string, filter?: any, sorts?: any) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
    })
    return response
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// 페이지 내용 가져오기 함수
export const getPageContent = async (pageId: string) => {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    })
    return response
  } catch (error) {
    console.error('Get page content error:', error)
    throw error
  }
}

// 페이지 속성 가져오기 함수
export const getPageProperties = async (pageId: string) => {
  try {
    const response = await notion.pages.retrieve({
      page_id: pageId,
    })
    return response
  } catch (error) {
    console.error('Get page properties error:', error)
    throw error
  }
}

// 사용자 정보 가져오기 함수
export const getUser = async (userId: string) => {
  try {
    const response = await notion.users.retrieve({
      user_id: userId,
    })
    return response
  } catch (error) {
    console.error('Get user error:', error)
    throw error
  }
}
