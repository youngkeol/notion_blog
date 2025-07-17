import { useEffect, useRef } from "react";

const Giscus = () => {
  const giscusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (giscusRef.current && !giscusRef.current.querySelector("iframe")) {
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.setAttribute("data-repo", "your/repo");
      script.setAttribute("data-repo-id", "your-repo-id");
      script.setAttribute("data-category", "Announcements");
      script.setAttribute("data-category-id", "your-category-id");
      script.setAttribute("data-mapping", "pathname");
      script.setAttribute("data-strict", "0");
      script.setAttribute("data-reactions-enabled", "1");
      script.setAttribute("data-emit-metadata", "0");
      script.setAttribute("data-input-position", "bottom");
      script.setAttribute("data-theme", "light");
      script.setAttribute("data-lang", "ko");
      script.setAttribute("data-loading", "lazy");
      script.crossOrigin = "anonymous";
      script.async = true;
      giscusRef.current.appendChild(script);
    }
  }, []);

  return <div className="giscus" ref={giscusRef} />;
};

export default Giscus; 