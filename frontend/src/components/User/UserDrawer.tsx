import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import RightDrawer from "../ui/RightDrawer";
import { Text } from "../ui/Text";
import { Button } from "react-native-paper";
import { useUserDrawer } from "@/store/userDrawerStore";
import { useUserStore } from "@/store/userStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import NativeIcon from "../Icon/NativeIcon";
import UserDetailContainer from "./UserDetailContainer";

const UserDrawer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { openUserDrawer, setOpenUserDrawer } = useUserDrawer();
  const { currentUser, setCurrentUser } = useUserStore();
  const sessionStorage = useAsyncStorage("sessionToken");

  const logUserOut = () => {
    setOpenUserDrawer(false);
    setCurrentUser(null);
    sessionStorage.removeItem();
  };

  return (
    <RightDrawer
      open={openUserDrawer}
      onClose={() => setOpenUserDrawer(false)}
      children={
        <View
          style={[
            layout.sizeFull,
            layout.justifyEvenly,
            spacing.pdHorizontalMd,
            spacing.pdStatusBar,
          ]}
        >
          <Text style={[text.textRight, text.textBold, colors.textOnBackground, fonts.lg]}>
            פרטי משתמש
          </Text>
          <UserDetailContainer
            label="שם מלא"
            value={`${currentUser?.firstName} ${currentUser?.lastName}`}
          />
          <UserDetailContainer label="מייל" value={currentUser?.email || ``} />
          <UserDetailContainer label="טלפון" value={currentUser?.phone || ``} />
          <UserDetailContainer label="סוג תוכנית" value={currentUser?.planType || ``} />
          <UserDetailContainer
            label="תאריך הצטרפות"
            value={new Date(currentUser?.dateJoined || ``).toLocaleDateString()}
          />
          <UserDetailContainer
            label="תאריך סיום"
            value={new Date(currentUser?.dateFinished || ``).toLocaleDateString()}
          />
          {/* <UserInfoContainer /> */}
          <Button
            mode="contained-tonal"
            style={common.rounded}
            textColor={colors.textOnBackground.color}
            onPress={logUserOut}
            icon={() => (
              <NativeIcon
                library="Ionicons"
                name="exit-outline"
                style={[fonts.lg, colors.textOnBackground]}
              />
            )}
          >
            התנתק
          </Button>
        </View>
      }
    />
  );
};

export default UserDrawer;
