import { LoadingState } from './loading-state';

export function LoadingSkeleton(props: React.ComponentProps<typeof LoadingState>) {
  return <LoadingState {...props} />;
}
