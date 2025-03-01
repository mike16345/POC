import { IDietItem } from "@/interfaces/DietPlan";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import BottomDrawer from "../ui/BottomDrawer";
import CustomItemContent from "./CustomItemContent";
import NativeIcon from "../Icon/NativeIcon";
import { Text } from "../ui/Text";

interface CustomInstructionsContainerProps {
  foodGroup?: string;
  item: IDietItem;
}

const CustomInstructionsContainer: React.FC<CustomInstructionsContainerProps> = ({
  foodGroup,
  item,
}) => {
  const { layout, spacing, colors, common } = useStyles();
  const [openModal, setOpenModal] = useState(false);

  return (
    <View style={[layout.itemsStart, spacing.gapSm, spacing.pdVerticalXs]}>
      <TouchableOpacity
        style={[
          colors.background,
          layout.flexDirectionByPlatform,
          layout.center,
          spacing.gapSm,
          common.rounded,
          spacing.pdSm,
        ]}
        onPress={() => setOpenModal(true)}
      >
        <NativeIcon
          size={18}
          style={[colors.textPrimary]}
          library="MaterialCommunityIcons"
          name={foodGroup == `חלבונים` ? `fish` : `baguette`}
        />
        <Text style={[colors.textOnBackground]}>{item.quantity}</Text>
        <Text style={[colors.textOnBackground]}>{foodGroup}</Text>
      </TouchableOpacity>

      <BottomDrawer
        onClose={() => setOpenModal(false)}
        open={openModal}
        children={
          <CustomItemContent
            extraItems={item.extraItems || []}
            customInstructions={item.customItems || []}
            quantity={item.quantity}
            foodGroup={foodGroup}
          />
        }
      />
    </View>
  );
};

export default CustomInstructionsContainer;
