import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { stacks } from "./stacks/WorkoutPlanStacks";

const Stack = createNativeStackNavigator();

const WorkoutPlanStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="WorkoutPlan"
      screenOptions={{
        headerShown: false,
      }}
    >
      {stacks.map((stack) => (
        <Stack.Screen
          key={stack.name}
          options={{ title: stack.title }}
          name={stack.name}
          component={stack.component}
        />
      ))}
    </Stack.Navigator>
  );
};

export default WorkoutPlanStack;
