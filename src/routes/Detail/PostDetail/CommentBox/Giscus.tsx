import { useEffect, useRef } from "react";
// @ts-ignore
import { CONFIG } from "site.config";

const Giscus = ({theme}: {theme: "light" | "dark"}) => {
  const giscusRef = useRef<HTMLDivElement>(null);
  const config = CONFIG.giscus?.config;

  useEffect(() => {
    if (!config) return;
    
    if (giscusRef.current && !giscusRef.current.querySelector("iframe")) {
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.setAttribute("data-repo", config.repo);
      script.setAttribute("data-repo-id", config.repoId);
      script.setAttribute("data-category", config.category);
      script.setAttribute("data-category-id", config.categoryId);
      script.setAttribute("data-mapping", config.mapping || "pathname");
      script.setAttribute("data-strict", config.strict || "0");
      script.setAttribute("data-reactions-enabled", config.reactionsEnabled || "1");
      script.setAttribute("data-emit-metadata", config.emitMetadata || "0");
      script.setAttribute("data-input-position", config.inputPosition || "top");
      script.setAttribute("data-theme", theme);
      script.setAttribute("data-lang", config.lang || "ko");
      script.setAttribute("data-loading", config.loading || "lazy");
      script.crossOrigin = "anonymous";
      script.async = true;
      giscusRef.current.appendChild(script);
    }
  }, [config, theme]);

   // theme이 바뀔 때마다 iframe에 postMessage로 테마 변경
   useEffect(() => {
    const iframe = giscusRef.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    if (!iframe || !iframe.contentWindow) return;
    
    iframe.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: theme,
          },
        },
      },
      "https://giscus.app"
    );
  }, [theme]);


  return <div className="giscus" ref={giscusRef} />;
};

export default Giscus; 