import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { queryKey } from "src/constants/queryKey"
import { PostDetail } from "src/types"

const usePostQuery = () => {
  const router = useRouter()
  const { slug } = router.query
  const { data } = useQuery<PostDetail>({
    queryKey: queryKey.post(`${slug}`),
    enabled: false, // SSG로 prefetch된 데이터만 사용
  })

  return data
}

export default usePostQuery
