import { getCurrUser } from "@/lib/appwrite";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
} from "react";
import { Models } from "react-native-appwrite";

interface ContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  user: Models.Document | null;
  setUser: Dispatch<SetStateAction<Models.Document | null>>;
  isLoading: boolean;
}

const GlobalContext = createContext<ContextProps | undefined>(undefined);

export const useGlobalContext = (): ContextProps => {
  const context = useContext(GlobalContext);
  if (context == undefined) {
    throw new Error("useAuth must be within an AuthProvider");
  }
  return context;
};

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<Models.Document | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    getCurrUser()
      .then((res) => {
        if (res) {
          setIsLoggedIn(true);
          setUser(res);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      })
      .catch((error: any) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);
  const contextValue = {
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    isLoading,
  };
  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
