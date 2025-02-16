import { FC } from "react";
import { TextInput as RNPTextInput, TextInputProps } from "react-native-paper";

const TextInput: FC<TextInputProps> = ({ style, ...props }) => {
  return (
    <RNPTextInput
      theme={{ colors: { primary: "transparent" } }}
      underlineColor="transparent"
      style={[
        {
          textAlign: "right",
          borderRadius: 9,
          height: 44,
          borderTopLeftRadius: 9,
          borderTopRightRadius: 9,
          backgroundColor: "rgba(256, 256, 256, 0.3)",
        },
        style,
      ]}
      {...props}
    />
  );
};

export default TextInput;
