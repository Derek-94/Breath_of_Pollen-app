import { useRef, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

const ITEM_HEIGHT = 44

interface ColumnProps {
  values: string[]
  selectedIndex: number
  onSelect: (index: number) => void
  isDark: boolean
}

function Column({ values, selectedIndex, onSelect, isDark }: ColumnProps) {
  const scrollRef = useRef<ScrollView>(null)
  const isScrolling = useRef(false)

  const scrollToIndex = useCallback((index: number, animated = false) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated })
  }, [])

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(values.length - 1, index))
    scrollToIndex(clamped, true)
    onSelect(clamped)
    isScrolling.current = false
  }, [values.length, onSelect, scrollToIndex])

  return (
    <View style={styles.column}>
      <View style={styles.selectionBar} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onLayout={() => scrollToIndex(selectedIndex, false)}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={styles.scroll}
      >
        {values.map((val, i) => (
          <View key={val} style={styles.item}>
            <Text style={[
              styles.itemText,
              isDark && styles.itemTextDark,
              i === selectedIndex && styles.itemTextSelected,
              i === selectedIndex && isDark && styles.itemTextSelectedDark,
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

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Column
        values={HOURS}
        selectedIndex={hour}
        onSelect={(i) => onChange(i, minute)}
        isDark={isDark}
      />
      <Text style={[styles.colon, isDark && styles.colonDark]}>:</Text>
      <Column
        values={MINUTES}
        selectedIndex={minute}
        onSelect={(i) => onChange(hour, i)}
        isDark={isDark}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT * 5,
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
    height: ITEM_HEIGHT * 5,
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
    color: '#bbb',
    fontWeight: '400',
  },
  itemTextDark: {
    color: '#555',
  },
  itemTextSelected: {
    fontSize: 22,
    color: '#111',
    fontWeight: '700',
  },
  itemTextSelectedDark: {
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
