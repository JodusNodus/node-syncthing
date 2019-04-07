const lowerCaseFirst = str => str.charAt(0).toLowerCase() + str.slice(1);

export default function eventCaller(req, retries, events) {
  let tries = 0;

  let stop = false;

  this.on("newListener", () => {
    if (stop) {
      stop = false;
      iterator(0);
    }
  });

  //Check if no listeners were left
  this.on("removeListener", (event, listener) => {
    if (this.listenerCount() < 1) {
      stop = true;
    }
    if (event == "newListener" || event == "removeListener") {
      this.on(event, listener);
    }
  });

  //Event request loop
  let iterator = since => {
    if (stop) {
      return;
    }

    let attr = [];
    attr.push({ key: "since", val: since });
    attr.push({ key: "events", val: events });

    req({ method: "events", endpoint: false, attr })
      .then(eventArr => {
        //Check for event count on first request iteration
        if (since != 0) {
          eventArr.forEach(e => {
            this.emit(lowerCaseFirst(e.type), e.data);
          });
        }

        //Update event count
        if (eventArr.length > 0) {
          since = eventArr[eventArr.length - 1].id;
        }

        //Reset tries
        tries = 0;

        setTimeout(() => iterator(since), 100);
      })
      .catch(err => {
        this.emit("error", err);

        //Try to regain connection & reset event counter
        if (tries < retries) {
          tries++;
          setTimeout(() => iterator(0), 500);
        }
      });
  };

  iterator(0);
}
