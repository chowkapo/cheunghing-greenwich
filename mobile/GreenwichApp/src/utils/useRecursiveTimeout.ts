import * as React from 'react';

// Ref: https://www.aaron-powell.com/posts/2019-09-23-recursive-settimeout-with-react-hooks/

function useRecursiveTimeout<t>(
  callback: (() => Promise<t>) | (() => void),
  delay: number | null,
  pollId: number,
) {
  const savedCallback = React.useRef(callback);
  const savedDelay = React.useRef(delay);
  const savedPollId = React.useRef(pollId);

  // Remember the latest callback.
  React.useEffect(() => {
    // console.debug('remember callback()');
    savedCallback.current = callback;
  }, [callback]);

  // Remember the latest delay.
  React.useEffect(() => {
    // console.debug(`remember delay = ${delay}`);
    savedDelay.current = delay;
  }, [delay]);

  // Remember the latest poll id.
  React.useEffect(() => {
    // console.debug(`remember pollId = ${pollId}`);
    savedPollId.current = pollId;
  }, [pollId]);

  // Set up the timeout loop.
  React.useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    function tick() {
      if (savedPollId.current !== pollId) {
        // console.debug('pollId differs. no need to call');
        return;
      }
      // console.debug('calling callback once');
      const ret = savedCallback.current();
      if (ret instanceof Promise) {
        ret.then(() => {
          if (savedPollId.current !== pollId) {
            // console.debug('pollId differs. no need to schedule another call');
            return;
          }
          if (savedDelay.current !== null) {
            // console.debug(
            //   `schedule another call with delay ${savedDelay.current}`,
            // );
            id = setTimeout(tick, savedDelay.current);
          }
        });
      } else {
        if (savedPollId.current !== pollId) {
          // console.debug('pollId differs. no need to schedule another call');
          return;
        }
        if (savedDelay.current !== null) {
          // console.debug(
          //   `schedule another call with delay ${savedDelay.current}`,
          // );
          id = setTimeout(tick, savedDelay.current);
        }
      }
    }
    if (savedDelay.current !== null) {
      // console.debug(`schedule another call with delay ${savedDelay.current}`);
      id = setTimeout(tick, savedDelay.current);
      return () => {
        // console.debug(`clear scheduled call #${id}`);
        id && clearTimeout(id);
      };
    }
  }, [delay, pollId]);
}

export default useRecursiveTimeout;
