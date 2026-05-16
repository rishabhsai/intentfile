import { Composition } from "remotion";
import { IntentfileGoalVideo } from "./IntentfileGoalVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="IntentfileGoal"
      component={IntentfileGoalVideo}
      durationInFrames={1440}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
