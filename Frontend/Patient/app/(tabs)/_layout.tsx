import { UserOnly } from "src/components/auth/UserOnly";
import MainTabLayout from "src/components/tabBar/tabBar";

export default function TabsLayout() {
    return (
        <UserOnly>
            <MainTabLayout />
        </UserOnly>
    );
}