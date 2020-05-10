import { format } from 'date-fns';

function formatMessage(username, text) {
  return {
    username,
    text,
    time: format(new Date(), 'HH:mm:ss')
  };
}

export default formatMessage;
