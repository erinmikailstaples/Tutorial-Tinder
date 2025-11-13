import { useSpring, animated, to } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Repository, ProjectSuggestion } from "@shared/schema";
import { RepoCard } from "./repo-card";

interface SwipeableCardProps {
  repo: Repository;
  readmePreview?: string;
  suggestions?: ProjectSuggestion;
  onSave: () => void;
  onSkip: () => void;
  onLaunch: () => void;
  onConvertToTemplate?: () => void;
  style?: React.CSSProperties;
  isTop: boolean;
  index: number;
}

export function SwipeableCard({
  repo,
  readmePreview,
  suggestions,
  onSave,
  onSkip,
  onLaunch,
  onConvertToTemplate,
  style,
  isTop,
  index,
}: SwipeableCardProps) {
  const [{ x, y, rotateZ }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotateZ: 0,
  }));

  const bind = useDrag(
    ({ active, movement: [mx, my], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2; // Velocity threshold for automatic swipe
      const dir = xDir < 0 ? -1 : 1; // Direction of swipe

      if (!active && trigger) {
        // Auto-complete the swipe
        const flyOutX = (200 + window.innerWidth) * dir;
        api.start({ x: flyOutX, rotateZ: dir * 45, config: { friction: 50 } });
        
        // Trigger appropriate action based on direction
        setTimeout(() => {
          if (dir === 1) {
            onSave();
          } else {
            onSkip();
          }
        }, 300);
      } else if (!active) {
        // Snap back to center
        api.start({ x: 0, y: 0, rotateZ: 0, config: { friction: 50, tension: 500 } });
      } else {
        // Follow the drag
        const rotateValue = (mx / window.innerWidth) * 45;
        api.start({ x: mx, y: my, rotateZ: rotateValue, immediate: true });
      }
    },
    { 
      filterTaps: true,
      rubberband: true,
    }
  );

  // Calculate base transform from parent style
  const scale = 1 - index * 0.05;
  const yOffset = index * 8;

  return (
    <animated.div
      {...(isTop ? bind() : {})}
      style={{
        ...style,
        transform: to([x, y, rotateZ], (x, y, r) => 
          `scale(${scale}) translateY(${yOffset}px) translate3d(${x}px, ${y}px, 0) rotateZ(${r}deg)`
        ),
        touchAction: 'none',
        cursor: isTop ? 'grab' : 'default',
      }}
      className="absolute inset-0"
    >
      <RepoCard
        repo={repo}
        readmePreview={readmePreview}
        suggestions={suggestions}
        onSave={onSave}
        onSkip={onSkip}
        onLaunch={onLaunch}
        onConvertToTemplate={onConvertToTemplate}
      />
      
      {/* Swipe indicators */}
      {isTop && (
        <>
          <animated.div
            style={{
              opacity: x.to((val) => Math.max(0, Math.min(1, val / 100))),
            }}
            className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg transform rotate-12 pointer-events-none"
          >
            SAVE
          </animated.div>
          <animated.div
            style={{
              opacity: x.to((val) => Math.max(0, Math.min(1, -val / 100))),
            }}
            className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg transform -rotate-12 pointer-events-none"
          >
            SKIP
          </animated.div>
        </>
      )}
    </animated.div>
  );
}
