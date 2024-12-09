import { View, BackHandler, TouchableOpacity } from "react-native";
import { FC, useEffect, useState } from "react";
import { useOTPApi } from "@/hooks/api/useOTPApi";
import useStyles from "@/styles/useGlobalStyles";
import { Button, TextInput } from "react-native-paper";
import { testEmail } from "@/utils/utils";
import { EMAIL_ERROR, INVALID_PASSWORD_MATCH } from "@/constants/Constants";
import ConfirmPassword from "./ConfirmPassword";
import { usePasswordsApi } from "@/hooks/api/usePasswordsApi";
import { ICredentialsErrors } from "./Login";
import { Text } from "../ui/Text";
import Loader from "../ui/loaders/Loader";

interface IForgotPassword {
  email: string;
  onConfirmChangePasswordSuccess: () => void;
}

const ForgotPassword: FC<IForgotPassword> = ({ email, onConfirmChangePasswordSuccess }) => {
  const { getOTP, validateOTP } = useOTPApi();
  const { changePassword } = usePasswordsApi();

  const { colors, spacing, layout, text, common } = useStyles();

  const [formErrors, setFormErrors] = useState<ICredentialsErrors & { otp?: string }>({});
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpConfirmed, setIsOtpConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmPasswordChange = async () => {
    if (confirmPassword !== password) {
      setFormErrors({ ...formErrors, ["confirmPassword"]: INVALID_PASSWORD_MATCH });
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(email, password, sessionId);
      onConfirmChangePasswordSuccess();
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["password"]: error?.response?.data?.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetOtp = async () => {
    if (!testEmail(email)) {
      setFormErrors({ ...formErrors, ["email"]: EMAIL_ERROR });
      return;
    }

    try {
      setIsLoading(true);
      const res = await getOTP(email!);
      console.log(JSON.stringify(res, undefined, 2));
      setShowOtpInput(true);
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: error?.response?.data?.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || otp.length !== 6) {
      setFormErrors({ ...formErrors, ["otp"]: "קוד האימות חייב להיות בעל 6 ספרות" });
      return;
    }

    try {
      setIsLoading(true);
      const sessionId = (await validateOTP(email, otp))?.data?.changePasswordSessionId || "";
      setSessionId(sessionId);
      setIsOtpConfirmed(true);
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: error?.response?.data?.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      console.log("Back button pressed");
      return true;
    });
  }, []);

  if (isLoading)
    return (
      <View style={[spacing.pdLg]}>
        <Loader />
      </View>
    );

  return (
    <View style={[]}>
      {!showOtpInput && (
        <>
          <Button
            mode="contained"
            style={[common.rounded]}
            textColor={colors.textOnBackground.color}
            onPress={handleGetOtp}
          >
            שלח קוד אימות
          </Button>
        </>
      )}
      {showOtpInput && !isOtpConfirmed && (
        <>
          <Text
            style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground, text.textBold]}
          >
            קוד אימות
          </Text>
          <View style={[spacing.gapLg]}>
            <View>
              <TextInput
                style={[{ width: "100%" }, text.textCenter, colors.background]}
                mode="outlined"
                activeOutlineColor={colors.borderSecondary.borderColor}
                placeholder="קוד אימות בעל 6 ספרות"
                error={!!formErrors["otp"]}
                keyboardType="numeric"
                maxLength={6}
                textContentType="oneTimeCode"
                onChangeText={(val) => setOtp(val)}
                value={otp}
              />
              {formErrors["otp"] && (
                <Text style={[text.textDanger, text.textCenter, text.textBold]}>
                  {formErrors["otp"]}
                </Text>
              )}
              <TouchableOpacity onPress={() => getOTP(email)}>
                <Text style={[colors.textOnBackground, text.textUnderline, text.textRight]}>
                  לא קיבלתי, שלח שוב
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              mode="contained"
              style={[common.rounded]}
              textColor={colors.textOnBackground.color}
              onPress={handleValidateOtp}
            >
              אישור
            </Button>
          </View>
        </>
      )}
      {isOtpConfirmed && (
        <View>
          <ConfirmPassword
            errors={formErrors}
            handlePasswordChange={(val) => setPassword(val)}
            handlePasswordConfirmChange={(val) => setConfirmPassword(val)}
          />
          <Button
            mode="contained"
            style={common.rounded}
            textColor={colors.textOnBackground.color}
            onPress={handleConfirmPasswordChange}
          >
            Change Password
          </Button>
        </View>
      )}
    </View>
  );
};

export default ForgotPassword;
