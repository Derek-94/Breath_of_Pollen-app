import { useRef, useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

const ITEM_HEIGHT = 44
const VISIBLE_ITEMS = 5

interface ColumnProps {
  values: string[]
  initialIndex: number
  onSelect: (index: number) => void
  isDark: boolean
}

function Column({ values, initialIndex, onSelect, isDark }: ColumnProps) {
  const scrollRef = useRef<ScrollView>(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      // 첫 렌더 이후 스크롤 위치 설정
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ y: initialIndex * ITEM_HEIGHT, animated: false })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, []) // 마운트 시 1회만

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y
    const index = Math.max(0, Math.min(values.length - 1, Math.round(y / ITEM_HEIGHT)))
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true })
    setActiveIndex(index)
    onSelect(index)
  }, [values.length, onSelect])

  return (
    <View style={styles.column}>
      <View style={styles.selectionBar} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={styles.scroll}
        scrollEventThrottle={16}
      >
        {values.map((val, i) => (
          <View key={i} style={styles.item}>
            <Text style={[
              styles.itemText,
              isDark ? styles.itemTextDark : styles.itemTextLight,
              i === activeIndex && (isDark ? styles.itemTextSelectedDark : styles.itemTextSelected),
            ]}>
              {val}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

interface TimePickerProps {
  hour: number
  minute: number
  onChange: (hour: number, minute: number) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

export function TimePicker({ hour, minute, onChange }: TimePickerProps) {
  const { isDark } = useTheme()
  const hourRef = useRef(hour)
  const minuteRef = useRef(minute)

  const handleHourSelect = useCallback((i: number) => {
    hourRef.current = i
    onChange(i, minuteRef.current)
  }, [onChange])

  const handleMinuteSelect = useCallback((i: number) => {
    minuteRef.current = i
    onChange(hourRef.current, i)
  }, [onChange])

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Column
        values={HOURS}
        initialIndex={hour}
        onSelect={handleHourSelect}
        isDark={isDark}
      />
      <Text style={[styles.colon, isDark && styles.colonDark]}>:</Text>
      <Column
        values={MINUTES}
        initialIndex={minute}
        onSelect={handleMinuteSelect}
        isDark={isDark}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  containerDark: {
    backgroundColor: '#2a2a2a',
  },
  column: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  selectionBar: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f87171',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '400',
  },
  itemTextLight: {
    color: '#ccc',
  },
  itemTextDark: {
    color: '#555',
  },
  itemTextSelected: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  itemTextSelectedDark: {
    fontSize: 22,
    fontWeight: '700',
    color: '#eee',
  },
  colon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    paddingHorizontal: 4,
  },
  colonDark: {
    color: '#eee',
  },
})
