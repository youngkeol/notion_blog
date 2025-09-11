import useDropdown from "src/hooks/useDropdown";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { MdExpandMore } from "react-icons/md";
import { DEFAULT_CATEGORY } from "src/constants";
import styled from "@emotion/styled";
import { useCategoriesQuery } from "src/hooks/useCategoriesQuery";
import usePostsQuery from "src/hooks/usePostsQuery";
import {useTagsQuery } from "src/hooks/useTagsQuery";

type Props = {};

const CategorySelect: React.FC<Props> = () => {
    const router = useRouter();
    const data = useCategoriesQuery();
    const posts = usePostsQuery();
    const [dropdownRef, opened, handleOpen] = useDropdown();

    // 카테고리 데이터 초기화
    const [newData, setNewData] = useState(data);

    // 현재 카테고리 추출
    const currentCategory =
        `${router.query.category || ``}` || DEFAULT_CATEGORY;



    // router.asPath에서 tag= 뒤의 값 추출 및 디코딩
    const getTagFromPath = (path: string) => {
        const tagMatch = path.match(/[?&]tag=([^&]*)/);
        if (!tagMatch) return undefined;
        
        // + 기호를 공백으로 변환 후 디코딩
        const encodedTag = tagMatch[1].replace(/\+/g, ' ');
        return decodeURIComponent(encodedTag);
    };
    
    const currentTag = getTagFromPath(router.asPath);

    useEffect(() => {
        if (!currentTag) {
            setNewData(data);
            return;
        }
        
        if (!posts || posts.length === 0) {
            setNewData(data);
            return;
        } else {
            const filteredPosts = posts.filter(post => {
                const hasMatchingTag = post.tags && post.tags.includes(currentTag as string);
                return hasMatchingTag;
            });


            // 필터링된 포스트들의 카테고리별 개수 계산
            const categoryCount: { [key: string]: number } = {};
            
            filteredPosts.forEach(post => {
                const categories = post.category || [DEFAULT_CATEGORY];
                categories.forEach(category => {
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                });
            });

            // "All" 카테고리 추가 (전체 필터링된 포스트 개수)
            categoryCount[DEFAULT_CATEGORY] = filteredPosts.length;
            setNewData(categoryCount);
        }



    }, [currentTag, posts]);

    // tag가 있을 때만 카테고리를 All로 초기화
    useEffect(() => {
        if (currentTag && currentCategory !== DEFAULT_CATEGORY) {
            router.push({
                query: {
                    ...router.query,
                    category: DEFAULT_CATEGORY,
                },
            }, undefined, { shallow: true });
        }
    }, [currentTag]);


    const handleOptionClick = (category: string) => {
        router.push({
            query: {
                ...router.query,
                category,
            },
        });
    };

    return (
        <StyledWrapper>
            <div style={{ marginBottom: "20px" }}>&nbsp;</div>
            
            <div ref={dropdownRef} className="wrapper" onClick={handleOpen}>
                {currentCategory} Posts <MdExpandMore />
            </div>
            {opened && (
                <div className="content">
                    {Object.keys(newData)
                        .sort((a, b) => {
                            // DEFAULT_CATEGORY ("📂 All")를 항상 첫 번째로
                            if (a === DEFAULT_CATEGORY) return -1;
                            if (b === DEFAULT_CATEGORY) return 1;
                            return a.localeCompare(b); // 나머지는 알파벳 순
                        })
                        .map((key, idx) => (
                            <div
                                className="item"
                                key={idx}
                                onClick={() => handleOptionClick(key)}
                            >
                                {`${key} (${newData[key]})`}
                            </div>
                        ))}
                </div>
            )}
        </StyledWrapper>
    );
};

export default CategorySelect;

const StyledWrapper = styled.div`
    position: relative;
    > .wrapper {
        display: flex;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        gap: 0.25rem;
        align-items: center;
        font-size: 1.25rem;
        line-height: 1.75rem;
        font-weight: 700;
        cursor: pointer;
    }
    > .content {
        position: absolute;
        z-index: 40;
        padding: 0.25rem;
        border-radius: 0.75rem;
        background-color: ${({ theme }) => theme.colors.gray2};
        color: ${({ theme }) => theme.colors.gray10};
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        > .item {
            padding: 0.25rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            white-space: nowrap;
            cursor: pointer;

            :hover {
                background-color: ${({ theme }) => theme.colors.gray4};
            }
        }
    }
`;
