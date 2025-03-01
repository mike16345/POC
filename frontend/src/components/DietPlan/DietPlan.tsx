import {
  View,
  ImageBackground,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useState } from "react";
import logoBlack from "../../../assets/avihu/avihu-logo-black.png";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { useUserStore } from "@/store/userStore";
import MealContainer from "./MealContainer";
import NativeIcon from "../Icon/NativeIcon";
import FABGroup from "../ui/FABGroup";
import MenuItemModal from "./MenuItemModal";
import useStyles from "@/styles/useGlobalStyles";
import { DarkTheme } from "@/themes/useAppTheme";
import { Portal } from "react-native-paper";
import DietPlanSkeleton from "../ui/loaders/skeletons/DietPlanSkeleton";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import ExtraInfoContainer from "./ExtraInfoContainer";
import Divider from "../ui/Divider";
import { useQuery } from "@tanstack/react-query";
import { DIET_PLAN_KEY, ONE_DAY } from "@/constants/reactQuery";
import ErrorScreen from "@/screens/ErrorScreen";
import NoDataScreen from "@/screens/NoDataScreen";
import { createRetryFunction } from "@/utils/utils";
import { Text } from "../ui/Text";
import { useFoodGroupStore } from "@/store/foodgroupStore";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import useFoodGroupQuery from "@/hooks/queries/useMenuItemsQuery";
import { FoodGroup } from "@/types/foodTypes";

export default function DietPlan() {
  const currentUser = useUserStore((state) => state.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();
  const { layout, spacing, colors, common, text } = useStyles();
  const { foodGroupToDisplay, setFoodGroupToDisplay } = useFoodGroupStore();
  const { isRefreshing, refresh } = usePullDownToRefresh();

  const [isFabOpen, setIsFabOpen] = useState(false);
  const {
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
    slideInBottomDelay500,
    slideInBottomDelay600,
  } = useSlideInAnimations();

  const slideAnimations = [
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
    slideInBottomDelay500,
    slideInBottomDelay600,
  ];

  const { data, isError, error, isLoading, refetch } = useQuery({
    queryFn: () => getDietPlanByUserId(currentUser?._id || ``),
    queryKey: [DIET_PLAN_KEY + currentUser?._id],
    enabled: !!currentUser,
    staleTime: ONE_DAY,
    retry: createRetryFunction(404, 2),
  });

  const carbsQuery = useFoodGroupQuery("carbs");
  const proteinsQuery = useFoodGroupQuery("protein");
  const fatsQuery = useFoodGroupQuery("fats");
  const vegetablesQuery = useFoodGroupQuery("vegetables");

  const displayMenuItems = (foodGroup: FoodGroup) => {
    setIsFabOpen(false);
    setFoodGroupToDisplay(foodGroup);
  };

  const closeMenuItemsModal = () => {
    setFoodGroupToDisplay(null);
  };

  const refetchDietPlan = async () => {
    const results = await Promise.allSettled([
      refetch(),
      carbsQuery.refetch(),
      proteinsQuery.refetch(),
      fatsQuery.refetch(),
      vegetablesQuery.refetch(),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Refetch ${index} failed:`, result.reason);
      }
    });

    return results;
  };

  if (error && error.response.status == 404)
    return (
      <NoDataScreen
        variant="dietPlan"
        refreshing={isRefreshing}
        refreshFunc={() => refresh(refetchDietPlan)}
      />
    );
  if (isError) return <ErrorScreen error={error} refetchFunc={refetchDietPlan} />;

  return (
    <Portal.Host>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetchDietPlan)} />
        }
        contentContainerStyle={[
          layout.flexGrow,
          colors.backgroundSecondary,
          spacing.pdBottomBar,
          { backgroundColor: DarkTheme.colors.background },
        ]}
      >
        <ImageBackground
          source={logoBlack}
          style={{ height: Dimensions.get("screen").height / 4 }}
        />

        {isLoading ? (
          <DietPlanSkeleton />
        ) : (
          <View style={[spacing.pdDefault, spacing.gapLg]}>
            <View style={{ direction: `rtl` }}>
              <ExtraInfoContainer
                customInstructions={data?.customInstructions}
                freeCalories={data?.freeCalories}
                fatsPerDay={data?.fatsPerDay}
                veggiesPerDay={data?.veggiesPerDay}
              />
            </View>
            {data?.meals.map((meal, i) => (
              <Animated.View
                key={meal._id}
                style={[
                  layout.flexRowReverse,
                  layout.itemsCenter,
                  spacing.pdDefault,
                  colors.backgroundSecondaryContainer,
                  common.rounded,
                  slideAnimations[i + 1],
                  { overflow: "hidden" },
                ]}
              >
                <View
                  style={[layout.itemsCenter, spacing.pdXs, spacing.gapSm, { paddingLeft: 10 }]}
                >
                  <NativeIcon
                    library="MaterialCommunityIcons"
                    name="food-outline"
                    color={colors.textOnBackground.color}
                    size={20}
                  />
                  <Text style={[text.textBold, colors.textOnBackground]}>ארוחה {i + 1}</Text>
                </View>
                <Divider orientation="vertical" color="white" thickness={0.8} />
                <MealContainer meal={meal} />
              </Animated.View>
            ))}
          </View>
        )}

        <MenuItemModal foodGroup={foodGroupToDisplay} dismiss={closeMenuItemsModal} />

        <FABGroup
          open={isFabOpen}
          visible
          variant="primary"
          color={colors.textOnBackground.color}
          fabStyle={[colors.backgroundPrimary]}
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
