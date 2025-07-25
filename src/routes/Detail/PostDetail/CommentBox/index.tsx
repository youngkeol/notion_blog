import { TPost } from "src/types"
import { CONFIG } from "site.config"
import dynamic from "next/dynamic"
import Giscus from "./Giscus";
import useScheme from "src/hooks/useScheme";

const UtterancesComponent = dynamic(
  () => {
    return import("./Utterances")
  },
  { ssr: false }
)
const CusdisComponent = dynamic(
  () => {
    return import("./Cusdis")
  },
  { ssr: false }
)

type Props = {
  data: TPost
}

const CommentBox: React.FC<Props> = ({ data }) => {
  const [scheme] = useScheme();
  // 값이 없으면 기본값 'light' 사용
  const theme = scheme === "dark" ? "dark" : "light";
 
  return (
    <div>
      {CONFIG.utterances.enable && <UtterancesComponent issueTerm={data.id} />}
      {CONFIG.cusdis.enable && (
        <CusdisComponent id={data.id} slug={data.slug} title={data.title} />
      )}
      <Giscus theme={theme} />
    </div>
  )
}

export default CommentBox
