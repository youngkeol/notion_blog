import { useEffect, useRef } from "react";

const Giscus = ({theme}: {theme: "light" | "dark"}) => {
  const giscusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (giscusRef.current && !giscusRef.current.querySelector("iframe")) {
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.setAttribute("data-repo", "youngkeol/notion_blog");
      script.setAttribute("data-repo-id", "R_kgDOI1k-6w");
      script.setAttribute("data-category", "Comments");
      script.setAttribute("data-category-id", "DIC_kwDOI1k-684CtESe");
      script.setAttribute("data-mapping", "pathname");
      script.setAttribute("data-strict", "0");
      script.setAttribute("data-reactions-enabled", "1");
      script.setAttribute("data-emit-metadata", "0");
      script.setAttribute("data-input-position", "top");
      script.setAttribute("data-theme", theme);
      script.setAttribute("data-lang", "ko");
      script.setAttribute("data-loading", "lazy");
      script.crossOrigin = "anonymous";
      script.async = true;
      giscusRef.current.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (giscusRef.current) {
      giscusRef.current.querySelector("iframe")?.setAttribute("data-theme", theme);
    }
  }, [theme]);  

  return <div className="giscus" ref={giscusRef} />;
};

export default Giscus; 