import { Provider } from 'react-redux'
import { store } from '../redux/store'

const MockReduxProvider = ({ children }: any) => (
  <Provider store={store}>{children}</Provider>
);

export default MockReduxProvider;