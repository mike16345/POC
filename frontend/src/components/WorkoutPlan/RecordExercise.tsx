import { FC, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  useWindowDimensions,
  Pressable,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { IRecordedSet, IRecordedSetResponse } from "@/interfaces/Workout";
import { StackNavigatorProps, WorkoutPlanStackParamList } from "@/types/navigatorTypes";
import useStyles from "@/styles/useGlobalStyles";
import { Button } from "react-native-paper";
import WorkoutVideoPopup from "./WorkoutVideoPopup";
import { createRetryFunction, extractVideoId, generateWheelPickerData } from "@/utils/utils";
import WeightWheelPicker from "../WeightGraph/WeightWheelPicker";
import WheelPicker from "../ui/WheelPicker";
import WorkoutTips from "./WorkoutTips";
import NativeIcon from "../Icon/NativeIcon";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import Loader from "../ui/loaders/Loader";
import RecordedSetInfo from "./RecordedSetInfo";
import { EXERCISE_METHOD, ONE_DAY } from "@/constants/reactQuery";
import { Text } from "../ui/Text";
import Toast from "react-native-toast-message";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";
import Divider from "../ui/Divider";
import BottomDrawer from "../ui/BottomDrawer";
import { useLayoutStore } from "@/store/layoutStore";

interface RecordExerciseProps extends StackNavigatorProps<WorkoutPlanStackParamList, "RecordSet"> {}

const findLatestRecordedSetByNumber = (
  recordedSets: IRecordedSetResponse[],
  setNumber: number
): IRecordedSetResponse | null => {
  if (!recordedSets.length) return null;

  const matchingSets = recordedSets.filter((set) => set.setNumber === setNumber);

  if (!matchingSets.length) return null;

  const latestSet = matchingSets.reduce((latest, current) =>
    new Date(latest.date) > new Date(current.date) ? latest : current
  );

  return latestSet;
};

const RecordExercise: FC<RecordExerciseProps> = ({ route, navigation }) => {
  const repsOptions = useMemo(() => generateWheelPickerData(1, 100), []);
  const { handleRecordSet, exercise, muscleGroup, setNumber } = route!.params;
  const { setIsTopBarVisible } = useLayoutStore();
  const { width, height } = useWindowDimensions();
  const customStyles = useStyles();
  const { colors, fonts, layout, spacing, text, common } = customStyles;
  const currentUser = useUserStore((state) => state.currentUser);
  const { getUserRecordedSetsByExercise } = useRecordedSetsApi();
  const { getExerciseMethodByName } = useExerciseMethodApi();
  const [currentSetNumber, setCurrentSetNumber] = useState(setNumber);

  const { data, isLoading } = useQuery(
    ["recordedSets", exercise],
    () =>
      getUserRecordedSetsByExercise(exercise.name, muscleGroup, currentUser?._id || "").then(
        (res) => res.data
      ),

    { enabled: !!exercise, retry: createRetryFunction(404), staleTime: ONE_DAY }
  );

  const exerciseMethodQuery = useQuery(
    [EXERCISE_METHOD + exercise.exerciseMethod],
    () => getExerciseMethodByName(exercise?.exerciseMethod || ``).then((res) => res.data),
    { enabled: !!exercise.exerciseMethod }
  );

  const lastRecordedSet = findLatestRecordedSetByNumber(data || [], currentSetNumber);
  const strippedTips = exercise.tipFromTrainer?.replace(" ", "");

  const [recordedSet, setRecordedSet] = useState<Omit<IRecordedSet, "plan">>({
    weight: 0,
    repsDone: 0,
    note: "",
  });

  const [openTrainerTips, setOpenTrainerTips] = useState(false);
  const [openExerciseMethod, setOpenExerciseMethod] = useState(false);
  const [isSetUploading, setIsSetUploading] = useState(false);

  const handleUpdateRecordedSet = <K extends keyof IRecordedSet>(
    key: keyof IRecordedSet,
    value: IRecordedSet[K]
  ) => {
    setRecordedSet((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    try {
      setIsSetUploading(true);
      await handleRecordSet(recordedSet);
      setCurrentSetNumber((prev) => prev + 1);
    } catch (err: any) {
      Toast.show({
        text1: "הסט שהוקלד אינו תקין",
        text2: err.message,
        autoHide: true,
        type: "error",
        swipeable: true,
        text1Style: { textAlign: `center` },
        text2Style: { textAlign: `center` },
      });
    } finally {
      setIsSetUploading(false);
    }
  };

  const handlePressBack = () => {
    navigation?.goBack();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handlePressBack);

    return () => {
      setIsTopBarVisible(true);

      backHandler.remove();
    };
  }, []);

  if (isLoading || (exerciseMethodQuery.isLoading && exercise.exerciseMethod))
    return <Loader variant="Standard" />;

  return (
    <>
      {isSetUploading && <Loader variant="Screen" />}
      <View
        style={[
          layout.sizeFull,
          layout.flex1,
          spacing.pdBottomBar,
          spacing.gapSm,
          colors.background,
        ]}
      >
        {exercise.linkToVideo && (
          <WorkoutVideoPopup width={width} videoId={extractVideoId(exercise.linkToVideo || "")} />
        )}

        {!exercise.linkToVideo && (
          <View
            style={[
              { width: width, height: 200 },
              colors.backgroundSecondaryContainer,
              layout.center,
            ]}
          >
            <NativeIcon
              library="AntDesign"
              name="exclamationcircleo"
              style={[fonts.xxxxl, colors.textOnSecondaryContainer]}
            />
            <Text style={[colors.textOnSecondaryContainer]}>סרטון לא נמצא</Text>
          </View>
        )}
        <View
          style={[layout.flexGrow, layout.justifyStart, spacing.pdHorizontalDefault, spacing.gapSm]}
        >
          <View style={[layout.itemsEnd, spacing.gapMd]}>
            <Text style={[styles.setInfo, fonts.lg]}>{exercise.name}</Text>
            <View
              style={[
                layout.flexRowReverse,
                layout.itemsCenter,
                layout.justifyBetween,
                layout.widthFull,
              ]}
            >
              <View style={[layout.flexColumn, layout.itemsEnd, spacing.gapXs]}>
                <Text style={styles.setInfo}>סט: {currentSetNumber}</Text>

                {exercise.sets[currentSetNumber - 1] && (
                  <>
                    <Divider color={colors.textPrimary.color} thickness={0.5} />
                    <Text style={styles.setInfo}>
                      חזרות: {exercise.sets[currentSetNumber - 1].minReps}
                      {exercise.sets[currentSetNumber - 1].maxReps &&
                        `-${exercise.sets[currentSetNumber - 1].maxReps}`}
                    </Text>
                  </>
                )}
              </View>
              <View style={[layout.flexRowReverse, spacing.gapDefault]}>
                {strippedTips && strippedTips.length && (
                  <Pressable
                    onPress={() => setOpenTrainerTips(true)}
                    style={[colors.backgroundSecondaryContainer, common.roundedSm, spacing.pdSm]}
                  >
                    <Text style={[fonts.md, colors.textOnBackground]}>דגשים לתרגיל</Text>
                  </Pressable>
                )}
                {exerciseMethodQuery.data && (
                  <Pressable
                    onPress={() => setOpenExerciseMethod(true)}
                    style={[colors.backgroundPrimary, common.roundedSm, spacing.pdSm]}
                  >
                    <Text style={[fonts.md, colors.textOnBackground]}>שיטת אימון</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <WorkoutTips
              tips={[exercise.tipFromTrainer!]}
              openTips={openTrainerTips}
              title="דגשים לתרגיל"
              setOpenTips={setOpenTrainerTips}
            />

            <BottomDrawer
              onClose={() => setOpenExerciseMethod(false)}
              open={openExerciseMethod}
              heightVariant="auto"
              children={
                <View
                  style={[
                    layout.itemsEnd,
                    spacing.gapDefault,
                    spacing.pdDefault,
                    spacing.pdBottomBar,
                  ]}
                >
                  <Text
                    style={[
                      text.textRight,
                      fonts.xxl,
                      text.textBold,
                      colors.textPrimary,
                      spacing.pdDefault,
                    ]}
                  >
                    שיטת אימון
                  </Text>
                  <View
                    style={[
                      common.rounded,
                      colors.backdrop,
                      spacing.pdDefault,
                      layout.widthFull,
                      layout.flexRowReverse,
                      layout.itemsCenter,
                      spacing.gapDefault,
                      layout.justifyStart,
                    ]}
                  >
                    <View style={[spacing.gapSm]}>
                      <View
                        style={[layout.flexRowReverse, layout.widthFull, layout.justifyBetween]}
                      >
                        <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>
                          {exerciseMethodQuery.data?.title}
                        </Text>
                        <NativeIcon
                          size={24}
                          style={[colors.textOnBackground]}
                          library="MaterialCommunityIcons"
                          name="dumbbell"
                        />
                      </View>
                      <Text style={[colors.textOnBackground, text.textRight]}>
                        {exerciseMethodQuery.data?.description}
                      </Text>
                    </View>
                  </View>
                </View>
              }
            />
          </View>

          <View style={[layout.flexRow, layout.justifyEvenly, spacing.pdVerticalSm]}>
            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default]}>חזרות</Text>

              <View
                style={[
                  { borderTopWidth: 2, borderBottomWidth: 2 },
                  colors.borderSecondary,
                  spacing.pdHorizontalDefault,
                  spacing.pdVerticalMd,
                  common.rounded,
                  colors.backdrop,
                  { width: width * 0.3 },
                ]}
              >
                <WheelPicker
                  activeItemColor={colors.textOnSurface.color}
                  inactiveItemColor={colors.textOnSurfaceDisabled.color}
                  data={repsOptions}
                  onValueChange={(val) => handleUpdateRecordedSet("repsDone", val)}
                  selectedValue={recordedSet.repsDone || lastRecordedSet?.repsDone || 0}
                  height={height * 0.08}
                  itemHeight={35}
                />
              </View>
            </View>
            <View style={[layout.center, spacing.gapDefault]}>
              <Text style={[colors.textOnSecondaryContainer, fonts.default]}>משקל</Text>

              <View
                style={[
                  { borderTopWidth: 2, borderBottomWidth: 2 },
                  colors.borderSecondary,
                  spacing.pdHorizontalDefault,
                  spacing.pdVerticalMd,
                  common.rounded,
                  colors.backdrop,
                  { width: width * 0.45 },
                ]}
              >
                <WeightWheelPicker
                  onValueChange={(val) => {
                    handleUpdateRecordedSet("weight", val);
                  }}
                  activeItemColor={colors.textOnSurface.color}
                  inactiveItemColor={colors.textOnSurfaceDisabled.color}
                  minWeight={1}
                  decimalStepSize={25}
                  showZeroDecimal={true}
                  decimalRange={100}
                  maxWeight={200}
                  stepSize={1}
                  label=""
                  height={height * 0.08}
                  itemHeight={35}
                  selectedWeight={recordedSet.weight || lastRecordedSet?.weight || 0}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation?.navigate("RecordedSets", {
                recordedSets: data || [],
              });
            }}
            disabled={!lastRecordedSet}
            style={[spacing.mgVerticalDefault, spacing.gapSm]}
          >
            <Text style={[text.textRight, text.textBold, colors.textOnSecondaryContainer]}>
              אימון קודם
              {lastRecordedSet && "-" + new Date(lastRecordedSet.date).toLocaleDateString()}
            </Text>
            <RecordedSetInfo
              actionButton={
                <NativeIcon
                  color={colors.textOnSecondaryContainer.color}
                  library="MaterialCommunityIcons"
                  name="chevron-left"
                  size={28}
                />
              }
              recordedSet={lastRecordedSet}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            layout.flexRowReverse,
            layout.center,
            layout.widthFull,
            spacing.gapLg,
            spacing.pdHorizontalDefault,
          ]}
        >
          <Button
            mode="contained-tonal"
            onPress={() => navigation?.goBack()}
            style={[common.rounded, { width: `48%` }]}
          >
            בטל
          </Button>
          <Button mode="contained" onPress={handleSave} style={[common.rounded, { width: `48%` }]}>
            <Text style={[customStyles.text.textBold, colors.textOnBackground]}>שמור</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default RecordExercise;

const styles = StyleSheet.create({
  setInfo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
