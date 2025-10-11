import { useEffect } from "react"
import mermaid from "mermaid"
import useScheme from "src/hooks/useScheme"

const useMermaidEffect = () => {
  const [scheme] = useScheme()

  useEffect(() => {
    // 다크 모드에 따라 테마 설정
    const theme = scheme === 'dark' ? 'dark' : 'default'
    
    mermaid.initialize({
      startOnLoad: true,
      theme: theme,
    })
    
    if (!document) return
    
    const elements: HTMLCollectionOf<Element> =
      document.getElementsByClassName("language-mermaid")
    
    if (!elements || elements.length === 0) return

    // 모든 요소를 다시 렌더링
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      
      // 원본 텍스트를 data 속성에 저장
      let content = element.getAttribute('data-mermaid-source')
      if (!content) {
        content = element.textContent || ""
        element.setAttribute('data-mermaid-source', content)
      }
      
      // SVG가 이미 있으면 제거하고 다시 렌더링
      const existingSvg = element.querySelector('svg')
      if (existingSvg) {
        element.innerHTML = content
      }
      
      mermaid.render("mermaid-" + i + "-" + Date.now(), content).then((result) => {
        element.innerHTML = result.svg
      }).catch((error) => {
        console.error('[mermaid] Render error:', error)
      })
    }
  }, [scheme])

  return
}

export default useMermaidEffect
