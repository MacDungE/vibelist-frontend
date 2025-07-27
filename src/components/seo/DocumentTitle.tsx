interface TitleProps {
  title?: string;
}

/**
 * React 19 네이티브 메타데이터 기능을 활용한 간단한 SEO 컴포넌트
 * title만 동적으로 변경하며, 나머지는 index.html에서 정적으로 처리
 */
export default function DocumentTitle({ title = 'VibeList' }: TitleProps) {
  const fullTitle = title.includes('VibeList') ? title : `${title} | VibeList`;

  return <title>{fullTitle}</title>;
}
