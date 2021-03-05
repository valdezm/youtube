import React, { useContext } from "react";
import { useImmerReducer } from "use-immer";
import { login } from "./utils";

type Todo = { title: string; completed: boolean };
const presetTodos: Todo[] = [
  {
    title: "Get milk",
    completed: true,
  },
  {
    title: "Make YouTube video",
    completed: false,
  },
  {
    title: "Write blog post",
    completed: false,
  },
];

const initialState: LoginState = {
  username: "",
  password: "",
  isLoading: false,
  error: "",
  isLoggedIn: false,
  variant: "login",
  todos: presetTodos,
};

interface LoginState {
  username: string;
  password: string;
  isLoading: boolean;
  error: string;
  isLoggedIn: boolean;
  variant: "login" | "forgetPassword";
  todos: Todo[];
}

type LoginAction =
  | { type: "login" | "success" | "error" | "logOut" }
  | { type: "field"; fieldName: string; payload: string }
  | { type: "toggleTodoCompleted"; payload: string };

function loginReducer(draft: LoginState, action: LoginAction) {
  switch (action.type) {
    case "field": {
      draft[action.fieldName as "username" | "password"] = action.payload;
      return;
    }
    case "login": {
      draft.error = "";
      draft.isLoading = true;
      return;
    }
    case "success": {
      draft.isLoggedIn = true;
      return;
    }
    case "error": {
      draft.error = "Incorrect username or password!";
      draft.isLoggedIn = false;
      draft.isLoading = false;
      draft.username = "";
      draft.password = "";
      return;
    }
    case "logOut": {
      draft.isLoggedIn = false;
      draft.isLoading = false;
      draft.username = "";
      draft.password = "";
      return;
    }
    case "toggleTodoCompleted": {
      const todo = draft.todos.find((item) => item.title === action.payload);
      if (todo) todo.completed = !todo.completed;
      break;
    }
    default:
  }
}

const StateContext = React.createContext<LoginState | null>(null);
const DispatchContext = React.createContext<React.Dispatch<any> | null>(null);

export default function LoginWithContextTypescript() {
  const [state, dispatch] = useImmerReducer(loginReducer, initialState);
  const {
    username,
    password,
    isLoading,
    error,
    isLoggedIn,
    todos,
  } = state as LoginState;
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    dispatch({ type: "login" });

    try {
      await login({ username, password });
      dispatch({ type: "success" });
    } catch (err) {
      dispatch({ type: "error" });
    }
  };

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        <div className="App useContext">
          <div className="login-container">
            {isLoggedIn ? (
              <>
                <h1>Welcome {username}!</h1>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "logOut" })}
                >
                  Log Out
                </button>
              </>
            ) : (
              <form className="form" onSubmit={onSubmit}>
                {error && <p className="error">{error}</p>}
                <p>Please Login!</p>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) =>
                    dispatch({
                      type: "field",
                      fieldName: "username",
                      payload: e.currentTarget.value,
                    })
                  }
                />
                <input
                  type="password"
                  placeholder="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    dispatch({
                      type: "field",
                      fieldName: "password",
                      payload: e.currentTarget.value,
                    })
                  }
                />
                <button className="submit" type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
              </form>
            )}
          </div>

          <TodoPage theTodos={todos} />
        </div>
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
}
interface TodoProps {
  theTodos: Todo[];
}
function TodoPage({ theTodos }: TodoProps) {
  return (
    <div className="todoContainer">
      <h2>Todos</h2>
      {theTodos.map((item: Todo) => (
        <TodoItem key={item.title} {...item} />
      ))}
    </div>
  );
}

function TodoItem({ title, completed }: Todo) {
  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);
  const { isLoggedIn } = state as LoginState;
  return (
    <div className="todoItem">
      <p>{title}</p>
      <div>
        <input
          type="checkbox"
          checked={completed}
          onClick={() => {
            if (!isLoggedIn) {
              alert("Please login to click this!");
            }
          }}
          onChange={() => {
            if (isLoggedIn && dispatch) {
              dispatch({ type: "toggleTodoCompleted", payload: title });
            }
          }}
        />
      </div>
    </div>
  );
}
