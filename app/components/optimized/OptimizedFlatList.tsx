// OptimizedFlatList.tsx - Optimized FlatList Component
import React, {memo, useMemo, useCallback} from 'react';
import {FlatList, FlatListProps, ListRenderItem} from 'react-native';
import {usePerformance} from '../../hooks/usePerformance';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  componentName?: string;
}

function OptimizedFlatListComponent<T>({
  data,
  renderItem,
  componentName = 'OptimizedFlatList',
  ...props
}: OptimizedFlatListProps<T>) {
  const {trackInteraction} = usePerformance({componentName});

  // Memoize render item
  const memoizedRenderItem = useCallback<ListRenderItem<T>>(
    (info) => {
      return trackInteraction('render_item', () => renderItem(info));
    },
    [renderItem, trackInteraction]
  );

  // Memoize key extractor
  const keyExtractor = useCallback(
    (item: T, index: number) => {
      if (props.keyExtractor) {
        return props.keyExtractor(item, index);
      }
      return `item-${index}`;
    },
    [props.keyExtractor]
  );

  // Memoize get item layout
  const getItemLayout = useMemo(() => {
    if (props.getItemLayout) {
      return props.getItemLayout;
    }
    return undefined;
  }, [props.getItemLayout]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      {...props}
    />
  );
}

export const OptimizedFlatList = memo(OptimizedFlatListComponent) as typeof OptimizedFlatListComponent;

export default OptimizedFlatList;


