import { Pressable, View } from "react-native";
import { FC } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import NativeIcon from "../Icon/NativeIcon";

interface SetContainerProps {
  currentSetNumber: number;
  totalSets: number;
  handleViewSet: (setNumber: number) => void;
}

const SetContainer: FC<SetContainerProps> = ({ currentSetNumber, totalSets, handleViewSet }) => {
  const { colors, common, layout, text } = useStyles();

  return (
    <View>
      <View style={[layout.itemsCenter, layout.flexRowReverse]}>
        {Array.from({ length: totalSets }).map((_, index) => (
          <View key={index} style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <Pressable
              onPress={() => {
                handleViewSet(index + 1);
              }}
              style={[
                layout.center,
                common.rounded,
                {
                  width: 24,
                  height: 24,
                  zIndex: 1,
                },
                index + 1 < currentSetNumber
                  ? [colors.backgroundPrimary, colors.borderSurface, common.borderSm]
                  : [colors.backgroundSurface, colors.borderOnSecondaryContainer, common.borderXsm],
              ]}
            >
              {index + 1 < currentSetNumber ? (
                <NativeIcon library="MaterialIcons" name="check" size={16} />
              ) : (
                <Text style={[text.textCenter, colors.textOnPrimaryContainer, text.textBold]}>
                  {index + 1}
                </Text>
              )}
            </Pressable>

            {index < totalSets - 1 && (
              <View
                style={{
                  width: 30,
                  height: 4,
                  backgroundColor:
                    index < currentSetNumber - 1
                      ? colors.backgroundPrimary.backgroundColor // Completed bar color
                      : colors.backgroundSurface.backgroundColor, // Incomplete bar color
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default SetContainer;
