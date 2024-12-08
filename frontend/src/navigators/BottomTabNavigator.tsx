import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { RootStackParamList } from "@/types/navigatorTypes";
import { View } from "react-native";
import BottomScreenNavigatorTabs from "./tabs/BottomScreenNavigatorTabs";
import useStyles from "@/styles/useGlobalStyles";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import TopBar from "./TopBar";

const Tab = createMaterialBottomTabNavigator<RootStackParamList>();

const BottomTabNavigator = () => {
  const { layout, colors } = useStyles();

  return (
    <View style={[layout.flex1, colors.background, layout.justifyEvenly]}>
      <TopBar />
      <Tab.Navigator
        barStyle={[
          {
            height: BOTTOM_BAR_HEIGHT,
            ...colors.background,
            borderTopWidth: 0.25,
            borderTopColor: colors.borderSecondaryContainer.borderColor,
          },
        ]}
        initialRouteName="MyProgressScreen"
        activeIndicatorStyle={{
          ...layout.center,
          width: 45,
          height: 40,
          borderRadius: 999,
        }}
        inactiveColor={colors.textOnBackground.color}
        activeColor={colors.textPrimary.color}
      >
        {BottomScreenNavigatorTabs.map((tab) => {
          return (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={tab.component}
              options={{ ...tab.options }}
            />
          );
        })}
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;
