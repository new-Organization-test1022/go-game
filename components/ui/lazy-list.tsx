'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { VirtualScrollHelper } from '@/lib/utils/performance';
import { LoadingSpinner } from './loading-spinner';

interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

function LazyListComponent<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  loadingComponent,
  emptyComponent,
  className = '',
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: LazyListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollHelperRef = useRef(new VirtualScrollHelper(containerHeight, itemHeight));

  // 更新滚动位置
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    scrollHelperRef.current.updateScrollTop(newScrollTop);

    // 检查是否需要加载更多
    const { scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = (newScrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage > 0.8 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // 计算可见区域的项目
  const visibleItems = React.useMemo(() => {
    const { start, end } = scrollHelperRef.current.getVisibleRange(items.length);
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      originalIndex: start + index,
    }));
  }, [items, scrollTop]);

  // 计算虚拟滚动的偏移量
  const { start } = scrollHelperRef.current.getVisibleRange(items.length);
  const offsetY = scrollHelperRef.current.getOffsetY(start);
  const totalHeight = scrollHelperRef.current.getTotalHeight(items.length);

  if (items.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyComponent || <div className="text-gray-500">暂无数据</div>}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map(({ item, index, originalIndex }) => (
              <div
                key={originalIndex}
                style={{ height: itemHeight }}
                className="flex items-center"
              >
                {renderItem(item, originalIndex)}
              </div>
            ))}
          </div>
        </div>
        
        {/* 加载更多指示器 */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            {loadingComponent || <LoadingSpinner size="md" text="加载中..." />}
          </div>
        )}
      </div>
    </div>
  );
}

export const LazyList = memo(LazyListComponent) as <T>(props: LazyListProps<T>) => JSX.Element;

// 简化版本的懒加载列表（用于小数据集）
interface SimpleListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyText?: string;
  maxHeight?: number;
}

function SimpleListComponent<T>({
  items,
  renderItem,
  className = '',
  emptyText = '暂无数据',
  maxHeight,
}: SimpleListProps<T>) {
  if (items.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        {emptyText}
      </div>
    );
  }

  const containerStyle = maxHeight ? { maxHeight, overflowY: 'auto' as const } : {};

  return (
    <div className={className} style={containerStyle}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export const SimpleList = memo(SimpleListComponent) as <T>(props: SimpleListProps<T>) => JSX.Element;