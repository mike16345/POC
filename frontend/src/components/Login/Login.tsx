import {
  View,
  Keyboard,
  ImageBackground,
  KeyboardAvoidingView,
  useWindowDimensions,
  Animated,
  useAnimatedValue,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import avihuFlyTrap from "@assets/avihu/avihuFlyTrap.jpeg";
import { showAlert, testEmail } from "@/utils/utils";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import { moderateScale } from "react-native-size-matters";
import { useUserApi } from "@/hooks/api/useUserApi";
import Loader from "../ui/loaders/Loader";
import { useUserStore } from "@/store/userStore";
import { IUser } from "@/interfaces/User";
import { Text } from "../ui/Text";
import ForgotPassword from "./ForgotPassword";
import { EMAIL_ERROR, NO_ACCESS, NO_PASSWORD } from "@/constants/Constants";
import DismissKeyboard from "../ui/DismissKeyboard";
import { ConditionalRender } from "../ui/ConditionalRender";
import TextInput from "../ui/TextInput";
import { TextInput as RNTextInput } from "react-native-paper";

interface IUserCredentials {
  email: string;
  password: string;
}

export interface ICredentialsErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  validPassword?: string;
}

interface ILoginProps {
  onLogin: (user: IUser) => void;
}

export default function Login({ onLogin }: ILoginProps) {
  const { text, colors, layout, spacing, common } = useStyles();
  const { loginUser } = useUserApi();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const { height, width } = useWindowDimensions();

  const { setItem } = useAsyncStorage("sessionToken");

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isShowingOtpInputs, setIsShowingOtpInputs] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(true);

  const handleSubmit = () => {
    const { email, password } = inputtedCrendentials;
    const formattedEmail = email.toLowerCase().trim();
    const errors: ICredentialsErrors = {};

    Keyboard.dismiss();

    if (!testEmail(formattedEmail)) {
      errors[`email`] = EMAIL_ERROR;
    }

    if (!password) {
      errors[`password`] = NO_PASSWORD;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    loginUser(formattedEmail, password)
      .then((res) => {
        if (!res.data.data.user.hasAccess) {
          showAlert("error", NO_ACCESS, 2000);
          return;
        }
        showAlert("success", res.message);
        onLogin(res.data.data.user);
        setCurrentUser(res?.data.data.user);
        setItem(JSON.stringify(res.data));
      })
      .catch((err) => {
        showAlert("error", err.response.data.message);
      })
      .finally(() => setLoading(false));
  };

  const chooseDifferentMail = () => {
    setShowConfirmButton(true);
    setFormErrors({});
  };

  const handleChangePasswordSuccess = () => {
    setIsForgotPassword(false);
    setShowConfirmButton(true);
    setIsShowingOtpInputs(false);
    showAlert("success", `סיסמה עודכנה בהצלחה`);
  };

  const showPasswordInputs = (show: boolean) => {
    if (!show) {
      setIsForgotPassword(false);
      setShowConfirmButton(true);
    } else {
      setIsForgotPassword(true);
      setShowConfirmButton(false);
    }
  };

  const emailInputY = useAnimatedValue(0);

  useEffect(() => {
    if (isForgotPassword) {
      if (isShowingOtpInputs) {
        Animated.timing(emailInputY, {
          toValue: -30,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(emailInputY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    } else {
      Animated.timing(emailInputY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isForgotPassword, isShowingOtpInputs]);

  return (
    <>
      <View style={[layout.justifyEnd, layout.itemsCenter, { height: height, width: width }]}>
        {loading && <Loader variant="Screen" />}
        <ImageBackground
          source={avihuFlyTrap}
          style={[
            {
              position: "absolute",
              top: 2,
              width: moderateScale(350, 2),
              height: moderateScale(700, 2),
              zIndex: 0,
            },
          ]}
        />
        <KeyboardAvoidingView
          behavior="padding"
          style={[
            { zIndex: 30, position: `absolute`, bottom: 80, width: width * 0.9 },
            spacing.gapXxl,
            spacing.pdSm,
          ]}
        >
          <View style={[layout.widthFull, spacing.gapDefault]}>
            <Animated.View style={[{ transform: [{ translateY: emailInputY }] }, spacing.gapSm]}>
              <Text style={[text.textRight, colors.textOnBackground, text.textBold]}>אימייל</Text>

              <TextInput
                style={[
                  text.textRight,
                  {
                    height: 45,
                  },
                ]}
                activeOutlineColor={colors.borderSecondary.borderColor}
                placeholder="הכנס אימייל"
                keyboardType={"email-address"}
                autoCorrect={false}
                multiline={Platform.OS === `ios`}
                autoComplete="email"
                error={Boolean(formErrors.email)}
                textContentType="emailAddress"
                onChangeText={(val) =>
                  setInputtedCredentials({
                    ...inputtedCrendentials,
                    email: val,
                  })
                }
                value={inputtedCrendentials.email}
              />
              <Text style={[text.textDanger, text.textRight, text.textBold]}>
                {formErrors.email}
              </Text>
              <ConditionalRender condition={isForgotPassword}>
                <TouchableOpacity onPress={() => showPasswordInputs(false)}>
                  <Text style={[colors.textPrimary, text.textCenter, text.textBold]}>
                    לא חשוב, נזכרתי
                  </Text>
                </TouchableOpacity>
              </ConditionalRender>
            </Animated.View>

            {!isForgotPassword && (
              <>
                <Animated.View style={[spacing.gapSm]}>
                  <View
                    style={[
                      layout.flexRow,
                      layout.itemsCenter,
                      layout.justifyBetween,
                      layout.widthFull,
                    ]}
                  >
                    <TouchableOpacity onPress={() => showPasswordInputs(true)}>
                      <Text
                        style={[
                          text.textRight,
                          colors.textOnSecondaryContainer,
                          text.textUnderline,
                        ]}
                      >
                        שכחתי סיסמה
                      </Text>
                    </TouchableOpacity>
                    <Text style={[text.textRight, colors.textOnSecondaryContainer, text.textBold]}>
                      סיסמה
                    </Text>
                  </View>

                  <TextInput
                    theme={{ colors: { primary: "transparent" } }}
                    underlineColor="transparent"
                    style={[
                      {
                        width: "100%",
                        height: 45,
                      },

                      text.textRight,
                    ]}
                    placeholder="הכנס סיסמה"
                    activeOutlineColor={colors.borderSecondary.borderColor}
                    secureTextEntry={!showPassword}
                    error={Boolean(formErrors.password)}
                    onChangeText={(val) =>
                      setInputtedCredentials({ ...inputtedCrendentials, password: val })
                    }
                    left={
                      <RNTextInput.Icon
                        onPress={() => setShowPassword((show) => !show)}
                        icon={showPassword ? "eye-off" : "eye"}
                      />
                    }
                  />
                  {formErrors.password && (
                    <Text style={[text.textDanger, text.textRight, text.textBold]}>
                      {formErrors.password}
                    </Text>
                  )}
                </Animated.View>

                {/* <Animated.View style={{ opacity: fadeValue }}>
                    <ForgotPassword
                      isRegistering
                      email={inputtedCrendentials.email}
                      onConfirmChangePasswordSuccess={handleChangePasswordSuccess}
                      onShowingOtpInputs={() => setIsShowingOtpInputs(true)}
                    />
                  </Animated.View> */}
              </>
            )}
            {isForgotPassword && (
              <ForgotPassword
                email={inputtedCrendentials.email}
                onConfirmChangePasswordSuccess={handleChangePasswordSuccess}
                onShowingOtpInputs={() => setIsShowingOtpInputs(true)}
              />
            )}
          </View>
          {/* Login button*/}
          <ConditionalRender condition={showConfirmButton}>
            <View style={[layout.center]}>
              <Button
                mode="contained-tonal"
                style={[{ width: 250, height: 40 }, common.rounded, colors.backgroundPrimary]}
                onPress={handleSubmit}
              >
                <Text style={[text.textBold]}>תכניס אותי</Text>
              </Button>
            </View>
          </ConditionalRender>
        </KeyboardAvoidingView>
      </View>
      <DismissKeyboard />
    </>
  );
}
