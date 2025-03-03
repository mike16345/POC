import useStyles from "@/styles/useGlobalStyles";
import PasswordIndicatorItem from "./PasswordIndicatorItem";
import { View } from "react-native";
import { Text } from "../ui/Text";

interface PasswordIndicatorProps {
  password: string;
}

const PasswordIndicator: React.FC<PasswordIndicatorProps> = ({ password }) => {
  const { text, spacing, colors, common } = useStyles();

  const DIGIT_REGEX = /\d/;
  const SPECIAL_CHAR_REGEX = /[!@#$%]/;
  const UPPERCASE_REGEX = /[A-Z]/;
  const LENGTH_REGEX = /^.{8,}$/;

  const passwordIndicators = [
    { message: "8 תווים או יותר", checked: LENGTH_REGEX.test(password) },
    { message: "אות גדולה אחת באנגלית או יותר", checked: UPPERCASE_REGEX.test(password) },
    { message: "מספר אחד או יותר", checked: DIGIT_REGEX.test(password) },
    {
      message: "לפחות אחד מהסימנים הבאים: ! @ # $ %",
      checked: SPECIAL_CHAR_REGEX.test(password),
    },
  ];

  return (
    <View style={[spacing.pdDefault, common.rounded, { backgroundColor: "rgba(77, 77, 77, 0.8)" }]}>
      <Text style={[colors.textOnSecondaryContainer, text.textCenter, text.textBold]}>
        דגשים לסיסמה
      </Text>

      {passwordIndicators.map(({ checked, message }, i) => (
        <PasswordIndicatorItem checked={checked} message={message} key={i} />
      ))}
    </View>
  );
};

export default PasswordIndicator;
