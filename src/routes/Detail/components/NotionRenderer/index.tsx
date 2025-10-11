import { FC, useEffect } from "react"
import styled from "@emotion/styled"
import Prism from 'prismjs'
import 'katex/dist/katex.min.css'
import katex from 'katex'
import useScheme from "src/hooks/useScheme"

// 언어별 Prism 지원 추가
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markdown'

// Notion API v1 블록을 직접 렌더링하는 컴포넌트

type Props = {
  recordMap: any
}

const NotionRenderer: FC<Props> = ({ recordMap }) => {
  const [scheme] = useScheme()

  useEffect(() => {
    // 테마에 따라 Prism CSS 동적 로드
    const existingLink = document.querySelector('link[data-prism-theme]')
    if (existingLink) {
      existingLink.remove()
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.setAttribute('data-prism-theme', 'true')

    if (scheme === 'dark') {
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
    } else {
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
    }

    document.head.appendChild(link)
  }, [scheme])

  useEffect(() => {
    // 컴포넌트 마운트 후 코드 하이라이팅 적용
    Prism.highlightAll()
  }, [recordMap, scheme])

  if (!recordMap || !recordMap.block) {
    return <div>콘텐츠를 불러올 수 없습니다.</div>
  }

  const blocks = Object.values(recordMap.block) as any[]
  const pageBlock = blocks.find(b => b.value?.type === 'page')
  
  if (!pageBlock) {
    return <div>페이지를 찾을 수 없습니다.</div>
  }

  const childBlockIds = pageBlock.value.content || []
  const childBlocks = childBlockIds.map((id: string) => recordMap.block[id]).filter(Boolean)

  // 연속된 리스트 아이템들을 그룹화
  const groupedBlocks: any[] = []
  let currentListGroup: any[] = []
  let currentListType: string | null = null

  childBlocks.forEach((block: any, index: number) => {
    const blockType = block.value?.type
    
    if (blockType === 'bulleted_list_item' || blockType === 'numbered_list_item') {
      if (currentListType === blockType) {
        // 같은 타입의 리스트 아이템이면 그룹에 추가
        currentListGroup.push(block)
      } else {
        // 다른 타입이면 이전 그룹을 저장하고 새 그룹 시작
        if (currentListGroup.length > 0) {
          groupedBlocks.push({ type: currentListType, items: currentListGroup })
          currentListGroup = []
        }
        currentListType = blockType
        currentListGroup.push(block)
      }
    } else {
      // 리스트가 아니면 이전 그룹을 저장하고 개별 블록 추가
      if (currentListGroup.length > 0) {
        groupedBlocks.push({ type: currentListType, items: currentListGroup })
        currentListGroup = []
        currentListType = null
      }
      groupedBlocks.push(block)
    }
  })

  // 마지막 그룹 처리
  if (currentListGroup.length > 0) {
    groupedBlocks.push({ type: currentListType, items: currentListGroup })
  }

  return (
    <StyledWrapper>
      <div className="notion-page">
        {groupedBlocks.map((item: any, index: number) => {
          if (item.type === 'bulleted_list_item') {
            return (
              <ul key={`list-${index}`} className="notion-list">
                {item.items.map((block: any, idx: number) => (
                  <BlockRenderer key={block.value.id || idx} block={block.value} recordMap={recordMap} />
                ))}
              </ul>
            )
          } else if (item.type === 'numbered_list_item') {
            return (
              <ol key={`list-${index}`} className="notion-list">
                {item.items.map((block: any, idx: number) => (
                  <BlockRenderer key={block.value.id || idx} block={block.value} recordMap={recordMap} />
                ))}
              </ol>
            )
          } else {
            return <BlockRenderer key={item.value?.id || index} block={item.value} recordMap={recordMap} />
          }
        })}
      </div>
    </StyledWrapper>
  )
}

// 개별 블록 렌더러
const BlockRenderer: FC<{ block: any; recordMap: any }> = ({ block, recordMap }) => {
  if (!block || !block.type) return null

  // 자식 블록 가져오기 헬퍼 함수
  const getChildBlocks = (parentId: string) => {
    return Object.values(recordMap.block)
      .filter((b: any) => b.value?.parent?.block_id === parentId)
      .map((b: any) => b.value)
      .sort((a: any, b: any) => {
        // created_time으로 정렬 (순서 유지)
        return new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
      })
  }

  const renderRichText = (richTextArray: any[]) => {
    if (!richTextArray || richTextArray.length === 0) return null
    
    return richTextArray.map((text: any, index: number) => {
      let content = text.plain_text || text.text?.content || ''
      let element = <span key={index}>{content}</span>

      // 텍스트 스타일 적용
      if (text.annotations) {
        if (text.annotations.bold) element = <strong key={index}>{content}</strong>
        if (text.annotations.italic) element = <em key={index}>{element}</em>
        if (text.annotations.strikethrough) element = <del key={index}>{element}</del>
        if (text.annotations.underline) element = <u key={index}>{element}</u>
        if (text.annotations.code) element = <code key={index} className="notion-inline-code">{content}</code>
        
        // 색상 적용
        if (text.annotations.color && text.annotations.color !== 'default') {
          element = <span key={index} className={`notion-${text.annotations.color}`}>{element}</span>
        }
      }

      // 링크 적용
      if (text.href) {
        element = <a key={index} href={text.href} target="_blank" rel="noopener noreferrer">{element}</a>
      }

      return element
    })
  }

  switch (block.type) {
    case 'paragraph':
      const paragraphText = renderRichText(block.paragraph?.rich_text || [])
      // 빈 paragraph도 공백으로 표시
      return (
        <p className="notion-text">
          {paragraphText || '\u00A0'}
        </p>
      )

    case 'heading_1':
      return (
        <h1 className="notion-h1">
          {renderRichText(block.heading_1?.rich_text || [])}
        </h1>
      )

    case 'heading_2':
      return (
        <h2 className="notion-h2">
          {renderRichText(block.heading_2?.rich_text || [])}
        </h2>
      )

    case 'heading_3':
      return (
        <h3 className="notion-h3">
          {renderRichText(block.heading_3?.rich_text || [])}
        </h3>
      )

    case 'bulleted_list_item':
      const bulletChildren = getChildBlocks(block.id)
      return (
        <li className="notion-list-item">
          <div>{renderRichText(block.bulleted_list_item?.rich_text || [])}</div>
          {bulletChildren.length > 0 && (
            <ul className="notion-list-nested">
              {bulletChildren.map((child: any, idx: number) => (
                <BlockRenderer key={child.id || idx} block={child} recordMap={recordMap} />
              ))}
            </ul>
          )}
        </li>
      )

    case 'numbered_list_item':
      const numberedChildren = getChildBlocks(block.id)
      return (
        <li className="notion-numbered-list-item">
          <div>{renderRichText(block.numbered_list_item?.rich_text || [])}</div>
          {numberedChildren.length > 0 && (
            <ol className="notion-list-nested">
              {numberedChildren.map((child: any, idx: number) => (
                <BlockRenderer key={child.id || idx} block={child} recordMap={recordMap} />
              ))}
            </ol>
          )}
        </li>
      )

    case 'to_do':
      const todoChildren = getChildBlocks(block.id)
      return (
        <div className="notion-to-do">
          <div className="notion-to-do-main">
            <input type="checkbox" checked={block.to_do?.checked || false} readOnly />
            <span>{renderRichText(block.to_do?.rich_text || [])}</span>
          </div>
          {todoChildren.length > 0 && (
            <div className="notion-to-do-children">
              {todoChildren.map((child: any, idx: number) => (
                <BlockRenderer key={child.id || idx} block={child} recordMap={recordMap} />
              ))}
            </div>
          )}
        </div>
      )

    case 'toggle':
      const toggleChildren = getChildBlocks(block.id)
      return (
        <details className="notion-toggle">
          <summary>{renderRichText(block.toggle?.rich_text || [])}</summary>
          {toggleChildren.length > 0 && (
            <div className="notion-toggle-content">
              {toggleChildren.map((child: any, idx: number) => (
                <BlockRenderer key={child.id || idx} block={child} recordMap={recordMap} />
              ))}
            </div>
          )}
        </details>
      )

    case 'code':
      const code = block.code?.rich_text?.map((t: any) => t.plain_text).join('') || ''
      const notionLanguage = block.code?.language || 'plain text'
      
      // Mermaid 다이어그램 처리
      if (notionLanguage.toLowerCase() === 'mermaid') {
        return (
          <div className="notion-code-block notion-mermaid-block">
            <pre className="language-mermaid">
              <code className="language-mermaid">
                {code}
              </code>
            </pre>
          </div>
        )
      }
      
      // Notion 언어를 Prism 언어로 매핑
      const languageMap: Record<string, string> = {
        'plain text': 'plaintext',
        'javascript': 'javascript',
        'typescript': 'typescript',
        'python': 'python',
        'java': 'java',
        'c': 'c',
        'c++': 'cpp',
        'c#': 'csharp',
        'php': 'php',
        'ruby': 'ruby',
        'go': 'go',
        'rust': 'rust',
        'kotlin': 'kotlin',
        'swift': 'swift',
        'bash': 'bash',
        'shell': 'bash',
        'sql': 'sql',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'yaml': 'yaml',
        'markdown': 'markdown',
        'jsx': 'jsx',
        'tsx': 'tsx',
      }
      
      const prismLanguage = languageMap[notionLanguage.toLowerCase()] || 'plaintext'
      
      const handleCopyCode = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        const copyButton = e.currentTarget
        navigator.clipboard.writeText(code).then(() => {
          // 복사 성공
          if (copyButton) {
            copyButton.classList.add('copied')
            setTimeout(() => {
              copyButton.classList.remove('copied')
            }, 2000)
          }
        })
      }
      
      return (
        <div className="notion-code-block">
          <div className="notion-code-language">{notionLanguage}</div>
          <div className="notion-code-copy" onClick={handleCopyCode}>
            <div className="notion-code-copy-button">
              <svg fill="currentColor" viewBox="0 0 16 16" width="1em" version="1.1">
                <path fillRule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path>
                <path fillRule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
              </svg>
              <span className="notion-code-copy-text">copied</span>
            </div>
          </div>
          <pre className="notion-code">
            <code className={`language-${prismLanguage}`}>
              {code}
            </code>
          </pre>
        </div>
      )

    case 'quote':
      return (
        <blockquote className="notion-quote">
          {renderRichText(block.quote?.rich_text || [])}
        </blockquote>
      )

    case 'callout':
      const icon = block.callout?.icon?.emoji || '💡'
      const color = block.callout?.color || 'gray_background'
      const calloutChildren = getChildBlocks(block.id)
      
      return (
        <div className={`notion-callout notion-callout-${color}`}>
          <span className="notion-callout-icon">{icon}</span>
          <div className="notion-callout-content">
            <div className="notion-callout-text">
              {renderRichText(block.callout?.rich_text || [])}
            </div>
            {calloutChildren.length > 0 && (
              <div className="notion-callout-children">
                {calloutChildren.map((child: any, idx: number) => (
                  <BlockRenderer key={child.id || idx} block={child} recordMap={recordMap} />
                ))}
              </div>
            )}
          </div>
        </div>
      )

    case 'image':
      const imageUrl = block.image?.type === 'external' 
        ? block.image.external?.url 
        : block.image?.file?.url
      
      if (!imageUrl) return null
      
      return (
        <figure className="notion-image">
          <img src={imageUrl} alt={block.image?.caption?.[0]?.plain_text || ''} loading="lazy" />
          {block.image?.caption && block.image.caption.length > 0 && (
            <figcaption>{renderRichText(block.image.caption)}</figcaption>
          )}
        </figure>
      )

    case 'video':
      const videoUrl = block.video?.type === 'external' 
        ? block.video.external?.url 
        : block.video?.file?.url
      
      if (!videoUrl) return null
      
      return (
        <figure className="notion-video">
          <video src={videoUrl} controls />
        </figure>
      )

    case 'divider':
      return <hr className="notion-divider" />

    case 'bookmark':
      return (
        <a href={block.bookmark?.url} className="notion-bookmark" target="_blank" rel="noopener noreferrer">
          {block.bookmark?.url}
        </a>
      )

    case 'equation':
      try {
        const html = katex.renderToString(block.equation?.expression || '', {
          throwOnError: false
        })
        return <div className="notion-equation" dangerouslySetInnerHTML={{ __html: html }} />
      } catch (e) {
        return <div className="notion-equation">{block.equation?.expression}</div>
      }

    case 'column_list':
      // recordMap에서 이 블록의 자식들 찾기
      const columnListChildren = Object.values(recordMap.block)
        .filter((b: any) => b.value?.parent?.block_id === block.id && b.value?.type === 'column')
        .map((b: any) => b.value)
      
      // 컬럼 개수에 따라 기본 비율 설정
      const columnCount = columnListChildren.length
      
      return (
        <div className="notion-column-list" data-column-count={columnCount}>
          {columnListChildren.map((childBlock: any, idx: number) => (
            <BlockRenderer key={childBlock.id || idx} block={childBlock} recordMap={recordMap} />
          ))}
        </div>
      )

    case 'column':
      // recordMap에서 이 컬럼의 자식 블록들 찾기
      const columnChildren = Object.values(recordMap.block)
        .filter((b: any) => b.value?.parent?.block_id === block.id)
        .map((b: any) => b.value)
      
      // Notion API v1에서 column의 비율 정보 추출
      // width_ratio는 0~1 사이의 값 (예: 0.5 = 50%, 0.33 = 33%)
      const widthRatio = block.column?.width_ratio || 1
      
      // v3와 동일한 width 계산 공식 사용
      const columnWidth = `calc(${widthRatio} * (100% - min(32px, 4vw)))`
      
      return (
        <div 
          className="notion-column" 
          style={{ 
            width: columnWidth
          }}
        >
          {columnChildren.map((childBlock: any, idx: number) => (
            <BlockRenderer key={childBlock.id || idx} block={childBlock} recordMap={recordMap} />
          ))}
        </div>
      )

    case 'table':
      return (
        <div className="notion-table-wrapper">
          <table className="notion-table">
            <tbody>
              {/* 테이블 행 렌더링 */}
            </tbody>
          </table>
        </div>
      )

    case 'table_row':
      return (
        <tr className="notion-table-row">
          {block.table_row?.cells?.map((cell: any[], index: number) => (
            <td key={index} className="notion-table-cell">
              {renderRichText(cell)}
            </td>
          ))}
        </tr>
      )

    default:
      console.log('[NotionRenderer] Unsupported block type:', block.type, block)
      return null
  }
}

export default NotionRenderer

const StyledWrapper = styled.div`
  /* CSS 변수 정의 - 라이트 모드 */
  --fg-color: rgba(0, 0, 0, 0.9);
  --fg-color-icon: #000;
  --bg-color: #fff;
  --bg-color-0: #f7f7f5;
  --bg-color-1: #f1f1ef;
  --bg-color-2: rgba(0, 0, 0, 0.03);
  
  --notion-red: #e03e3e;
  --notion-pink: #ad1a72;
  --notion-blue: #0b6e99;
  --notion-purple: #6940a5;
  --notion-teal: #4d6461;
  --notion-yellow: #dfab01;
  --notion-orange: #d9730d;
  --notion-brown: #64473a;
  --notion-gray: #9b9a97;
  
  --notion-red_background: #fbe4e4;
  --notion-pink_background: #f4dfeb;
  --notion-blue_background: #ddebf1;
  --notion-purple_background: #eae4f2;
  --notion-teal_background: #ddedea;
  --notion-yellow_background: #fbf3db;
  --notion-orange_background: #faebdd;
  --notion-brown_background: #e9e5e3;
  --notion-gray_background: #ebeced;
  
  --notion-red_background_co: hsla(0, 74%, 94%, 0.3);
  --notion-pink_background_co: rgba(244, 223, 235, 0.3);
  --notion-blue_background_co: rgba(221, 235, 241, 0.3);
  --notion-purple_background_co: rgba(234, 228, 242, 0.3);
  --notion-teal_background_co: rgba(221, 237, 234, 0.3);
  --notion-yellow_background_co: hsla(45, 80%, 92%, 0.3);
  --notion-orange_background_co: hsla(29, 74%, 92%, 0.3);
  --notion-brown_background_co: hsla(20, 12%, 90%, 0.3);
  --notion-gray_background_co: hsla(210, 5%, 93%, 0.3);
  
  --notion-item-blue: rgba(0, 120, 223, 0.2);
  --notion-item-orange: rgba(245, 93, 0, 0.2);
  --notion-item-green: rgba(0, 135, 107, 0.2);
  --notion-item-pink: rgba(221, 0, 129, 0.2);
  --notion-item-brown: rgba(140, 46, 0, 0.2);
  --notion-item-red: rgba(255, 0, 26, 0.2);
  --notion-item-yellow: rgba(233, 168, 0, 0.2);
  --notion-item-default: hsla(45, 4%, 80%, 0.5);
  --notion-item-purple: rgba(103, 36, 222, 0.2);
  --notion-item-gray: hsla(45, 2%, 60%, 0.4);

  /* 다크 모드 변수 */
  ${({ theme }) => theme.scheme === 'dark' && `
    --fg-color: hsla(0, 0%, 100%, 0.9);
    --fg-color-icon: #fff;
    --bg-color: #2f3437;
    --bg-color-0: #474c50;
    --bg-color-1: #3f4447;
    --bg-color-2: hsla(44, 6%, 50%, 0.15);
    
    --notion-red: #ff7369;
    --notion-pink: #e255a1;
    --notion-blue: #529cca;
    --notion-purple: #9a6dd7;
    --notion-teal: #4dab9a;
    --notion-yellow: #ffdc49;
    --notion-orange: #ffa344;
    --notion-brown: #937264;
    --notion-gray: hsla(195, 2%, 60%, 0.95);
    
    --notion-red_background: #594141;
    --notion-pink_background: #533b4c;
    --notion-blue_background: #364954;
    --notion-purple_background: #443f57;
    --notion-teal_background: #354c4b;
    --notion-yellow_background: #59563b;
    --notion-orange_background: #594a3a;
    --notion-brown_background: #434040;
    --notion-gray_background: #454b4e;
    
    --notion-red_background_co: rgba(89, 65, 65, 0.3);
    --notion-pink_background_co: rgba(83, 59, 76, 0.3);
    --notion-blue_background_co: rgba(120, 162, 187, 0.3);
    --notion-purple_background_co: rgba(68, 63, 87, 0.3);
    --notion-teal_background_co: rgba(53, 76, 75, 0.3);
    --notion-yellow_background_co: rgba(89, 86, 59, 0.3);
    --notion-orange_background_co: rgba(89, 74, 58, 0.3);
    --notion-brown_background_co: rgba(67, 64, 64, 0.3);
    --notion-gray_background_co: rgba(69, 75, 78, 0.3);
  `}

  .notion-page {
    padding: 0;
    line-height: 1.6;
  }

  /* 제목 스타일 */
  .notion-h1 {
    font-size: 2em;
    font-weight: 600;
    margin: 1.5em 0 0.5em;
  }

  .notion-h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 1.2em 0 0.5em;
  }

  .notion-h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 1em 0 0.5em;
  }

  /* 텍스트 스타일 */
  .notion-text {
    width: 100%;
    margin: 0.5em 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* 인라인 코드 */
  .notion-inline-code {
    color: #eb5757;
    padding: 0.2em 0.4em;
    background: hsla(44, 6%, 50%, .15);
    border-radius: 3px;
    font-size: 85%;
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace;
  }

  /* 코드 블록 */
  .notion-code-block {
    position: relative;
    margin: 1em 0;
    border-radius: 6px;
    overflow: hidden;
  }

  .notion-mermaid-block {
    background: transparent;
    overflow: visible;
    
    pre {
      background: transparent;
      padding: 1em;
      overflow: visible;
    }
    
    code {
      background: transparent;
    }
    
    svg {
      max-width: 100%;
      height: auto;
    }
  }

  .notion-code-language {
    display: none;
  }

  .notion-code-copy {
    position: absolute;
    top: 1em;
    right: 1em;
    user-select: none;
    z-index: 9;
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.3, 0, 0.5, 1);
    cursor: pointer;
  }

  .notion-code-block:hover .notion-code-copy {
    opacity: 1;
  }

  .notion-code-copy-button {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.6em;
    font-size: 1.25em;
    line-height: 1em;
    cursor: pointer;
    transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1), 
                color 0.2s cubic-bezier(0.3, 0, 0.5, 1), 
                border-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
    box-shadow: 0 1px 0 rgba(27, 31, 36, 0.04), inset 0 1px 0 hsla(0, 0%, 100%, 0.25);
    background-color: ${({ theme }) => theme.scheme === 'dark' ? '#21262d' : '#f6f8fa'};
    color: ${({ theme }) => theme.scheme === 'dark' ? '#c9d1d9' : '#24292f'};
    border: 1px solid ${({ theme }) => theme.scheme === 'dark' ? 'rgba(240, 246, 252, 0.1)' : 'rgba(27, 31, 36, 0.15)'};
    border-radius: 6px;

    &:hover {
      background-color: ${({ theme }) => theme.scheme === 'dark' ? '#30363d' : '#e9ecef'};
      border-color: ${({ theme }) => theme.scheme === 'dark' ? 'rgba(240, 246, 252, 0.2)' : 'rgba(27, 31, 36, 0.25)'};
    }

    &:active {
      background-color: ${({ theme }) => theme.scheme === 'dark' ? '#21262d' : '#dfe3e6'};
      box-shadow: inset 0 1px 0 rgba(27, 31, 36, 0.2);
    }

    svg {
      flex-shrink: 0;
    }
  }

  .notion-code-copy-text {
    display: none;
    font-size: 0.7em;
    white-space: nowrap;
  }

  .notion-code-copy.copied .notion-code-copy-button {
    background-color: ${({ theme }) => theme.scheme === 'dark' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(46, 160, 67, 0.1)'};
    color: ${({ theme }) => theme.scheme === 'dark' ? '#3fb950' : '#2ea043'};
    border-color: ${({ theme }) => theme.scheme === 'dark' ? 'rgba(46, 160, 67, 0.3)' : 'rgba(46, 160, 67, 0.2)'};
  }

  .notion-code-copy.copied .notion-code-copy-text {
    display: inline;
  }

  .notion-code {
    margin: 0;
    overflow-x: auto;
    
    /* Prism 테마가 background와 color를 관리하도록 함 */
    code[class*="language-"],
    pre[class*="language-"] {
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      line-height: 1.5;
      /* background와 color는 Prism 테마에서 자동으로 적용됨 */
    }
  }

  /* 리스트 */
  .notion-list {
    margin: 1em 0;
    padding-left: 1.5em;
  }

  .notion-list-item,
  .notion-numbered-list-item {
    margin: 0.3em 0;
    
    > div {
      display: inline;
    }
  }

  .notion-list-nested {
    margin-top: 0.3em;
    margin-left: 0em;
    list-style-type: disc;
    
    ul, ol {
      margin-left: 1.5em;
    }
    
    /* 중첩된 리스트 안의 아이템들 - 블릿/번호 스타일 제거 */
    .notion-list-item,
    .notion-numbered-list-item {
      list-style-type: none;
      
      &::before {
        display: none;
      }
    }
  }
  
  /* ol(번호 리스트) 안의 중첩 리스트 */
  ol.notion-list-nested {
    list-style-type: decimal;
    
    .notion-numbered-list-item {
      list-style-type: none;
    }
  }

  /* Quote */
  .notion-quote {
    border-left: 3px solid ${({ theme }) => theme.scheme === 'dark' ? '#555' : '#ddd'};
    padding-left: 1em;
    margin: 1em 0;
    color: ${({ theme }) => theme.scheme === 'dark' ? '#aaa' : '#666'};
  }

  /* Callout */
  .notion-callout {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 6px;
    margin: 1em 0;
    
    &.notion-callout-gray_background {
      background: ${({ theme }) => theme.scheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    }
    
    &.notion-callout-blue_background {
      background: rgba(56, 139, 253, 0.1);
    }
    
    &.notion-callout-yellow_background {
      background: rgba(255, 193, 7, 0.1);
    }
    
    &.notion-callout-red_background {
      background: rgba(248, 81, 73, 0.1);
    }
    
    &.notion-callout-green_background {
      background: rgba(46, 160, 67, 0.1);
    }
  }

  .notion-callout-icon {
    font-size: 1.5em;
    line-height: 1;
    flex-shrink: 0;
  }

  .notion-callout-content {
    flex: 1;
    min-width: 0;
  }

  .notion-callout-text {
    margin-bottom: 0;
  }

  .notion-callout-children {
    margin-top: 0.5em;
    
    > * {
      margin: 0.5em 0;
    }
  }

  /* 이미지 */
  .notion-image {
    margin: 1.5em 0;
    
    img {
      max-width: 100%;
      border-radius: 6px;

      @media (max-width: 768px) {
        width: 100%;
        height: auto;
      }
    }
    
    figcaption {
      text-align: center;
      color: ${({ theme }) => theme.scheme === 'dark' ? '#aaa' : '#666'};
      font-size: 0.9em;
      margin-top: 0.5em;
    }
  }

  /* 비디오 */
  .notion-video {
    margin: 1.5em 0;
    
    video {
      max-width: 100%;
      border-radius: 6px;
    }
  }

  /* To-do */
  .notion-to-do {
    margin: 0.3em 0;
  }

  .notion-to-do-main {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    
    input[type="checkbox"] {
      margin-top: 0.3em;
      flex-shrink: 0;
    }
  }

  .notion-to-do-children {
    margin-left: 1.8em;
    margin-top: 0.3em;
    
    > * {
      margin: 0.3em 0;
    }
  }

  /* Toggle */
  .notion-toggle {
    margin: 0.5em 0;
    
    summary {
      cursor: pointer;
      padding: 0.3em 0;
      list-style-position: outside;
      
      &:hover {
        background: ${({ theme }) => theme.scheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
      }
    }
  }

  .notion-toggle-content {
    margin-top: 0.5em;
    padding-left: 1.5em;
    
    > * {
      margin: 0.5em 0;
    }
  }

  /* Divider */
  .notion-divider {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.scheme === 'dark' ? '#444' : '#ddd'};
    margin: 0 0 1em 0;
  }

  /* Bookmark */
  .notion-bookmark {
    display: block;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.scheme === 'dark' ? '#444' : '#ddd'};
    border-radius: 6px;
    margin: 1em 0;
    text-decoration: none;
    color: inherit;
    
    &:hover {
      background: ${({ theme }) => theme.scheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
    }
  }

  /* Equation */
  .notion-equation {
    margin: 1em 0;
    overflow-x: auto;
  }

  /* Column Layout */
  .notion-column-list {
    display: flex;
    gap: min(32px, 4vw);
    margin: 1em 0;
    width: 100%;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
    }
  }

  .notion-column {
    /* width는 인라인 스타일로 동적으로 설정됨 */
    min-width: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100% !important;
    }
  }

  /* Table */
  .notion-table-wrapper {
    margin: 1em 0;
    overflow-x: auto;
  }

  .notion-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid ${({ theme }) => theme.scheme === 'dark' ? '#444' : '#ddd'};
    
    .notion-table-row {
      border-bottom: 1px solid ${({ theme }) => theme.scheme === 'dark' ? '#444' : '#ddd'};
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .notion-table-cell {
      padding: 0.75rem;
      border-right: 1px solid ${({ theme }) => theme.scheme === 'dark' ? '#444' : '#ddd'};
      
      &:last-child {
        border-right: none;
      }
    }
  }

  /* 텍스트 색상 */
  .notion-red, .notion-red_co { color: var(--notion-red); }
  .notion-pink, .notion-pink_co { color: var(--notion-pink); }
  .notion-blue, .notion-blue_co { color: var(--notion-blue); }
  .notion-purple, .notion-purple_co { color: var(--notion-purple); }
  .notion-teal, .notion-teal_co { color: var(--notion-teal); }
  .notion-yellow, .notion-yellow_co { color: var(--notion-yellow); }
  .notion-orange, .notion-orange_co { color: var(--notion-orange); }
  .notion-brown, .notion-brown_co { color: var(--notion-brown); }
  .notion-gray, .notion-gray_co { color: var(--notion-gray); }
  .notion-green { color: var(--notion-teal); }
  
  /* 배경 색상 */
  .notion-red_background { background-color: var(--notion-red_background); }
  .notion-pink_background { background-color: var(--notion-pink_background); }
  .notion-blue_background { background-color: var(--notion-blue_background); }
  .notion-purple_background { background-color: var(--notion-purple_background); }
  .notion-teal_background { background-color: var(--notion-teal_background); }
  .notion-yellow_background { background-color: var(--notion-yellow_background); }
  .notion-orange_background { background-color: var(--notion-orange_background); }
  .notion-brown_background { background-color: var(--notion-brown_background); }
  .notion-gray_background { background-color: var(--notion-gray_background); }
  .notion-green_background { background-color: var(--notion-teal_background); }
  
  /* 배경 색상 (callout용) */
  .notion-red_background_co { background-color: var(--notion-red_background_co); }
  .notion-pink_background_co { background-color: var(--notion-pink_background_co); }
  .notion-blue_background_co { background-color: var(--notion-blue_background_co); }
  .notion-purple_background_co { background-color: var(--notion-purple_background_co); }
  .notion-teal_background_co { background-color: var(--notion-teal_background_co); }
  .notion-yellow_background_co { background-color: var(--notion-yellow_background_co); }
  .notion-orange_background_co { background-color: var(--notion-orange_background_co); }
  .notion-brown_background_co { background-color: var(--notion-brown_background_co); }
  .notion-gray_background_co { background-color: var(--notion-gray_background_co); }
  
  /* 아이템 색상 */
  .notion-item-blue { background-color: var(--notion-item-blue); }
  .notion-item-orange { background-color: var(--notion-item-orange); }
  .notion-item-green { background-color: var(--notion-item-green); }
  .notion-item-pink { background-color: var(--notion-item-pink); }
  .notion-item-brown { background-color: var(--notion-item-brown); }
  .notion-item-red { background-color: var(--notion-item-red); }
  .notion-item-yellow { background-color: var(--notion-item-yellow); }
  .notion-item-default { background-color: var(--notion-item-default); }
  .notion-item-purple { background-color: var(--notion-item-purple); }
  .notion-item-gray { background-color: var(--notion-item-gray); }
`
