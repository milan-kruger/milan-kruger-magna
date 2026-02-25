import { TypedUseSelectorHook, useDispatch, useSelector, shallowEqual } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// This prevents unnecessary re-renders when object contents haven't changed
export const useAppSelectorShallow = <TSelected,>(
  selector: (state: RootState) => TSelected
): TSelected => useSelector(selector, shallowEqual);
