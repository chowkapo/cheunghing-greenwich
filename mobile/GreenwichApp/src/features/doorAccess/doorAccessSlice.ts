import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  TACSTransactResponse,
  TAccessRecord,
  TDoorAccessState,
} from '../../resources/types';
import getErrorMessage from '../../utils/getErrorMessage';
import {IAcsTransactApi, acsTransactApi} from '../../api/acsTransactApi';
import {doorAccessRecordDisplayLimit} from '../../resources/config';

type TDoorAccessData = {
  doorAccessRecords: TACSTransactResponse[];
};

const initialState: TDoorAccessState = {
  isRetrieving: false,
  lastTransactionId: null,
  // retrievingUpdates: false,
  doorAccessRecords: [],
  error: null,
};

export const getDoorAccessUpdates = createAsyncThunk<
  TDoorAccessData,
  IAcsTransactApi
>(
  'doorAccess/update',
  async ({transactionId, authenticationToken}: IAcsTransactApi, thunkApi) => {
    try {
      // console.debug(
      //   `before calling ACS transact API, transactionId=${transactionId}`,
      // );
      const response = await acsTransactApi({
        transactionId,
        authenticationToken,
      });
      // console.debug(`transaction api response = ${JSON.stringify(response)}`);
      if (!Array.isArray(response)) {
        throw new TypeError('Response format error');
      }
      return {
        doorAccessRecords: [...response] as TACSTransactResponse[],
      } as TDoorAccessData;
    } catch (err) {
      return thunkApi.rejectWithValue(
        getErrorMessage(err) || 'Error getting door access updates',
      );
    }
  },
  {
    condition: (_arg, {getState}) => {
      const currentState = getState();
      // console.debug(`### ACS: currentState = ${JSON.stringify(currentState)}`)
      const {isRetrieving} = (currentState?.doorAccess as TDoorAccessState) ?? {};
      if (isRetrieving) {
        // console.debug('### ACS: previous call has not ended yet');
        return false;
      } else {
        // console.debug('### ACS: no calls pending. can proceed');
        return true;
      }
    },
  },
);

export const doorAccessSlice = createSlice({
  name: 'doorAccess',
  initialState,
  reducers: {
    clearDoorAccessRecords: state => {
      state.isRetrieving = false;
      state.doorAccessRecords = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(getDoorAccessUpdates.pending, (state: TDoorAccessState) => {
      state.isRetrieving = true;
      state.error = null;
    });
    builder.addCase(
      getDoorAccessUpdates.rejected,
      (state: TDoorAccessState, {payload}) => {
        state.isRetrieving = false;
        state.error = payload as string;
        // console.debug(
        //   `### ACS, rejected, final state = ${JSON.stringify(state)}`,
        // );
      },
    );
    builder.addCase(
      getDoorAccessUpdates.fulfilled,
      (state: TDoorAccessState, {payload}) => {
        // console.debug(
        //   `### ACS, payload = ${JSON.stringify(payload).substring(0, 100)}`,
        // );
        state.isRetrieving = false;
        state.error = null;
        if (
          payload.doorAccessRecords?.[0]?.transID > 0 && state.lastTransactionId !== payload.doorAccessRecords?.[0]?.transID
        ) {
          state.lastTransactionId =
            payload.doorAccessRecords?.[0]?.transID ?? 0;
          const combinedAccessRecords = [
            ...(payload.doorAccessRecords.map(t => ({
              id: t.transID ?? 0,
              cardNo: t.card?.cardNo ?? '',
              name: t.field2 ?? '',
              unit: t.field1 ?? '',
              location: t.reader?.readerName ?? '',
              accessTime: t.transDateTime ?? '',
              status: t.eventType?.description ?? '',
            })) as unknown as TAccessRecord[]),
            ...state.doorAccessRecords,
          ];
          const uniqueAccessRecords = [] as TAccessRecord[];
          combinedAccessRecords.forEach(v1 => {
            if (!uniqueAccessRecords.find(v2 => v2.id === v1.id)) {
              uniqueAccessRecords.push(v1);
            }
          });
          state.doorAccessRecords = uniqueAccessRecords.slice(
            0,
            doorAccessRecordDisplayLimit,
          );
          // console.debug(
          //   `### ACS, fulfilled, final state = ${JSON.stringify(
          //     state,
          //   ).substring(0, 100)}`,
          // );
        } else {
          // console.debug('### ACS, fulfilled, no new records')
        }
      },
    );
  },
});

export const {clearDoorAccessRecords} = doorAccessSlice.actions;

export default doorAccessSlice.reducer;
