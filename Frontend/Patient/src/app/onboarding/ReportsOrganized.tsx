import { Image, View } from "react-native";
import { ThemedText } from "src/components";
import { Colors } from "src/constants/colors";

function ReportsOrganized({theme}: {theme: typeof Colors.light})
{
    return <View style={{ justifyContent: "center", alignItems: "center" }}>

        <Image source={require("../../../assets/onboarding/undraw_mobile-content_yz21.png")} style={{ height: 260, resizeMode: "contain" }} />
        
        <ThemedText type={'h1'} style={{ color: theme.text, paddingHorizontal: 50, textAlign: "center", fontFamily: 'Lexend_500Medium', marginTop: 35 }}>
            Your Reports, Organized
        </ThemedText>
        
        <ThemedText style={{ fontSize: 13, color: theme.text, fontFamily: 'Lexend_300Light', marginTop: 4 }}>
            SAVE
            <ThemedText style={{ fontSize: 15, color: theme.primary }}>  •  </ThemedText>
            UPLOAD
            <ThemedText style={{ fontSize: 15, color: theme.primary }}>  •  </ThemedText>
            SHARE
        </ThemedText>

    </View>
}

export default ReportsOrganized;