import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Modal,
  BackHandler,
  ImageBackground,
} from "react-native";
import { useNavigationState } from "@react-navigation/native";
import workoutPage from "@assets/avihu/workoutPage.jpeg";
import dietScreen from "@assets/avihu/dietScreen.jpeg";
import progressPage from "@assets/avihu/progressPage.jpeg";

const { height } = Dimensions.get("window");

interface BottomDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  heightVariant?: `auto` | `fixed`;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  open,
  onClose,
  children,
  heightVariant = `fixed`,
}) => {
  const { colors, spacing } = useStyles();
  const activePageIndex = useNavigationState((state) => state.index);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsVisible(true); // Show the modal when open is true
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false)); // Hide modal after animation completes
    }
  }, [open]);

  useEffect(() => {
    const onBackPress = () => {
      onClose();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => backHandler.remove();
  }, []);

  return (
    <Modal transparent visible={open} animationType="fade">
      <TouchableOpacity style={[styles.overlay]} onPress={onClose} activeOpacity={1}>
        <ImageBackground
          source={
            activePageIndex == 0
              ? workoutPage
              : activePageIndex == 1
              ? dietScreen
              : activePageIndex == 2
              ? progressPage
              : workoutPage
          }
          style={styles.overlay}
          blurRadius={50}
        />
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.drawerContainer,
          colors.background,
          {
            borderWidth: 1,
            borderBottomWidth: 0,
            height: heightVariant === `fixed` ? height * 0.6 : `auto`,
          },
          colors.borderSecondaryContainer,
          spacing.pdBottomBar,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.drawerContent}>{children}</View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  drawerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
});

export default BottomDrawer;
