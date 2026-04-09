import { Tabs } from "expo-router";
import { UserOnly } from "src/components/auth/UserOnly";
import CustomTabBar from "src/components/tabBar/customTabBar";
import { MaterialIcons, Octicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <UserOnly>
        <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
            <Tabs.Screen name="Dashboard" options={{ 
                title: 'Home', 
                headerShown: false,
                tabBarIcon: ({ color }) => <Octicons name="home-fill" size={20} color={color} style={{ marginBottom: 0 }} />
            }} />
            <Tabs.Screen name="Share" options={{ 
                title: 'Share', 
                headerShown: false,
                tabBarIcon: ({ color }) => <Octicons name="share" size={20} color={color} />
            }} />
        </Tabs>
        </UserOnly>
    );
}