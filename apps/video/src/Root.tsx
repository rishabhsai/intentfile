import { Composition } from "remotion";
import { IntentfileGoalVideo, intentfileGoalVideoFrames } from "./IntentfileGoalVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="IntentfileGoal"
      component={IntentfileGoalVideo}
      durationInFrames={intentfileGoalVideoFrames}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
