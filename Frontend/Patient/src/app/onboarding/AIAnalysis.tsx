import { Image, View } from "react-native";
import { ThemedText } from "src/components";
import { Colors } from "src/constants/colors";

function AIAnalysis({theme}: {theme: typeof Colors.light})
{
    return <View style={{ justifyContent: "center", alignItems: "center" }}>

        <Image source={require("../../../assets/onboarding/undraw_ai-response_gaip.png")} style={{ height: 280, resizeMode: "contain" }} />
        
        <ThemedText type={'h1'} style={{ color: theme.text, paddingHorizontal: 50, textAlign: "center", fontFamily: 'Lexend_500Medium', marginTop: 35 }}>
            AI Feedback
        </ThemedText>
        
        <ThemedText style={{ fontSize: 14, color: theme.text, fontFamily: 'Lexend_300Light', marginTop: 4, paddingHorizontal: 40, textAlign: "center" }}>
            Understand your reports better with AI comments.
        </ThemedText>

    </View>
}

export default AIAnalysis;