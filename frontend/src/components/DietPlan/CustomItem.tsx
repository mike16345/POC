import React from "react";
import { View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";

interface CustomItemProps {
  name: string;
  quantity: number;
  foodGroup: string;
}

const CustomItem: React.FC<CustomItemProps> = ({ name, quantity, foodGroup }) => {
  const { layout, spacing, colors, text, common } = useStyles();

  return (
    <View
      style={[
        layout.flexDirectionByPlatform,
        colors.backgroundSecondary,
        common.rounded,
        spacing.pdSm,
        layout.wrap,
        layout.widthFull,
        layout.itemsCenter,
        spacing.gapDefault,
      ]}
    >
      <View style={[colors.background, common.roundedSm, spacing.pdXs, layout.center]}>
        <NativeIcon
          size={25}
          style={colors.textPrimary}
          library="MaterialCommunityIcons"
          name={foodGroup === `חלבונים` ? `fish` : `baguette`}
        />
      </View>

      <View
        style={[
          layout.flexDirectionByPlatform,
          layout.justifyBetween,
          layout.itemsCenter,
          layout.flex1,
          spacing.gapDefault,
        ]}
      >
        <Text
          style={[colors.textOnSecondary, text.textBold, layout.flex1, text.textLeft]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <View style={[colors.backgroundPrimary, { width: 3, height: 14 }]} />
        <Text style={[colors.textOnSecondary, text.textBold, { flexShrink: 1 }]}>
          {quantity > 1 ? `${quantity} מנות` : `מנה אחת`}
        </Text>
      </View>
    </View>
  );
};

export default CustomItem;
