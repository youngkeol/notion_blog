import { DEFAULT_CATEGORY } from "src/constants";
import usePostsQuery from "./usePostsQuery";
import { getAllSelectItemsFromPosts } from "src/libs/utils/notion";

export const useCategoriesQuery = () => {
    const posts = usePostsQuery();
    const categories = getAllSelectItemsFromPosts("category", posts);

    console.log("AAA ");
    console.log(categories);

    return {
        [DEFAULT_CATEGORY]: posts.length,
        ...categories,
    };
};
