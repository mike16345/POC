import {
  View,
  TouchableWithoutFeedback,
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
import avihuFlyTrap from "@assets/avihuFlyTrap.jpeg";
import { testEmail } from "@/utils/utils";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Button, TextInput } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import { moderateScale } from "react-native-size-matters";
import { useUserApi } from "@/hooks/api/useUserApi";
import Toast, { ToastType } from "react-native-toast-message";
import ConfirmPassword from "./ConfirmPassword";
import Loader from "../ui/loaders/Loader";
import { useUserStore } from "@/store/userStore";
import { IUser } from "@/interfaces/User";
import { Text } from "../ui/Text";
import ForgotPassword from "./ForgotPassword";
import { EMAIL_ERROR, INVALID_PASSWORD_MATCH } from "@/constants/Constants";

interface IUserCredentials {
  email: string;
  password: string;
}

export interface ICredentialsErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface ILoginProps {
  onLogin: (user: IUser) => void;
}

export default function Login({ onLogin }: ILoginProps) {
  const { text, colors, fonts, layout, spacing, common } = useStyles();
  const { checkEmailAccess, registerUser, loginUser } = useUserApi();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const { height, width } = useWindowDimensions();

  const { setItem } = useAsyncStorage("sessionToken");

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [confirmPassword, setConfirmPassowrd] = useState<string>(``);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});
  const [emailChecked, setEmailchecked] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const showAlert = (type: ToastType, message: string) => {
    Toast.show({
      text1: message,
      autoHide: true,
      type: type,
      swipeable: true,
      text1Style: { textAlign: `center` },
    });
  };

  const handleSubmit = () => {
    const { email, password } = inputtedCrendentials;
    const formattedEmail = email.toLowerCase().trim();
    const errors: ICredentialsErrors = {};

    Keyboard.dismiss();

    if (!testEmail(formattedEmail)) {
      errors[`email`] = EMAIL_ERROR;
    }

    if (emailChecked && !password) {
      errors[`password`] = `אנא הזינו סיסמה`;
    }

    if (emailChecked && password !== confirmPassword) {
      errors[`confirmPassword`] = INVALID_PASSWORD_MATCH;
    }

    if (errors[`email`] || errors[`password`] || (!userRegistered && errors[`confirmPassword`])) {
      setFormErrors(errors);
      return;
    }

    if (!emailChecked) {
      setLoading(true);
      checkEmailAccess(formattedEmail)
        .then((res) => {
          showAlert("success", res.message);
          setEmailchecked(true);
          if (res.data.hasPassword) {
            setUserRegistered(true);
          }
        })
        .catch((err) => {
          showAlert("error", err.response?.data.message);
        })
        .finally(() => setLoading(false));
    }

    if (emailChecked && !userRegistered) {
      setLoading(true);
      registerUser(formattedEmail, password)
        .then((res) => {
          showAlert("success", res.message);
          setUserRegistered(true);
        })
        .catch((err) => {
          showAlert("error", err.response?.data.message);
        })
        .finally(() => setLoading(false));
    }

    if (emailChecked && userRegistered) {
      setLoading(true);
      loginUser(formattedEmail, password)
        .then((res) => {
          console.log("!!!!! login response !!!!!!!", res.data);
          showAlert("success", res.message);
          onLogin(res.data.data.user);
          setCurrentUser(res?.data.data.user);
          setItem(JSON.stringify(res.data));
        })
        .catch((err) => {
          showAlert("error", err.response.data.message);
        })
        .finally(() => setLoading(false));
    }
  };

  const chooseDifferentMail = () => {
    setEmailchecked(false);
    setUserRegistered(false);
    setFormErrors({});
  };

  const emailInputY = useAnimatedValue(0);
  const fadeValue = useAnimatedValue(0);

  useEffect(() => {
    if (emailChecked) {
      Animated.timing(emailInputY, {
        toValue: -30,
        duration: 800,
        useNativeDriver: true,
      }).start();

      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(emailInputY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();

      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [emailChecked, userRegistered, isForgotPassword]);

  return (
    <>
      <View style={[layout.center, { height: height, width: width }]}>
        {loading && <Loader variant="Screen" />}
        <ImageBackground
          source={avihuFlyTrap}
          style={[
            layout.center,
            layout.flex1,
            {
              width: moderateScale(350, 2),
              height: moderateScale(700, 2),
              zIndex: 0,
            },
          ]}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={[
              colors.background,
              {
                position: `absolute`,
                top: 0,
                left: 0,
                zIndex: 10,
                opacity: 0.7,
                height: height,
                width: width,
              },
            ]}
          ></View>
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior="padding"
          style={[
            layout.center,
            spacing.gapXl,
            { zIndex: 30, position: `absolute`, width: width * 0.7 },
          ]}
        >
          <Animated.View style={{ transform: [{ translateY: emailInputY }] }}>
            <Text style={[colors.textOnBackground, text.textBold, fonts.xxxl]}>כניסה לחשבון</Text>
          </Animated.View>
          <View style={[layout.widthFull, spacing.gapLg]}>
            {(!emailChecked || isForgotPassword) && (
              <Animated.View style={{ transform: [{ translateY: emailInputY }] }}>
                <Text
                  style={[
                    text.textRight,
                    spacing.pdHorizontalXs,
                    colors.textOnBackground,
                    text.textBold,
                  ]}
                >
                  כתובת מייל
                </Text>
                <TextInput
                  style={[{ width: "100%" }, text.textLeft, colors.background]}
                  mode="outlined"
                  activeOutlineColor={colors.borderSecondary.borderColor}
                  placeholder="user@example.com"
                  keyboardType={"email-address"}
                  autoCorrect={false}
                  multiline={Platform.OS === `ios` ? true : false}
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
              </Animated.View>
            )}
            {isForgotPassword && (
              <ForgotPassword
                email={inputtedCrendentials.email}
                onConfirmChangePasswordSuccess={() => setIsForgotPassword(false)}
              />
            )}
            {!isForgotPassword && emailChecked && (
              <>
                <Animated.View
                  style={[spacing.gapDefault, { transform: [{ translateY: emailInputY }] }]}
                >
                  <View
                    style={[spacing.pdDefault, colors.backgroundSecondaryContainer, common.rounded]}
                  >
                    <Text
                      style={[
                        fonts.default,
                        text.textBold,
                        colors.textOnBackground,
                        text.textCenter,
                      ]}
                    >
                      {inputtedCrendentials.email}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={chooseDifferentMail}>
                    <Text style={[colors.textPrimary, text.textCenter, text.textBold]}>
                      התחברות באמצעות מייל אחר
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
                {userRegistered && (
                  <Animated.View style={{ opacity: fadeValue }}>
                    <Text
                      style={[
                        text.textRight,
                        colors.textOnSecondaryContainer,
                        text.textBold,
                        spacing.pdHorizontalXs,
                      ]}
                    >
                      סיסמה
                    </Text>
                    <TextInput
                      style={[text.textRight, { width: "100%" }]}
                      mode="outlined"
                      activeOutlineColor={colors.borderSecondary.borderColor}
                      secureTextEntry={!showPassword}
                      error={Boolean(formErrors.password)}
                      onChangeText={(val) =>
                        setInputtedCredentials({ ...inputtedCrendentials, password: val })
                      }
                      left={
                        <TextInput.Icon
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
                    <TouchableOpacity onPress={() => setIsForgotPassword(true)}>
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
                  </Animated.View>
                )}
                {!userRegistered && (
                  <Animated.View style={{ opacity: fadeValue }}>
                    <ConfirmPassword
                      errors={formErrors}
                      handlePasswordChange={(val) =>
                        setInputtedCredentials({ ...inputtedCrendentials, password: val })
                      }
                      handlePasswordConfirmChange={(val) => setConfirmPassowrd(val)}
                    />
                  </Animated.View>
                )}
              </>
            )}
          </View>
          {!isForgotPassword && (
            <Button
              mode="contained-tonal"
              style={[layout.widthFull, common.rounded, colors.backgroundPrimary]}
              onPress={handleSubmit}
            >
              אישור
            </Button>
          )}
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
