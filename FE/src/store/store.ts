import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import postReducer from './postSlice';
import commentReducer from './commentSlice';
import appointmentReducer from './appointmentSlice';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

const rootReducer = combineReducers({
    user: userReducer,
    posts: postReducer,
    comments: commentReducer,
    appointments: appointmentReducer,
});

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
