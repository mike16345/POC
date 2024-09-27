import { View, ImageBackground, ScrollView, Text } from "react-native";
import { useEffect, useState } from "react";
import logoBlack from "../../../assets/avihu/avihu-logo-black.png";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { useUserStore } from "@/store/userStore";
import { IDietPlan } from "@/interfaces/DietPlan";
import MealContainer from "./MealContainer";
import NativeIcon from "../Icon/NativeIcon";
import FABGroup from "../ui/FABGroup";
import MenuItemModal from "./MenuItemModal";
import useStyles from "@/styles/useGlobalStyles";
import { DarkTheme } from "@/themes/useAppTheme";
import { Portal } from "react-native-paper";
import Divider from "../ui/Divider";

export default function DietPlan() {
  const currentUser = useUserStore((state) => state.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();
  const { layout, spacing, colors, common, text } = useStyles();

  const [dietPlan, setDietPlan] = useState<IDietPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedFoodGroup, setSelectedFoodGroup] = useState<string | null>(null);

  const displayMenuItems = (foodGroup: string) => {
    setIsModalOpen(true);
    setIsFabOpen(false);
    setSelectedFoodGroup(foodGroup);
  };

  useEffect(() => {
    if (!currentUser) return;

    getDietPlanByUserId(currentUser._id)
      .then((res) => setDietPlan(res))
      .catch((err) => console.log(err));
  }, []);

  return (
    <Portal.Host>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          layout.flexGrow,
          colors.backgroundSecondary,
          spacing.pdBottomBar,
          { backgroundColor: DarkTheme.colors.background },
        ]}
      >
        <ImageBackground source={logoBlack} className="w-screen h-[30vh]" />
        <View style={[spacing.pdDefault, spacing.gapLg]}>
          {dietPlan?.meals.map((meal, i) => (
            <View
              key={i}
              style={[
                layout.flexRowReverse,
                layout.itemsCenter,
                spacing.pdDefault,
                colors.backgroundSecondaryContainer,
                common.rounded,
              ]}
            >
              <View style={[layout.itemsCenter, spacing.pdXs, spacing.gapSm, { paddingLeft: 10 }]}>
                <NativeIcon
                  library="MaterialCommunityIcons"
                  name="food-outline"
                  color={colors.textOnSecondaryContainer.color}
                  size={20}
                />
                <Text style={[text.textBold, colors.textOnBackground]}>ארוחה {i + 1}</Text>
              </View>
              <Divider
                orientation="vertical"
                thickness={1}
                color={colors.textOnSecondaryContainer.color}
              />
              <MealContainer meal={meal} />
            </View>
          ))}
        </View>

        <MenuItemModal
          foodGroup={selectedFoodGroup}
          isOpen={isModalOpen}
          dismiss={() => setIsModalOpen(false)}
        />

        <FABGroup
          open={isFabOpen}
          visible
          variant="primary"
          icon={isFabOpen ? `close` : `food-outline`}
          onStateChange={({ open }) => setIsFabOpen(open)}
          actions={[
            {
              icon: "fish",
              label: "חלבונים",
              onPress: () => displayMenuItems(`protein`),
            },
            {
              icon: "baguette",
              label: "פחמימות",
              onPress: () => displayMenuItems(`carbs`),
            },
            {
              icon: "cheese",
              label: "שומנים",
              onPress: () => displayMenuItems(`fats`),
            },
            {
              icon: `leaf`,
              label: `ירקות`,
              onPress: () => displayMenuItems(`vegetables`),
            },
          ]}
        />
      </ScrollView>
    </Portal.Host>
  );
}
