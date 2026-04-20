import React from 'react';
import { useColorScheme } from 'react-native';
import { TimerPickerModal } from 'react-native-timer-picker';
import { useTheme } from '@context/ThemeContext';

type CustomTimePickerModalProps = React.ComponentProps<typeof TimerPickerModal>;

export const CustomTimePickerModal: React.FC<CustomTimePickerModalProps> = (props) => {
    const { theme } = useTheme();
    const colorScheme = useColorScheme();

    return (
        <TimerPickerModal
            closeOnOverlayPress
            modalProps={{ overlayOpacity: 0.2 }}
            modalTitle="Set Access Time"
            hideSeconds={true}
            hideDays={false}
            dayLabel={'D'}
            hourLabel={'H'}
            minuteLabel={'M'}
            maximumDays={10}
            {...props}
            styles={{
                theme: colorScheme,
                contentContainer: {
                    paddingHorizontal: 40,
                    minWidth: 280,
                    gap: 5
                },
                cancelButton: {
                    fontFamily: 'PublicSans_500Medium',
                    color: theme.textGray,
                    backgroundColor: theme.backgroundLight,
                    borderWidth: 0,
                },
                confirmButton: {
                    fontFamily: 'PublicSans_500Medium',
                    color: '#FFFFFF',
                    backgroundColor: theme.primary,
                    borderWidth: 0,
                },
                text: {
                    color: theme.textGray
                },
                selectedPickerItem: {
                    color: theme.text,
                },
                pickerLabel: {
                    fontFamily: 'PublicSans_500Medium',
                    color: theme.text,
                },
                pickerItem: {
                    fontFamily: 'PublicSans_500Medium',
                    color: theme.textVeryLight,
                },
                modalTitle: {
                    fontFamily: 'Lexend_400Regular',
                    color: theme.text
                },
                ...props.styles,
            }}
        />
    );
};
