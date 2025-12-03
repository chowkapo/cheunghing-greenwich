import { PayloadAction, createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { IImsTransactApi, imsTransactApi } from '../../api/imsTransactApi';
import { sensorRecordCountLimit } from '../../resources/config';
import { TEvent, TEventState, TIMSTransactRecord } from '../../resources/types';
import getErrorMessage from '../../utils/getErrorMessage';
import { classifyAlert } from '../../utils/helper';
import { login, logout } from '../user/userSlice';

const initialState: TEventState = {
  isRetrieving: false,
  lastTransactionId: null,
  events: [],
  error: null,
};

type TEventData = {
  events: TIMSTransactRecord[];
  locationMask?: number;
};

export const getNewEvents = createAsyncThunk<TEventData, IImsTransactApi>(
  'event/update',
  async ({ transactionId, authenticationToken, locationMask }: IImsTransactApi, thunkApi) => {
    try {
      // const currentState = thunkApi.getState() as TEventState
      // if (currentState.isRetrieving) {
      //     return currentState.
      // }
      // console.debug('before calling IMS transact API');
      const response = await imsTransactApi({
        transactionId,
        authenticationToken,
        locationMask
      });
      // console.debug(
      //   `IMS transaction api response = ${JSON.stringify(response).substring(
      //     0,
      //     100,
      //   )}`,
      // );
      if (!Array.isArray(response)) {
        throw new TypeError('Response format error');
      }
      return {
        events: [...response] as TIMSTransactRecord[],
        locationMask
      } as TEventData;
    } catch (err) {
      return thunkApi.rejectWithValue(
        getErrorMessage(err) || 'Error getting event updates',
      );
    }
  },
  {
    condition: (_arg, { getState }) => {
      const currentState = getState() as { event: TEventState };
      const { isRetrieving } = (currentState?.event as TEventState) ?? {};
      if (isRetrieving) {
        // console.debug('### IMS: previous call has not ended yet');
        return false;
      } else {
        // console.debug('### IMS: no calls pending. can proceed');
        return true;
      }
    },
  },
);

export const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    purgeEvents: state => {
      state.isRetrieving = false;
      state.events = [];
      state.error = null;
    },
    acknowledgeEvents: (state, action: PayloadAction<number[]>) => {
      state.events.forEach(event => {
        if (action.payload.includes(event.record.transID)) {
          event.acknowledged = true;
        }
      });
      state.events = state.events.slice(0, sensorRecordCountLimit);
    },
    clearAcknowledgments: state => {
      state.events.forEach((event, index) => {
        if (index < 50) {
          event.acknowledged = false;
        }
      });
    },
  },
  extraReducers: builder => {
    builder.addCase(getNewEvents.pending, state => {
      state.isRetrieving = true;
      state.error = null;
    });
    builder.addCase(getNewEvents.rejected, (state, { payload }) => {
      state.isRetrieving = false;
      state.error = payload as string;
      // console.debug(
      //   `### IMS, rejected, final state = ${JSON.stringify(state).substring(
      //     0,
      //     100,
      //   )}`,
      // );
    });
    builder.addCase(getNewEvents.fulfilled, (state, { payload }) => {
      state.isRetrieving = false;
      state.error = null;

      if (
        payload.events?.[0]?.transID > 0 &&
        state.lastTransactionId !== payload.events[0].transID
      ) {
        const previousLastTransId = state.lastTransactionId;
        state.lastTransactionId = payload.events[0].transID;

        const newEvents = payload.events
          .filter(
            imsTransactRrecord =>
              imsTransactRrecord.transID > (previousLastTransId ?? 0),
          )
          .map(imsTransactRrecord => {
            const { controllerID, ioType, pointID } = imsTransactRrecord;
            return {
              acknowledged: false,
              record: imsTransactRrecord,
              system: classifyAlert({ controllerID, ioType, pointID }),
            };
          }) as unknown as TEvent[];

        const combinedEvents = [...newEvents, ...state.events];
        state.events = combinedEvents.slice(0, sensorRecordCountLimit);
      } else {
        // console.debug('### IMS, fulfilled, no new records');
      }
    });

    builder.addMatcher(isAnyOf(login.fulfilled, logout), (state: TEventState, { payload }) => {
      console.debug(`eventSlice login fulfilled, payload: ${JSON.stringify(payload)}`);
      state.isRetrieving = false;
      state.lastTransactionId = null;
      state.events = [];
      state.error = null;
    })
  },
});

export const { purgeEvents, acknowledgeEvents, clearAcknowledgments } =
  eventSlice.actions;

export default eventSlice.reducer;
