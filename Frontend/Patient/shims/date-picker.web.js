import React from 'react';
import { Platform, TextInput, View } from 'react-native';

function toInputValue(date, mode) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const iso = date.toISOString();
  if (mode === 'time') return iso.slice(11, 16);
  if (mode === 'date') return iso.slice(0, 10);
  return iso.slice(0, 16);
}

function fromInputValue(value, mode) {
  if (!value) return new Date();
  if (mode === 'time') {
    const [h, m] = value.split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }
  return new Date(value);
}

function DatePicker({ date, mode = 'datetime', onDateChange, minimumDate, maximumDate, style }) {
  const inputType = mode === 'time' ? 'time' : mode === 'date' ? 'date' : 'datetime-local';
  return (
    <View style={style}>
      <TextInput
        // @ts-ignore: web-only DOM prop passthrough via react-native-web
        type={inputType}
        value={toInputValue(date, mode)}
        min={minimumDate ? toInputValue(minimumDate, mode) : undefined}
        max={maximumDate ? toInputValue(maximumDate, mode) : undefined}
        onChange={(e) => {
          const next = fromInputValue(e?.nativeEvent?.text ?? e?.target?.value, mode);
          onDateChange && onDateChange(next);
        }}
        style={{ padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 }}
      />
    </View>
  );
}

export default DatePicker;
