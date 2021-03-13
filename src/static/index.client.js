/* eslint-env browser */
(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const message = window.document.getElementById('message');
  if (urlParams.has('err')) {
    let err;
    switch (urlParams.get('err')) {
      case '1':
        err = 'Wrong input: please enter a full URL to shorten';
        break;
      case '2':
        err = 'Internal server error (sorry)';
        break;
      case '3':
        err = 'Malformed input';
        break;
      default:
        err = 'An unknown error happened :(';
        break;
    }
    message.innerHTML = err;
  }

  if (urlParams.has('id')) {
    const url = `${window.location.origin}/e/${urlParams.get('id')}`;
    message.innerHTML = `Take it while it's hot: <code>${url}</code>`;
  }
})();
