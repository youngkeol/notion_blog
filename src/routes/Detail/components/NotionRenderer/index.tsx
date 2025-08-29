import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { ExtendedRecordMap } from "notion-types"
import useScheme from "src/hooks/useScheme"

// core styles shared by all of react-notion-x (required)
import "react-notion-x/src/styles.css"

// used for code syntax highlighting (optional)
import "prismjs/themes/prism-tomorrow.css"
// import "prismjs/themes/prism-tomorrow.css" // 정적 임포트 제거


// used for rendering equations (optional)

import "katex/dist/katex.min.css"
//import { FC } from "react"
import { FC, useEffect } from "react"
import styled from "@emotion/styled"

const _NotionRenderer = dynamic(
  () => import("react-notion-x").then((m) => m.NotionRenderer),
  { ssr: false }
)

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then(async (m) => {
    await Promise.all([
      import("prismjs/components/prism-markup-templating.js"),
      import("prismjs/components/prism-markup.js"),
      import("prismjs/components/prism-bash.js"),
      import("prismjs/components/prism-shell-session.js"),
      import("prismjs/components/prism-powershell.js"),
      import("prismjs/components/prism-c.js"),
      import("prismjs/components/prism-cpp.js"),
      import("prismjs/components/prism-csharp.js"),
      import("prismjs/components/prism-docker.js"),
      import("prismjs/components/prism-java.js"),
      import("prismjs/components/prism-js-templates.js"),
      import("prismjs/components/prism-coffeescript.js"),
      import("prismjs/components/prism-diff.js"),
      import("prismjs/components/prism-git.js"),
      import("prismjs/components/prism-go.js"),
      import("prismjs/components/prism-graphql.js"),
      import("prismjs/components/prism-handlebars.js"),
      import("prismjs/components/prism-less.js"),
      import("prismjs/components/prism-makefile.js"),
      import("prismjs/components/prism-markdown.js"),
      import("prismjs/components/prism-objectivec.js"),
      import("prismjs/components/prism-ocaml.js"),
      import("prismjs/components/prism-python.js"),
      import("prismjs/components/prism-reason.js"),
      import("prismjs/components/prism-rust.js"),
      import("prismjs/components/prism-sass.js"),
      import("prismjs/components/prism-scss.js"),
      import("prismjs/components/prism-solidity.js"),
      import("prismjs/components/prism-sql.js"),
      import("prismjs/components/prism-stylus.js"),
      import("prismjs/components/prism-swift.js"),
      import("prismjs/components/prism-wasm.js"),
      import("prismjs/components/prism-yaml.js"),
    ])
    return m.Code
  })
)

const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  }
)
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false,
  }
)

const mapPageUrl = (id: string) => {
  return "https://www.notion.so/" + id.replace(/-/g, "")
}

type Props = {
  recordMap: ExtendedRecordMap
}

const NotionRenderer: FC<Props> = ({ recordMap }) => {
  const [scheme] = useScheme()
  
  // 동적으로 Prism 테마 로드
  useEffect(() => {
    // 기존 Prism 테마 제거
    const existingLink = document.querySelector('link[data-prism-theme]')
    if (existingLink) {
      existingLink.remove()
    }
    
    // 새 테마 로드
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
  
  return (
    <StyledWrapper>
      <_NotionRenderer
        darkMode={scheme === "dark"}
        recordMap={recordMap}
        components={{
          Code,
          Collection,
          Equation,
          Modal,
          Pdf,
          nextImage: Image,
          nextLink: Link,
        }}
        mapPageUrl={mapPageUrl}
      />
    </StyledWrapper>
  )
}

export default NotionRenderer

const StyledWrapper = styled.div`
  /* // TODO: why render? */
  .notion-collection-page-properties {
    display: none !important;
  }
  .notion-page {
    padding: 0;
  }
  
  /* 이미지 컨테이너 div에 border-radius 적용 */
  .notion-asset-wrapper-image > div,
  .notion-asset-wrapper > div {
    width: 100% !important;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .notion-list {
    width: 100%;
  }
  /* 중첩된 리스트 구조 수정 - ul 바로 안에 ul이 있는 경우 */
  .notion-list > .notion-list {
    /* ul 바로 안의 ul을 li처럼 표시 */
    display: list-item;
    list-style: none;
    margin-left: 0;
    padding-left: 1.5em;
  }
  
  /* 중첩된 리스트 안의 figure를 올바르게 표시 */
  .notion-list > .notion-list > .notion-asset-wrapper {
    margin: 0.5em 0;
  }
  
  /* 리스트 들여쓰기 조정 */
  .notion-list-disc > .notion-list-disc {
    margin-left: 0;
    padding-left: 0;
  }
  
  
  /* 코드 블럭 스타일 개선 */
  .notion-code {
    border-radius: 6px;
    overflow-x: auto;
  }
  
  .notion-code pre {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
  }

  .notion-text {
    padding:3px 4px;
  }
  .notion-callout-text .notion-text {
    padding:3px 2px;
  }

`
