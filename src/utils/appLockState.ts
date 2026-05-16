let externalAppTransitionCount = 0;

export const beginExternalAppFlow = () => {
  externalAppTransitionCount += 1;
};

export const endExternalAppFlow = () => {
  externalAppTransitionCount = Math.max(0, externalAppTransitionCount - 1);
};

export const shouldSkipLockOnActive = () => externalAppTransitionCount > 0;
