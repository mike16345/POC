import { View, SectionList, BackHandler } from "react-native";
import React, { useEffect } from "react";
import useStyles from "@/styles/useGlobalStyles";
import RecordedSetInfo from "./RecordedSetInfo";
import { Text } from "../ui/Text";
import { useNavigation } from "@react-navigation/native";

interface RecordedSetsProps {
  route: any;
}

// Helper function to format date as DD/MM/YYYY in UTC
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const RecordedSets: React.FC<RecordedSetsProps> = ({ route }) => {
  const { spacing, text, fonts, colors } = useStyles();
  const { recordedSets } = route.params;
  const navigator = useNavigation();

  // Group recordedSets by date
  const sections = recordedSets.reduce((acc: any[], set: any) => {
    const formattedDate = formatDate(set.date);
    const section = acc.find((s) => s.title === formattedDate);

    if (section) {
      section.data.push(set);
    } else {
      acc.push({ title: formattedDate, data: [set] });
    }
    return acc;
  }, []);

  const handlePressBack = () => {
    navigator.goBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handlePressBack);

    return BackHandler.removeEventListener("hardwareBackPress", handlePressBack);
  }, []);

  return (
    <View style={[spacing.pdDefault, colors.background]}>
      {sections.length ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <RecordedSetInfo recordedSet={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={[
                text.textRight,
                text.textBold,
                colors.textOnSecondaryContainer,
                fonts.lg,
                spacing.mgVerticalDefault,
              ]}
            >
              {title}
            </Text>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        />
      ) : (
        <Text style={text.textCenter}>No recorded sets available.</Text>
      )}
    </View>
  );
};

export default RecordedSets;
